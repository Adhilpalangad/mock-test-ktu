// ─────────────────────────────────────────────────────────────────────────────
// Seed data for the Live MCQ Mock Test Platform
// 320 questions across 4 categories with marks: 1, 2, 3, 5
// Run via: POST /api/admin/questions/bulk  (admin token required)
// Or automatically seeded on first server start if DB is empty.
//
// ⚠️  IMPORTANT: The subset-sum solver in questionSelector.js requires a
//     diverse spread of mark values (1, 2, 3, 5) to reliably hit exactly 100.
//     Do NOT change all questions to the same mark value.
// ─────────────────────────────────────────────────────────────────────────────

import { nasscomQuestions } from './nasscomQuestions.js';

const MARKS = [1, 2, 3, 5];
const DIFFS = ['basic', 'intermediate', 'application'];

// ── Quantitative Aptitude (80 questions) ─────────────────────────────────────
const quantBase = [
  {
    q: "A train travels {D} km in {T} hours. What is its speed in km/h?",
    opts: ["{A} km/h", "{W1} km/h", "{W2} km/h", "{W3} km/h"],
    correct: 0,
    exp: "Speed = Distance ÷ Time."
  },
  {
    q: "What is {P}% of {N}?",
    opts: ["{A}", "{W1}", "{W2}", "{W3}"],
    correct: 0,
    exp: "Percentage: (P/100) × N."
  },
  {
    q: "If a number is increased by {P}%, it becomes {R}. Find the original number.",
    opts: ["{A}", "{W1}", "{W2}", "{W3}"],
    correct: 0,
    exp: "Original = R × 100 / (100 + P)."
  },
  {
    q: "The ratio of two numbers is {R1}:{R2}. Their sum is {S}. Find the smaller number.",
    opts: ["{A}", "{W1}", "{W2}", "{W3}"],
    correct: 0,
    exp: "Smaller = S × R1 / (R1 + R2)."
  },
  {
    q: "A and B can finish a work in {A_days} and {B_days} days respectively. In how many days will they finish together?",
    opts: ["{A} days", "{W1} days", "{W2} days", "{W3} days"],
    correct: 0,
    exp: "Combined rate = 1/A_days + 1/B_days."
  },
  {
    q: "Simple interest on ₹{P} at {R}% per annum for {T} years is?",
    opts: ["₹{A}", "₹{W1}", "₹{W2}", "₹{W3}"],
    correct: 0,
    exp: "SI = (P × R × T) / 100."
  },
  {
    q: "A shopkeeper buys an item for ₹{CP} and sells it at a profit of {Pr}%. Find the selling price.",
    opts: ["₹{A}", "₹{W1}", "₹{W2}", "₹{W3}"],
    correct: 0,
    exp: "SP = CP × (1 + Pr/100)."
  },
  {
    q: "Two numbers are in ratio {R1}:{R2}. If their LCM is {L}, find the numbers.",
    opts: ["{A}", "{W1}", "{W2}", "{W3}"],
    correct: 0,
    exp: "Numbers = k×R1, k×R2 where k = LCM/lcm(R1,R2)."
  },
  {
    q: "Average of {N} consecutive integers starting from {Start} is?",
    opts: ["{A}", "{W1}", "{W2}", "{W3}"],
    correct: 0,
    exp: "Average = Start + (N-1)/2."
  },
  {
    q: "A cistern is filled by pipe A in {A_hrs} hours and emptied by pipe B in {B_hrs} hours. If both open together, time to fill?",
    opts: ["{A} hours", "{W1} hours", "{W2} hours", "{W3} hours"],
    correct: 0,
    exp: "Net rate = 1/A_hrs - 1/B_hrs."
  }
];

const verbalBase = [
  { q: "Choose the synonym of 'ELOQUENT'.", opts: ["Articulate", "Silent", "Clumsy", "Dull"], correct: 0, exp: "Eloquent means fluent or persuasive in speaking — synonym: Articulate." },
  { q: "Choose the antonym of 'BENEVOLENT'.", opts: ["Malevolent", "Generous", "Kind", "Caring"], correct: 0, exp: "Benevolent means kind; antonym is Malevolent (wishing harm)." },
  { q: "Identify the correctly spelt word.", opts: ["Conscientious", "Consciencious", "Consientious", "Conscienscious"], correct: 0, exp: "Correct spelling: Conscientious." },
  { q: "Choose the word closest in meaning to 'EXACERBATE'.", opts: ["Worsen", "Improve", "Ignore", "Solve"], correct: 0, exp: "Exacerbate means to make worse." },
  { q: "Fill in the blank: 'She has a _____ for detail that makes her an excellent editor.'", opts: ["knack", "lack", "knave", "knock"], correct: 0, exp: "Knack = natural skill or talent." },
  { q: "Identify the error: 'He don't know what happened.'", opts: ["'don't' should be 'doesn't'", "'He' should be 'His'", "'happened' should be 'happen'", "No error"], correct: 0, exp: "Subject-verb agreement: He doesn't (third person singular)." },
  { q: "Choose the correct passive voice: 'The teacher teaches the students.'", opts: ["The students are taught by the teacher.", "The students were taught by the teacher.", "The students have been taught.", "The teacher is taught by students."], correct: 0, exp: "Simple present passive: is/are + past participle." },
  { q: "What does the idiom 'Bite the bullet' mean?", opts: ["Endure a painful situation", "Run away from danger", "Take a risk", "Be very aggressive"], correct: 0, exp: "Bite the bullet = endure a painful or difficult situation bravely." },
  { q: "Choose the best word: 'The politician gave a _____ speech that moved the entire audience.'", opts: ["impassioned", "monotonous", "vague", "brief"], correct: 0, exp: "Impassioned = filled with emotion, suitable for a moving speech." },
  { q: "Which sentence uses 'affect' correctly?", opts: ["The rain affected our plans.", "The rain effected our plans.", "The rain affected us effect.", "We were effected by the rain."], correct: 0, exp: "'Affect' is a verb meaning to have an impact; 'effect' is usually a noun." }
];

