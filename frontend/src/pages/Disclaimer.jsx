import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { attemptsAPI } from '../services/api';

export default function Disclaimer() {
  const { mockTestId } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartExam = async () => {
    if (!agreed) return;
    setLoading(true);
    setError('');

    try {
      // API call to create attempt & fetch questions (answers omitted)
      const attempt = await attemptsAPI.start(mockTestId);
      navigate(`/exam/${attempt._id}`);
    } catch (err) {
      setError(err.message || 'Could not start exam. Contact administrator.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col justify-center">
        <div className="glass p-8 md:p-12 animate-fade-in shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Instructions & Disclaimer</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
            <div className="p-4 bg-dark-600 rounded-xl border border-dark-400/50">
              <p className="font-bold text-slate-200 mb-1">📋 Exam Regulations</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Total Questions: <span className="text-slate-200 font-semibold font-mono">40 Questions</span></li>
                <li>Duration: <span className="text-slate-200 font-semibold font-mono">60 Minutes</span></li>
                <li>Passing criteria: <span className="text-slate-200 font-semibold font-mono">50% Score</span> or higher</li>
                <li>No negative markings for incorrect options.</li>
                <li>Exiting or refreshing the browser tab will NOT pause your time. The server-authoritative clock continues.</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-900/30 text-amber-300 rounded-xl">
              <p className="font-bold text-amber-200 mb-1">⚠️ Platform Disclaimer</p>
              <p className="text-xs md:text-sm">
                Disclaimer: This platform is an independent study resource and is not affiliated with, endorsed by, or associated with NASSCOM or any government organization. It is intended solely to help students understand exam patterns and prepare more effectively.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <input
              type="checkbox"
              id="agreeCheck"
              className="w-5 h-5 rounded border-dark-400 text-primary-600 focus:ring-primary-500 bg-dark-600"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agreeCheck" className="text-sm text-slate-400 cursor-pointer select-none">
              I have read the rules and understand this exam is an independent practice resource.
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-ghost flex-1 py-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleStartExam}
              disabled={!agreed || loading}
              className="btn-primary flex-1 py-3"
            >
              {loading ? <div className="spinner" /> : 'Start Exam'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
