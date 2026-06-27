import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptsAPI } from '../services/api';

export default function Exam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation & Category states
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Local answers cache & status trackers
  const [localAnswers, setLocalAnswers] = useState({});
  const [syncStatus, setSyncStatus] = useState('Synced'); // 'Synced' | 'Saving...' | 'Offline - Pending Sync'
  const [remainingTime, setRemainingTime] = useState(null);
  
  // Confirm submission modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Timer intervals reference
  const timerRef = useRef(null);

  // 1. Fetch Exam State
  useEffect(() => {
    attemptsAPI.get(attemptId)
      .then(data => {
        if (data.status !== 'in-progress') {
          // If already ended, route directly to result page
          navigate(`/result/${attemptId}`);
          return;
        }
        setAttempt(data);
        
        // Extract distinct categories
        const distinctCats = [...new Set(data.questions.map(q => q.category))];
        setCategories(distinctCats);
        setActiveCategory(distinctCats[0] || '');
        
        // Build local answers mapping
        const answersMap = {};
        data.questions.forEach(q => {
          answersMap[q.questionId] = q.selectedOptionIndices || [];
        });
        setLocalAnswers(answersMap);

        // Start Clock countdown
        const deadline = new Date(data.deadlineAt).getTime();
        const updateTimer = () => {
          const now = new Date().getTime();
          const diff = deadline - now;
          if (diff <= 0) {
            clearInterval(timerRef.current);
            setRemainingTime(0);
            handleAutoSubmit();
          } else {
            setRemainingTime(diff);
          }
        };
        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
      })
      .catch(err => {
        setError(err.message || 'Failed to sync exam session.');
      })
      .finally(() => setLoading(false));

    return () => clearInterval(timerRef.current);
  }, [attemptId]);

  // Handle Automatic submission on timer expiration
  const handleAutoSubmit = () => {
    setIsSubmitting(true);
    attemptsAPI.submit(attemptId)
      .then(() => {
        navigate(`/result/${attemptId}`);
      })
      .catch(() => {
        navigate(`/result/${attemptId}`);
      });
  };

  const getModuleAttendedCount = (categoryName) => {
    if (!attempt) return 0;
    return attempt.questions.filter(q => q.category === categoryName && localAnswers[q.questionId] && localAnswers[q.questionId].length > 0).length;
  };

  const getModuleTotalCount = (categoryName) => {
    if (!attempt) return 0;
    return attempt.questions.filter(q => q.category === categoryName).length;
  };

  const getUniqueCategories = () => {
    if (!attempt) return [];
    return [...new Set(attempt.questions.map(q => q.category))];
  };

  const activeCategoryQuestions = attempt ? attempt.questions : [];
  const currentQuestion = activeCategoryQuestions[currentQuestionIndex];

  // Save selected option to local state & Debounce save to Server
  const handleOptionSelect = (questionId, optionIndex) => {
    const currentSelection = localAnswers[questionId] || [];
    const newSelection = currentSelection.includes(optionIndex)
      ? currentSelection.filter(idx => idx !== optionIndex)
      : [...currentSelection, optionIndex];

    setLocalAnswers(prev => ({ ...prev, [questionId]: newSelection }));
    setSyncStatus('Saving...');

    // API save answer patch
    attemptsAPI.answer(attemptId, questionId, newSelection)
      .then(() => {
        setSyncStatus('Synced');
      })
      .catch(() => {
        setSyncStatus('Offline - Pending Sync');
        // Retry logic on reconnect
        const retrySync = () => {
          if (navigator.onLine) {
            attemptsAPI.answer(attemptId, questionId, newSelection)
              .then(() => {
                setSyncStatus('Synced');
                window.removeEventListener('online', retrySync);
              });
          }
        };
        window.addEventListener('online', retrySync);
      });
  };

  const handleManualSubmit = () => {
    setIsSubmitting(true);
    attemptsAPI.submit(attemptId)
      .then(() => {
        navigate(`/result/${attemptId}`);
      })
      .catch(err => {
        setError(err.message || 'Submission failed. Please check network.');
        setIsSubmitting(false);
        setShowSubmitModal(false);
      });
  };

  // Format timer remaining millis
  const formatTime = (ms) => {
    if (ms === null || ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer color classes
  const getTimerClass = () => {
    if (remainingTime === null) return 'timer-normal';
    const fiveMins = 5 * 60 * 1000;
    const oneMin = 1 * 60 * 1000;
    if (remainingTime < oneMin) return 'timer-critical';
    if (remainingTime < fiveMins) return 'timer-warning';
    return 'timer-normal';
  };

  // Counts
  const unansweredCount = attempt
    ? attempt.questions.filter(q => {
        const sel = localAnswers[q.questionId];
        return !sel || sel.length === 0;
      }).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="spinner !w-10 !h-10" />
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6">
        <div className="glass p-8 text-center max-w-md w-full">
          <p className="text-red-400 font-medium mb-4">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary py-2 px-6">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100">
      {/* ── TOP NAV BAR ── */}
      <header className="bg-dark-800 border-b border-dark-400/40 px-6 py-4 flex items-center justify-between sticky top-0 z-15 shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDrawer(true)} 
            className="lg:hidden bg-dark-600 hover:bg-dark-500 p-2 rounded-lg text-sm transition"
            title="Open Progress & Navigation"
          >
            📊 Navigation
          </button>
          <span className="font-bold text-white tracking-wide uppercase text-sm hidden sm:inline">Exam Panel</span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-dark-600 rounded-lg text-xxs font-semibold">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'Synced' ? 'bg-emerald-500' : syncStatus === 'Saving...' ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className="text-slate-400">{syncStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">⏱️ Time:</span>
            <span className={getTimerClass()}>
              {formatTime(remainingTime)}
            </span>
          </div>
          <button onClick={() => setShowSubmitModal(true)} className="btn-primary py-2 px-4 text-xs font-bold">
            Submit Test
          </button>
        </div>
      </header>

      {/* ── MAIN GRID LAYOUT ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* LEFT COLUMN: Categories & Questions palette */}
        <section className="hidden lg:flex lg:col-span-1 bg-dark-800/60 p-5 lg:border-r border-dark-400/40 flex-col gap-5 overflow-y-auto lg:h-[calc(100vh-73px)]">
          {/* Module Progress */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Module Progress</h3>
            <div className="flex flex-col gap-2.5 bg-dark-700/60 p-4 rounded-xl border border-dark-400/20 text-xs">
              {getUniqueCategories().map(cat => {
                const attended = getModuleAttendedCount(cat);
                const total = getModuleTotalCount(cat);
                return (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">{cat}</span>
                    <span className="font-mono font-bold text-primary-400 bg-primary-950/20 px-2 py-0.5 rounded border border-primary-900/10">{attended} / {total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question grid palette */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Question Palette</h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-5 gap-2">
              {activeCategoryQuestions.map((q, idx) => {
                const isSelected = localAnswers[q.questionId] && localAnswers[q.questionId].length > 0;
                const isCurrent = currentQuestionIndex === idx;

                let paletteStyle = 'p-unanswered';
                if (isSelected) paletteStyle = 'p-answered';
                if (isCurrent) paletteStyle = 'p-current';

                return (
                  <button
                    key={q.questionId}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={paletteStyle}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Question viewer */}
        <main className="lg:col-span-3 p-6 md:p-10 flex flex-col justify-between overflow-y-auto lg:h-[calc(100vh-73px)]">
          {currentQuestion ? (
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-dark-400/40 pb-4">
                <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider bg-dark-600 px-3 py-1 rounded-md">
                  Question {currentQuestionIndex + 1} of {activeCategoryQuestions.length}
                </span>
              </div>

              <p className="text-base md:text-lg font-medium text-slate-200 leading-relaxed">
                {currentQuestion.questionText}
              </p>

              <div className="flex flex-col gap-3.5 mt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = (localAnswers[currentQuestion.questionId] || []).includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(currentQuestion.questionId, idx)}
                      className={isSelected ? 'option-btn option-selected' : 'option-btn'}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xxs font-bold uppercase transition-colors shrink-0 mt-0.5 ${isSelected ? 'border-primary-500 text-primary-300 bg-primary-950/30' : 'border-dark-400 text-slate-500'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-slate-300 text-sm md:text-base leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              No questions found in this section.
            </div>
          )}

          {/* Bottom navigation bar */}
          <footer className="border-t border-dark-400/40 pt-6 mt-8 flex justify-between max-w-3xl mx-auto w-full">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn-ghost py-2 px-6"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(activeCategoryQuestions.length - 1, prev + 1))}
              disabled={currentQuestionIndex === activeCategoryQuestions.length - 1}
              className="btn-primary py-2 px-6"
            >
              Next
            </button>
          </footer>
        </main>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {showDrawer && (
        <div className="fixed inset-0 z-45 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => setShowDrawer(false)}
          />
          
          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-dark-850 h-full p-6 flex flex-col gap-6 overflow-y-auto border-r border-dark-400/50 shadow-2xl z-50 animate-slide-right text-left">
            <div className="flex items-center justify-between border-b border-dark-400/40 pb-4">
              <span className="font-bold text-white text-sm uppercase tracking-wide">Progress & Palette</span>
              <button 
                onClick={() => setShowDrawer(false)} 
                className="text-slate-400 hover:text-white p-1 text-sm font-bold bg-dark-600 rounded-lg w-7 h-7 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            {/* Replicated Module Progress */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Module Progress</h3>
              <div className="flex flex-col gap-2.5 bg-dark-700/60 p-4 rounded-xl border border-dark-400/20 text-xs">
                {getUniqueCategories().map(cat => {
                  const attended = getModuleAttendedCount(cat);
                  const total = getModuleTotalCount(cat);
                  return (
                    <div key={cat} className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">{cat}</span>
                      <span className="font-mono font-bold text-primary-400 bg-primary-950/20 px-2 py-0.5 rounded border border-primary-900/10">{attended} / {total}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Replicated Question grid palette */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {activeCategoryQuestions.map((q, idx) => {
                  const isSelected = localAnswers[q.questionId] && localAnswers[q.questionId].length > 0;
                  const isCurrent = currentQuestionIndex === idx;

                  let paletteStyle = 'p-unanswered';
                  if (isSelected) paletteStyle = 'p-answered';
                  if (isCurrent) paletteStyle = 'p-current';

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowDrawer(false); // Auto close drawer when question clicked
                      }}
                      className={paletteStyle}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM SUBMISSION MODAL ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass max-w-md w-full p-8 text-center shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">Submit Mock Exam?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You have <span className="text-amber-400 font-semibold font-mono">{unansweredCount} unanswered</span> questions. Once submitted, you cannot edit your answers or review your scores.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn-ghost flex-1"
                disabled={isSubmitting}
              >
                Back to Exam
              </button>
              <button
                onClick={handleManualSubmit}
                className="btn-primary flex-1 bg-indigo-600 hover:bg-indigo-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? <div className="spinner" /> : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
