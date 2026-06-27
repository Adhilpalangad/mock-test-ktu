import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { testsAPI, attemptsAPI } from '../services/api';

export default function Dashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    testsAPI.active()
      .then(setTests)
      .catch(err => setError(err.message || 'Failed to load mock tests.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStartClick = (testId) => {
    navigate(`/disclaimer/${testId}`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Available Mock Tests</h2>
          <p className="text-slate-400 mt-1">Select an active mock exam module to test your skills.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner !w-8 !h-8" />
          </div>
        ) : tests.length === 0 ? (
          <div className="glass p-12 text-center text-slate-500">
            📭 No active mock tests are configured at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {tests.map((test) => (
              <div key={test._id} className="glass p-6 hover:border-primary-500/50 hover:bg-dark-700 transition-all duration-200 flex flex-col justify-between h-56 group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xxs font-bold uppercase tracking-wider text-primary-400 bg-primary-950/45 px-2.5 py-1 rounded-md border border-primary-900/30">
                      Active Exam
                    </span>
                    <span className="text-xs text-slate-500 font-mono">⏱️ {test.durationMinutes} min</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 line-clamp-2 group-hover:text-primary-300 transition-colors duration-150">
                    {test.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-400/40">
                  <span className="text-sm font-semibold text-slate-400 font-mono">💯 Percentage Grading</span>
                  <button
                    onClick={() => handleStartClick(test._id)}
                    className="btn-primary py-2 px-4 text-xs"
                  >
                    Launch Mock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
