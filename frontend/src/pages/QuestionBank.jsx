import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { questionsAPI } from '../services/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Track showing correct answers on demand per index
  const [revealed, setRevealed] = useState({});

  const categories = ['Quantitative Aptitude', 'Verbal Ability', 'Logical Reasoning', 'Technical'];
  const difficulties = ['basic', 'intermediate', 'application'];

  const fetchQuestions = () => {
    setLoading(true);
    setError('');
    
    const params = { page, limit: 10 };
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;

    questionsAPI.bank(params)
      .then(data => {
        setQuestions(data.questions);
        setTotalPages(data.pages);
        setRevealed({}); // Reset revealed answers state
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch question bank.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, [category, difficulty, page]);

  const handleToggleReveal = (index) => {
    setRevealed(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Practice Question Bank</h2>
          <p className="text-slate-400 mt-1">Browse study questions by category or difficulty level without scoring pressure.</p>
        </header>

        {/* ── FILTERING ROW ── */}
        <section className="glass p-4 md:p-6 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xxs font-semibold text-slate-400 uppercase mb-2">Category Filter</label>
            <select
              className="input py-2 text-sm"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xxs font-semibold text-slate-400 uppercase mb-2">Difficulty Filter</label>
            <select
              className="input py-2 text-sm"
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            >
              <option value="">All Difficulties</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ── QUESTIONS LIST ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner !w-8 !h-8" />
          </div>
        ) : questions.length === 0 ? (
          <div className="glass p-12 text-center text-slate-500">
            📭 No questions match your filter query criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const isRevealed = revealed[idx];
              const correctOption = q.options.find(opt => opt.isCorrect);

              return (
                <div key={q._id} className="glass p-6 md:p-8 flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-dark-400/40 pb-3">
                    <span className="text-xxs font-mono font-bold text-primary-400 bg-primary-950/30 px-2.5 py-0.5 border border-primary-900/20 rounded">
                      {q.category}
                    </span>
                    <span className="text-xxs font-mono text-slate-400 capitalize">
                      {q.difficulty} • {q.marks} Marks
                    </span>
                  </div>

                  <p className="text-sm md:text-base font-semibold text-slate-200">{q.questionText}</p>

                  {q.imageUrl && (
                    <div className="mt-2 max-w-full flex bg-dark-800/40 p-4 rounded-xl border border-dark-400/20">
                      <img
                        src={q.imageUrl}
                        alt="Question visual illustration"
                        className="max-h-48 object-contain rounded-lg shadow-inner"
                      />
                    </div>
                  )}

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-3 p-3.5 bg-dark-600/40 border border-dark-400/30 rounded-xl text-slate-300 text-xs md:text-sm">
                        <span className="w-5 h-5 rounded-full border border-dark-400 text-slate-500 text-xxs font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reveal answer trigger */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleToggleReveal(idx)}
                      className="btn-ghost py-1.5 px-4 text-xs"
                    >
                      {isRevealed ? 'Hide Answer' : 'Reveal Correct Answer'}
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs md:text-sm text-slate-300 space-y-2 animate-fade-in">
                      <p className="font-semibold text-emerald-400">
                        ✔️ Correct Answer: <span className="font-bold">{correctOption?.text}</span>
                      </p>
                      {q.explanation && (
                        <p className="text-slate-400 text-xs leading-relaxed border-t border-emerald-900/30 pt-2">
                          <span className="font-semibold text-slate-300">Explanation:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost py-1.5 px-4 text-xs"
              >
                Previous
              </button>
              <span className="text-xs font-mono text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost py-1.5 px-4 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