const logicalBase = [
  { q: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely __?", opts: ["Lazzies", "Not Lazzies", "Sometimes Lazzies", "None of these"], correct: 0, exp: "Syllogism: A→B, B→C, therefore A→C." },
  { q: "Find the odd one out: 2, 5, 10, 17, 26, 37, 50, {N}", opts: ["65", "63", "67", "69"], correct: 0, exp: "Pattern: 1²+1, 2²+1, 3²+1... Next: 8²+1 = 65." },
  { q: "In a row, Ram is 7th from the left and 5th from the right. How many people are in the row?", opts: ["11", "12", "10", "13"], correct: 0, exp: "Total = 7 + 5 - 1 = 11." },
  { q: "A clock shows 3:15. What is the angle between the hour and minute hands?", opts: ["7.5°", "0°", "15°", "22.5°"], correct: 0, exp: "Hour hand at 3:15 is at 97.5°; minute at 90°; difference = 7.5°." },
  { q: "If FRIEND is coded as HUMJTK, how is CANDLE coded?", opts: ["EDRIRL", "DCPFNG", "EDRIQK", "EDPJRL"], correct: 0, exp: "Each letter shifted by +2 positions in alphabetical order." },
  { q: "Pointing at a boy, a girl says, 'He is the son of my grandfather's only son.' What is the girl's relation to the boy?", opts: ["Sister", "Cousin", "Aunt", "Mother"], correct: 0, exp: "Grandfather's only son = her father; so the boy is her brother." },
  { q: "Complete the series: B2, D4, F6, H8, __?", opts: ["J10", "I9", "K11", "J9"], correct: 0, exp: "Letters skip one (B,D,F,H,J); numbers increase by 2 (2,4,6,8,10)." },
  { q: "If South-East becomes East and North-West becomes West, what does North become?", opts: ["North-West", "North-East", "South-West", "South"], correct: 0, exp: "Each direction rotates 45° clockwise: North → North-East." },
  { q: "A is taller than B. C is taller than A. D is shorter than B. Who is the shortest?", opts: ["D", "B", "A", "C"], correct: 0, exp: "Order: C > A > B > D. So D is shortest." },
  { q: "Find next in series: 1, 4, 9, 16, 25, __?", opts: ["36", "35", "49", "30"], correct: 0, exp: "Perfect squares: 1², 2², 3²... Next: 6² = 36." }
];

const technicalBase = [
  { q: "What is the time complexity of Binary Search?", opts: ["O(log n)", "O(n)", "O(n²)", "O(1)"], correct: 0, exp: "Binary search halves the search space each step → O(log n)." },
  { q: "Which data structure uses LIFO (Last In, First Out) ordering?", opts: ["Stack", "Queue", "Linked List", "Tree"], correct: 0, exp: "A Stack uses LIFO — the last element pushed is the first popped." },
  { q: "What does SQL stand for?", opts: ["Structured Query Language", "Sequential Query Logic", "Standard Query Language", "System Query Layer"], correct: 0, exp: "SQL = Structured Query Language for managing relational databases." },
  { q: "Which HTTP method is idempotent and safe?", opts: ["GET", "POST", "DELETE", "PUT"], correct: 0, exp: "GET is both safe (no side-effects) and idempotent (same result every call)." },
  { q: "In OOP, what is 'encapsulation'?", opts: ["Bundling data and methods that operate on it within one unit", "Inheriting properties from parent class", "Overriding methods in subclass", "Using multiple classes together"], correct: 0, exp: "Encapsulation = wrapping data and behaviour together, hiding internal state." },
  { q: "What does 'typeof null' return in JavaScript?", opts: ["'object'", "'null'", "'undefined'", "'string'"], correct: 0, exp: "A historical bug in JS — typeof null returns 'object'." },
  { q: "Which sorting algorithm has worst-case O(n log n) complexity?", opts: ["Merge Sort", "Bubble Sort", "Selection Sort", "Insertion Sort"], correct: 0, exp: "Merge Sort guarantees O(n log n) in all cases." },
  { q: "What is a foreign key in relational databases?", opts: ["A key that references the primary key of another table", "The first column in a table", "A unique identifier for each row", "An index on multiple columns"], correct: 0, exp: "A foreign key enforces referential integrity between two tables." },
  { q: "In React, what hook is used for side effects?", opts: ["useEffect", "useState", "useRef", "useContext"], correct: 0, exp: "useEffect runs after render and handles side effects like API calls." },
  { q: "Which protocol does HTTPS add over HTTP?", opts: ["TLS/SSL encryption", "Faster TCP", "UDP support", "WebSocket support"], correct: 0, exp: "HTTPS = HTTP over TLS/SSL, providing encryption and authentication." }
];

function generateQuestions(templates, category, count = 80) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const t = templates[i % templates.length];
    const marks = MARKS[i % MARKS.length];
    const difficulty = DIFFS[i % DIFFS.length];
    const variant = Math.floor(i / templates.length) + 1;

    // Build question text with light numeric variation
    const n = 10 + i * 3;
    const questionText = t.q
      .replace('{D}', n * 5)
      .replace('{T}', 2 + (i % 3))
      .replace('{P}', 10 + (i % 5) * 5)
      .replace('{N}', n)
      .replace('{R}', 5 + (i % 4))
      .replace('{R1}', 2 + (i % 3))
      .replace('{R2}', 3 + (i % 3))
      .replace('{S}', 50 + i * 2)
      .replace('{A_days}', 6 + (i % 4))
      .replace('{B_days}', 8 + (i % 5))
      .replace('{A_hrs}', 4 + (i % 3))
      .replace('{B_hrs}', 6 + (i % 4))
      .replace('{CP}', 200 + i * 10)
      .replace('{Pr}', 10 + (i % 4) * 5)
      .replace('{L}', 60 + i * 6)
      .replace('{Start}', 1 + i)
      .replace('{R}', 8 + (i % 5))
      .replace('{T}', 3 + (i % 3))
      .replace('{A}', n * 5 + i)
      .replace('{N}', n + variant);

    const opts = t.opts.map(o =>
      o.replace('{A}', n + variant)
       .replace('{W1}', n + variant + 2)
       .replace('{W2}', n + variant + 4)
       .replace('{W3}', n + variant - 2)
    );

    questions.push({
      questionText: `${questionText}  [V${variant}]`,
      options: opts.map((text, idx) => ({ text, isCorrect: idx === t.correct })),
      marks,
      category,
      difficulty,
      explanation: t.exp,
      isActive: true
    });
  }
  return questions;
}

