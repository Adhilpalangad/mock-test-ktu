import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { attemptsAPI } from '../services/api';

export default function Result() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Category-wise breakdowns states
  const [categoryBreakdowns, setCategoryBreakdowns] = useState({});

  useEffect(() => {
    attemptsAPI.review(attemptId)
      .then(data => {
        setAttempt(data);
        
        // Compute category scores breakdown
        const breakdowns = {};
        data.questions.forEach(q => {
          if (!breakdowns[q.category]) {
            breakdowns[q.category] = { total: 0, scored: 0, count: 0, correct: 0 };
          }
          breakdowns[q.category].count += 1;
          breakdowns[q.category].total += q.marksAssigned;
          if (q.isCorrect) {
            breakdowns[q.category].correct += 1;
            breakdowns[q.category].scored += q.marksAssigned;
          }
        });
        setCategoryBreakdowns(breakdowns);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch result details.');
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="spinner !w-10 !h-10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6">
        <div className="glass p-8 text-center max-w-md w-full">
          <p className="text-red-400 font-medium mb-4">⚠️ {error}</p>
          <Link to="/dashboard" className="btn-primary py-2 px-6">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const pass = attempt.passed;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Performance Summary</h2>
            <p className="text-slate-400 mt-1">Detailed review of your mock exam submission.</p>
          </div>
          <Link to="/dashboard" className="btn-ghost self-start sm:self-center">
            Back to Home
          </Link>
        </header>

        {/* ── SCORE SUMMARY HERO ── */}
        <section className="glass p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 mb-8 animate-slide-up">
          <div className="score-display">
            <span className="text-3xl font-black text-white">{attempt.percentage}%</span>
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3.5 mb-1.5">
                <h3 className="text-2xl font-extrabold text-slate-100">{attempt.percentage}% Score</h3>
                <span className={pass ? 'badge-pass' : 'badge-fail'}>
                  {pass ? 'Passed' : 'Failed'}
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold font-mono">
                Attempt status: <span className={attempt.status === 'submitted' ? 'text-emerald-400' : 'text-amber-400'}>{attempt.status}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-dark-400/40">
              <div>
                <p className="text-xxs text-slate-500 uppercase font-semibold">Total Questions</p>
                <p className="text-sm font-bold font-mono text-slate-200">{attempt.questions.length}</p>
              </div>
              <div>
                <p className="text-xxs text-slate-500 uppercase font-semibold">Correct Answers</p>
                <p className="text-sm font-bold font-mono text-emerald-400">
                  {attempt.questions.filter(q => q.isCorrect).length}
                </p>
              </div>
              <div>
                <p className="text-xxs text-slate-500 uppercase font-semibold">Incorrect Answers</p>
                <p className="text-sm font-bold font-mono text-red-400">
                  {attempt.questions.filter(q => q.selectedOptionIndices && q.selectedOptionIndices.length > 0 && !q.isCorrect).length}
                </p>
              </div>
              <div>
                <p className="text-xxs text-slate-500 uppercase font-semibold">Skipped Questions</p>
                <p className="text-sm font-bold font-mono text-slate-500">
                  {attempt.questions.filter(q => !q.selectedOptionIndices || q.selectedOptionIndices.length === 0).length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORY WISE BREAKDOWN ── */}
        <section className="mb-10">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Section Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryBreakdowns).map(([catName, info]) => {
              const catPerc = info.total > 0 ? Math.round((info.scored / info.total) * 100) : 0;
              return (
                <div key={catName} className="glass p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200">{catName}</h4>
                    <span className="text-xs font-bold text-primary-400 font-mono">{catPerc}%</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xxs text-slate-400 mb-1">
                      <span>Correct: {info.correct}/{info.count} questions</span>
                      <span>{catPerc}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${catPerc}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── QUESTION-BY-QUESTION REVIEW ── */}
        <section className="space-y-6">
          <h3 className="text-lg font-bold text-slate-200">Question-by-Question Review</h3>
          {attempt.questions.map((q, idx) => {
            const hasSkipped = !q.selectedOptionIndices || q.selectedOptionIndices.length === 0;
            return (
              <div key={q.questionId} className="glass p-6 md:p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-dark-400/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xxs font-bold bg-dark-600 text-slate-400 px-2 py-0.5 rounded">
                      Q {idx + 1}
                    </span>
                    <span className="text-xxs text-slate-500 uppercase font-semibold font-mono">{q.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasSkipped ? (
                      <span className="text-xxs bg-dark-500 border border-dark-400 text-slate-400 px-2 py-0.5 rounded-full">
                        Skipped
                      </span>
                    ) : q.isCorrect ? (
                      <span className="text-xxs bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full">
                        Correct
                      </span>
                    ) : (
                      <span className="text-xxs bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-full">
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm md:text-base font-semibold text-slate-200">{q.questionText}</p>

                <div className="flex flex-col gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = (q.selectedOptionIndices || []).includes(oIdx);
                    const isCorrect = opt.isCorrect;

                    let optionClass = 'option-btn pointer-events-none';
                    if (isSelected) {
                      optionClass = isCorrect ? 'option-btn option-correct' : 'option-btn option-wrong';
                    } else if (isCorrect) {
                      optionClass = 'option-btn option-correct';
                    }

                    return (
                      <div key={oIdx} className={optionClass}>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xxs font-bold uppercase shrink-0 mt-0.5 ${isCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' : isSelected ? 'border-red-500 text-red-400 bg-red-950/40' : 'border-dark-400 text-slate-500'}`}>
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-xs md:text-sm text-slate-300">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 p-4 bg-dark-600 border border-dark-400/50 rounded-xl text-xs md:text-sm text-slate-400 leading-relaxed">
                    <p className="font-semibold text-slate-300 mb-1">💡 Explanation:</p>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
