import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { attemptsAPI } from '../services/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    attemptsAPI.history()
      .then(setHistory)
      .catch(err => setError(err.message || 'Failed to retrieve history logs.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Attended Mock Details</h2>
          <p className="text-slate-400 mt-1">Review scores and results of your past mock attempts.</p>
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
        ) : history.length === 0 ? (
          <div className="glass p-12 text-center text-slate-500">
            📭 You haven't taken any mock tests yet. Go to Dashboard to get started!
          </div>
        ) : (
          <div className="glass overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-dark-800/80 border-b border-dark-400/40 text-slate-400 text-xxs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Mock Exam</th>
                    <th className="py-4 px-6">Date Taken</th>
                    <th className="py-4 px-6">Score</th>
                    <th className="py-4 px-6">Result Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-400/30 text-slate-300 text-sm">
                  {history.map((att) => {
                    const pass = att.passed;
                    const dateStr = new Date(att.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={att._id} className="hover:bg-dark-600/35 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-200">
                          {att.mockTestId?.title || 'Unknown Test'}
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                          {dateStr}
                        </td>
                        <td className="py-4 px-6 font-bold font-mono">
                          {att.status === 'in-progress' ? (
                            <span className="text-amber-500 text-xs">In Progress</span>
                          ) : (
                            <span>{att.score} / {att.totalMarks} ({att.percentage}%)</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {att.status === 'in-progress' ? (
                            <span className="badge-prog">Active</span>
                          ) : pass ? (
                            <span className="badge-pass">Pass</span>
                          ) : (
                            <span className="badge-fail">Fail</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {att.status === 'in-progress' ? (
                            <Link
                              to={`/exam/${att._id}`}
                              className="text-primary-400 hover:text-primary-300 font-semibold text-xs hover:underline"
                            >
                              Resume ➡️
                            </Link>
                          ) : (
                            <Link
                              to={`/result/${att._id}`}
                              className="text-primary-400 hover:text-primary-300 font-semibold text-xs hover:underline"
                            >
                              Review Result 🔍
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
