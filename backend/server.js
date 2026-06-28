import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';

import User     from './models/User.js';
import Question from './models/Question.js';
import MockTest from './models/MockTest.js';
import Attempt  from './models/Attempt.js';
import Feedback from './models/Feedback.js';

import auth, { adminOnly } from './middleware/auth.js';
import { selectQuestionsForTest } from './utils/questionSelector.js';
import { initialQuestions, initialMockTests } from './seedData.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests. Try again in 15 minutes.' }
});

// ── Token helpers ─────────────────────────────────────────────────────────────
const mkTokens = (user) => ({
  accessToken: jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  ),
  refreshToken: jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
});

// ── Evaluation helper (server-side grading, no client trust) ──────────────────
async function evaluateAttempt(attempt) {
  const qIds = attempt.questions.map(q => q.questionId);
  const qDocs = await Question.find({ _id: { $in: qIds } }).lean();
  const qMap  = Object.fromEntries(qDocs.map(q => [q._id.toString(), q]));

  let score = 0;
  for (const q of attempt.questions) {
    const doc = qMap[q.questionId.toString()];
    if (!doc) continue;
    
    const correctIndices = doc.options
      .map((o, idx) => o.isCorrect ? idx : -1)
      .filter(idx => idx !== -1);
      
    const selected = q.selectedOptionIndices || [];
    q.isCorrect = selected.length === correctIndices.length &&
                  correctIndices.every(idx => selected.includes(idx));
                  
    if (q.isCorrect) score += q.marksAssigned;
  }
  attempt.score      = score;
  attempt.percentage = Math.round((score / attempt.totalMarks) * 100);
  attempt.passed     = attempt.percentage >= 50;
  attempt.submittedAt = new Date();
}

// ── Reactive expire check (called on any attempt-related request) ─────────────
async function reactiveAutoSubmit(attempt) {
  if (attempt.status === 'in-progress' && new Date() > new Date(attempt.deadlineAt)) {
    await evaluateAttempt(attempt);
    attempt.status = 'auto-submitted';
    await attempt.save();
    return true;
  }
  return false;
}

// ── Strip correct-answer data from attempt for in-progress view ───────────────
async function sanitiseAttempt(attempt) {
  const qIds  = attempt.questions.map(q => q.questionId);
  const qDocs = await Question.find({ _id: { $in: qIds } }).lean();
  const qMap  = Object.fromEntries(qDocs.map(q => [q._id.toString(), q]));

  const obj = attempt.toObject ? attempt.toObject() : attempt;
  obj.questions = obj.questions.map(q => {
    const doc = qMap[q.questionId.toString()] || {};
    return {
      questionId:          q.questionId,
      marksAssigned:       q.marksAssigned,
      selectedOptionIndices: q.selectedOptionIndices || [],
      isCorrect:           null,                        // never expose before submit
      questionText:        doc.questionText || '',
      category:            doc.category    || '',
      difficulty:          doc.difficulty  || '',
      imageUrl:            doc.imageUrl    || '',
      options:             (doc.options || []).map(o => ({ text: o.text })) // no isCorrect!
    };
  });
  return obj;
}

