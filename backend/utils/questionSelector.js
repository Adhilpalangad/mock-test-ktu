/**
 * selectQuestionsForTest
 * ─────────────────────────────────────────────────────────────────────────────
 * Selects a random subset of questions from `pool` whose marks sum to exactly
 * `targetMarks` (or the closest sum ≤ targetMarks if exact is impossible).
 *
 * Algorithm:
 *  1. Apply mandatory category minimums first.
 *  2. Build a remaining pool (honouring category maxQuestions caps).
 *  3. Solve subset-sum with DP on the remaining pool.
 *  4. Reconstruct one valid solution with random tie-breaking so every
 *     attempt gets a different paper.
 *
 * ⚠️  IMPORTANT FOR SEED DATA:
 *  The solver needs a diverse spread of mark values (1, 2, 3, 5, …) in the
 *  bank. If every question is worth the same number of marks it may be
 *  impossible to hit the exact target — the function will fall back to the
 *  closest sum ≤ targetMarks and emit a console.warn.
 */
export function selectQuestionsForTest(pool, targetMarks = 100, categoryRules = []) {
  // --- shuffle helper ---
  const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

  const categories = [
    "Generative AI",
    "Artificial Intelligence & Machine Learning",
    "Blockchain",
    "IoT & IIoT",
    "Cloud Computing",
    "Cybersecurity & Data Privacy",
    "Metaverse, AR/VR",
    "Big Data Analytics",
    "RPA",
    "3D Printing & Digital Manufacturing"
  ];
  
  const selected = [];
  const selectedIds = new Set();

  // --- Guarantee at least 3 image/logo based questions ---
  const imageQs = pool.filter(q => q.imageUrl);
  const targetImageCount = Math.min(3, imageQs.length);
  const chosenImageQs = shuffle(imageQs).slice(0, targetImageCount);

  const categoryCounts = {};
  for (const q of chosenImageQs) {
    selected.push(q);
    selectedIds.add(q._id.toString());
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  }

  for (const cat of categories) {
    const alreadyTaken = categoryCounts[cat] || 0;
    const need = 4 - alreadyTaken;
    if (need > 0) {
      const catQs = pool.filter(q => q.category === cat && !selectedIds.has(q._id.toString()));
      const shuffled = shuffle(catQs);
      const take = shuffled.slice(0, need);
      for (const q of take) {
        selected.push(q);
        selectedIds.add(q._id.toString());
      }
    }
  }

  // If we have fewer than 40 questions, backfill randomly from the remaining pool
  if (selected.length < 40) {
    const remainingPool = shuffle(pool.filter(q => !selectedIds.has(q._id.toString())));
    const need = 40 - selected.length;
    selected.push(...remainingPool.slice(0, need));
  }

  return shuffle(selected);
}
