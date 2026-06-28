import mongoose from 'mongoose';
import Question from '../models/Question.js';
import 'dotenv/config';

const logoQuestions = [
  {
    questionText: "Which programming language is represented by this logo, widely used in machine learning, web development, and data science?",
    options: [
      { text: "Python", isCorrect: true },
      { text: "R", isCorrect: false },
      { text: "Julia", isCorrect: false },
      { text: "MATLAB", isCorrect: false }
    ],
    marks: 2,
    category: "Artificial Intelligence & Machine Learning",
    difficulty: "basic",
    explanation: "This is the logo of Python, an interpreted high-level programming language.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/230px-Python-logo-notext.svg.png",
    isActive: true
  },
  {
    questionText: "Identify the software/programming language environment represented by this logo, often used for numerical computing, visualization, and matrix manipulations.",
    options: [
      { text: "MATLAB", isCorrect: true },
      { text: "Mathematica", isCorrect: false },
      { text: "Octave", isCorrect: false },
      { text: "Maple", isCorrect: false }
    ],
    marks: 2,
    category: "Artificial Intelligence & Machine Learning",
    difficulty: "intermediate",
    explanation: "This is the logo of MATLAB (matrix laboratory), a proprietary multi-paradigm programming language and numerical computing environment.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Matlab_Logo.png/240px-Matlab_Logo.png",
    isActive: true
  },
  {
    questionText: "Which multimodal artificial intelligence model developed by Google is represented by this logo?",
    options: [
      { text: "Gemini", isCorrect: true },
      { text: "Claude", isCorrect: false },
      { text: "ChatGPT", isCorrect: false },
      { text: "LLaMA", isCorrect: false }
    ],
    marks: 2,
    category: "Generative AI",
    difficulty: "basic",
    explanation: "This is the logo of Google Gemini, a family of multimodal AI models.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Google_Gemini_logo.svg/240px-Google_Gemini_logo.svg.png",
    isActive: true
  },
  {
    questionText: "Identify the AI chatbot logo developed by OpenAI, which launched the modern generative AI wave.",
    options: [
      { text: "ChatGPT", isCorrect: true },
      { text: "Copilot", isCorrect: false },
      { text: "Gemini", isCorrect: false },
      { text: "Claude", isCorrect: false }
    ],
    marks: 2,
    category: "Generative AI",
    difficulty: "basic",
    explanation: "This is the official logo of OpenAI's ChatGPT chatbot.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/240px-ChatGPT_logo.svg.png",
    isActive: true
  },
  {
    questionText: "Identify the generative AI tool represented by this logo/icon, known for creating high-quality images from text prompts.",
    options: [
      { text: "Midjourney", isCorrect: true },
      { text: "DALL-E", isCorrect: false },
      { text: "Stable Diffusion", isCorrect: false },
      { text: "Canva AI", isCorrect: false }
    ],
    marks: 2,
    category: "Generative AI",
    difficulty: "intermediate",
    explanation: "This is the logo of Midjourney, a generative artificial intelligence program and service.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Midjourney_Emblem.svg/240px-Midjourney_Emblem.svg.png",
    isActive: true
  },
  {
    questionText: "What containerization platform is represented by this logo?",
    options: [
      { text: "Docker", isCorrect: true },
      { text: "Kubernetes", isCorrect: false },
      { text: "Podman", isCorrect: false },
      { text: "LXC", isCorrect: false }
    ],
    marks: 2,
    category: "Cloud Computing",
    difficulty: "basic",
    explanation: "This is the logo of Docker, which packages software into standardized units called containers.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Docker_%28container_engine%29_logo.svg/240px-Docker_%28container_engine%29_logo.svg.png",
    isActive: true
  }
];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mocktest-db';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);

  let insertedCount = 0;
  for (const q of logoQuestions) {
    const exists = await Question.findOne({ questionText: q.questionText });
    if (!exists) {
      await Question.create(q);
      insertedCount++;
      console.log(`Created: ${q.questionText.substring(0, 40)}...`);
    } else {
      console.log(`Skipped (already exists): ${q.questionText.substring(0, 40)}...`);
    }
  }

  await mongoose.disconnect();
  console.log(`Finished! Successfully inserted ${insertedCount} new logo questions.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding questions:', err);
  process.exit(1);
});