// ── Full review (called only after submission) ────────────────────────────────
async function reviewAttempt(attempt) {
  const qIds  = attempt.questions.map(q => q.questionId);
  const qDocs = await Question.find({ _id: { $in: qIds } }).lean();
  const qMap  = Object.fromEntries(qDocs.map(q => [q._id.toString(), q]));

  const obj = attempt.toObject ? attempt.toObject() : attempt;
  obj.questions = obj.questions.map(q => {
    const doc = qMap[q.questionId.toString()] || {};
    return {
      questionId:          q.questionId,
      marksAssigned:       q.marksAssigned,
      selectedOptionIndices: q.selectedOptionIndices || [],
      isCorrect:           q.isCorrect,
      questionText:        doc.questionText || '',
      category:            doc.category    || '',
      difficulty:          doc.difficulty  || '',
      explanation:         doc.explanation || '',
      imageUrl:            doc.imageUrl    || '',
      options:             (doc.options || []).map(o => ({ text: o.text, isCorrect: o.isCorrect }))
    };
  });
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password, college } = req.body;
    if (!name || !email || !password || !college)
      return res.status(400).json({ message: 'All fields are required.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, plainPassword: password, college });
    const tokens = mkTokens(user);
    res.status(201).json({ ...tokens, user: { id: user._id, name: user.name, email: user.email, college: user.college, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email not registered. Please sign up.' });
    }
    if (!(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: 'Invalid credentials.' });
    const tokens = mkTokens(user);
    res.json({ ...tokens, user: { id: user._id, name: user.name, email: user.email, college: user.college, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required.' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    res.json(mkTokens(user));
  } catch { res.status(401).json({ message: 'Invalid or expired refresh token.' }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK TEST ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/mocktests/active', auth, async (req, res) => {
  try {
    let test = await MockTest.findOne({ isActive: true });
    if (!test) {
      test = await MockTest.create({
        title: 'Random NASSCOM Mock Test',
        totalMarks: 100,
        durationMinutes: 60,
        categoryRules: [
          { category: 'Generative AI', minQuestions: 4, maxQuestions: 4 },
          { category: 'Artificial Intelligence & Machine Learning', minQuestions: 4, maxQuestions: 4 },
          { category: 'Blockchain', minQuestions: 4, maxQuestions: 4 },
          { category: 'IoT & IIoT', minQuestions: 4, maxQuestions: 4 },
          { category: 'Cloud Computing', minQuestions: 4, maxQuestions: 4 },
          { category: 'Cybersecurity & Data Privacy', minQuestions: 4, maxQuestions: 4 },
          { category: 'Metaverse, AR/VR', minQuestions: 4, maxQuestions: 4 },
          { category: 'Big Data Analytics', minQuestions: 4, maxQuestions: 4 },
          { category: 'RPA', minQuestions: 4, maxQuestions: 4 },
          { category: '3D Printing & Digital Manufacturing', minQuestions: 4, maxQuestions: 4 }
        ],
        isActive: true
      });
    }
    res.json([test]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ATTEMPT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/attempts/start', auth, async (req, res) => {
  try {
    let { mockTestId } = req.body;

    let mockTest;
    if (mockTestId) {
      try {
        mockTest = await MockTest.findById(mockTestId);
      } catch (err) {
        // Invalid ObjectId or other error
      }
    }

    if (!mockTest) {
      mockTest = await MockTest.findOne({ isActive: true });
      if (!mockTest) {
        mockTest = await MockTest.create({
          title: 'Random NASSCOM Mock Test',
          totalMarks: 100,
          durationMinutes: 60,
          categoryRules: [
            { category: 'Generative AI', minQuestions: 4, maxQuestions: 4 },
            { category: 'Artificial Intelligence & Machine Learning', minQuestions: 4, maxQuestions: 4 },
            { category: 'Blockchain', minQuestions: 4, maxQuestions: 4 },
            { category: 'IoT & IIoT', minQuestions: 4, maxQuestions: 4 },
            { category: 'Cloud Computing', minQuestions: 4, maxQuestions: 4 },
            { category: 'Cybersecurity & Data Privacy', minQuestions: 4, maxQuestions: 4 },
            { category: 'Metaverse, AR/VR', minQuestions: 4, maxQuestions: 4 },
            { category: 'Big Data Analytics', minQuestions: 4, maxQuestions: 4 },
            { category: 'RPA', minQuestions: 4, maxQuestions: 4 },
            { category: '3D Printing & Digital Manufacturing', minQuestions: 4, maxQuestions: 4 }
          ],
          isActive: true
        });
      }
    }

    // Idempotent: resume existing in-progress attempt for same test
    const existing = await Attempt.findOne({ userId: req.user.id, mockTestId: mockTest._id, status: 'in-progress' });
    if (existing) {
      await reactiveAutoSubmit(existing);
      if (existing.status === 'in-progress') {
        return res.json(await sanitiseAttempt(existing));
      }
    }

    // Select questions (server-side, frozen per attempt)
    const pool = await Question.find({ isActive: true }).lean();
    if (!pool.length) return res.status(400).json({ message: 'Question bank is empty.' });

    const selected = selectQuestionsForTest(pool, mockTest.totalMarks, mockTest.categoryRules);
    const totalMarks = selected.reduce((s, q) => s + q.marks, 0);

    const now = new Date();
    const deadlineAt = new Date(now.getTime() + mockTest.durationMinutes * 60_000);

    const attempt = await Attempt.create({
      userId:          req.user.id,
      mockTestId:      mockTest._id,
      questions:       selected.map(q => ({ questionId: q._id, marksAssigned: q.marks })),
      totalMarks,
      startedAt:       now,
      durationMinutes: mockTest.durationMinutes,
      deadlineAt
    });

    res.status(201).json(await sanitiseAttempt(attempt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET history  (must come BEFORE /:id to avoid routing clash)
app.get('/api/attempts/history', auth, async (req, res) => {
  try {
    const history = await Attempt
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('mockTestId', 'title durationMinutes');
    res.json(history);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/attempts/:id', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, userId: req.user.id });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
    await reactiveAutoSubmit(attempt);
    res.json(await sanitiseAttempt(attempt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.patch('/api/attempts/:id/answer', auth, async (req, res) => {
  try {
    const { questionId, selectedOptionIndices } = req.body;
    if (!questionId || !Array.isArray(selectedOptionIndices))
      return res.status(400).json({ message: 'questionId and selectedOptionIndices (array) required.' });

    // Reject if expired
    const attempt = await Attempt.findOne({ _id: req.params.id, userId: req.user.id });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
    if (await reactiveAutoSubmit(attempt) || attempt.status !== 'in-progress')
      return res.status(400).json({ message: 'Test has already ended.' });

    // Idempotent atomic update — only touches the matching sub-document
    await Attempt.updateOne(
      { _id: req.params.id, userId: req.user.id, status: 'in-progress' },
      { $set: { 'questions.$[elem].selectedOptionIndices': selectedOptionIndices } },
      { arrayFilters: [{ 'elem.questionId': questionId }] }
    );

    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/attempts/:id/submit', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, userId: req.user.id });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
    if (attempt.status !== 'in-progress')
      return res.status(400).json({ message: 'Test already submitted.' });

    await reactiveAutoSubmit(attempt);
    if (attempt.status !== 'in-progress') {
      return res.json({ message: 'Test auto-submitted (time expired).', attempt: await sanitiseAttempt(attempt) });
    }

    await evaluateAttempt(attempt);
    attempt.status = 'submitted';
    await attempt.save();
    res.json({ attempt: await sanitiseAttempt(attempt) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/attempts/:id/review', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, userId: req.user.id });
    if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
    await reactiveAutoSubmit(attempt);
    if (attempt.status === 'in-progress')
      return res.status(403).json({ message: 'Submit the test first to view review.' });
    res.json(await reviewAttempt(attempt));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  QUESTION BANK (practice, paginated)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/questions/bank', auth, async (req, res) => {
  try {
    const { page = 1, limit = 15, category, difficulty } = req.query;
    const filter = { isActive: true };
    if (category)   filter.category   = category;
    if (difficulty) filter.difficulty = difficulty;

    const [total, questions] = await Promise.all([
      Question.countDocuments(filter),
      Question.find(filter).skip((page - 1) * limit).limit(Number(limit))
    ]);
    res.json({ total, page: Number(page), pages: Math.ceil(total / limit), questions });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/feedback', auth, async (req, res) => {
  try {
    const { attemptId, rating, comments } = req.body;
    if (!rating || !comments) return res.status(400).json({ message: 'Rating and comments required.' });
    const fb = await Feedback.create({ userId: req.user.id, attemptId: attemptId || null, rating, comments });
    res.status(201).json(fb);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/admin/questions/bulk', auth, adminOnly, async (req, res) => {
  try {
    if (req.body.clearFirst) {
      await Question.deleteMany({});
      await MockTest.deleteMany({});
    }
    const qs  = await Question.insertMany(initialQuestions);
    const mts = await MockTest.insertMany(initialMockTests);
    res.json({ questionsSeeded: qs.length, mockTestsSeeded: mts.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, 'name email college role plainPassword');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
//  CRON: Auto-submit expired attempts every 30 seconds
// ─────────────────────────────────────────────────────────────────────────────
cron.schedule('*/30 * * * * *', async () => {
  try {
    const expired = await Attempt.find({ status: 'in-progress', deadlineAt: { $lte: new Date() } });
    for (const attempt of expired) {
      try {
        await evaluateAttempt(attempt);
        attempt.status = 'auto-submitted';
        await attempt.save();
        console.log(`[Cron] Auto-submitted attempt ${attempt._id}`);
      } catch (err) {
        console.error(`[Cron] Failed to auto-submit ${attempt._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Cron] Sweep error:', err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  DB CONNECTION + SEED
// ─────────────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mocktest-db')
  .then(async () => {
    console.log('[DB] Connected to MongoDB.');
    // Seed on first run
    const [users, questions] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments()
    ]);

    if (users === 0) {
      await User.create([
        {
          name: 'Admin User',
          email: 'admin@mocktest.org',
          passwordHash: await bcrypt.hash('adminPass123', 10),
          plainPassword: 'adminPass123',
          college: 'MockTest HQ',
          role: 'admin'
        },
        {
          name: 'Demo Student',
          email: 'student@mocktest.org',
          passwordHash: await bcrypt.hash('student123', 10),
          plainPassword: 'student123',
          college: 'AWH Engineering College',
          role: 'student'
        }
      ]);
      console.log('[Seed] Created default admin + student accounts.');
    }

    if (questions === 0) {
      await Question.insertMany(initialQuestions);
      await MockTest.insertMany(initialMockTests);
      console.log(`[Seed] Inserted ${initialQuestions.length} questions and ${initialMockTests.length} mock tests.`);
    }
  })
  .catch(err => console.error('[DB] Connection failed:', err.message));

app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));