const questionsList = [
  ...generateQuestions(quantBase, 'Quantitative Aptitude', 80),
  ...generateQuestions(verbalBase, 'Verbal Ability', 80),
  ...generateQuestions(logicalBase, 'Logical Reasoning', 80),
  ...generateQuestions(technicalBase, 'Technical', 80)
];

// Q3 -> A, B, D (Indices 0, 1, 3)
questionsList[2].options = questionsList[2].options.map((opt, idx) => ({
  ...opt,
  isCorrect: [0, 1, 3].includes(idx)
}));

// Q31 -> A, C, D (Indices 0, 2, 3)
questionsList[30].options = questionsList[30].options.map((opt, idx) => ({
  ...opt,
  isCorrect: [0, 2, 3].includes(idx)
}));

// Q36 -> A, B, C (Indices 0, 1, 2)
questionsList[35].options = questionsList[35].options.map((opt, idx) => ({
  ...opt,
  isCorrect: [0, 1, 2].includes(idx)
}));

// Q49 -> B, C, D, E (Indices 1, 2, 3, 4)
const q49BaseOpts = questionsList[48].options;
questionsList[48].options = [
  { text: q49BaseOpts[0].text, isCorrect: false },
  { text: q49BaseOpts[1].text, isCorrect: true },
  { text: q49BaseOpts[2].text, isCorrect: true },
  { text: q49BaseOpts[3].text, isCorrect: true },
  { text: "None of the above", isCorrect: true }
];

export const initialQuestions = nasscomQuestions;

export const initialMockTests = [
  {
    title: 'General Aptitude & Technical Assessment',
    totalMarks: 100,
    durationMinutes: 60,
    categoryRules: [
      { category: 'Quantitative Aptitude', minQuestions: 5, maxQuestions: 20 },
      { category: 'Verbal Ability',        minQuestions: 5, maxQuestions: 15 },
      { category: 'Logical Reasoning',     minQuestions: 5, maxQuestions: 15 },
      { category: 'Technical',             minQuestions: 8, maxQuestions: 30 }
    ],
    isActive: true
  },
  {
    title: 'Verbal & Logical Aptitude Mock',
    totalMarks: 100,
    durationMinutes: 45,
    categoryRules: [
      { category: 'Verbal Ability',    minQuestions: 10, maxQuestions: 40 },
      { category: 'Logical Reasoning', minQuestions: 10, maxQuestions: 40 }
    ],
    isActive: true
  },
  {
    title: 'Technical Theory Mock',
    totalMarks: 100,
    durationMinutes: 90,
    categoryRules: [
      { category: 'Technical', minQuestions: 20, maxQuestions: 60 }
    ],
    isActive: true
  }
];
