import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { feedbackAPI } from '../services/api';

export default function Feedback() {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comments.trim()) return setError('Please type some comments.');
    
    setLoading(true);
    setError('');
    setSuccess(false);

    feedbackAPI.submit({ rating, comments })
      .then(() => {
        setSuccess(true);
        setComments('');
        setRating(5);
      })
      .catch(err => {
        setError(err.message || 'Failed to submit feedback.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-2xl mx-auto w-full flex flex-col justify-center">
        <div className="glass p-8 md:p-10 animate-fade-in shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Platform Feedback</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Your reviews help us enhance test configurations, questions pool, and timer performance!
          </p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/30 border border-emerald-900/45 rounded-xl text-emerald-400 text-sm">
              ✔️ Thank you! Your feedback has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rating Scale</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none transition-transform duration-100 hover:scale-110 active:scale-95"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Comments & Suggestions</label>
              <textarea
                rows="4"
                placeholder="What did you think of the question variety, layout responsiveness, and timer synchronization?"
                className="input scrollbar-thin resize-none"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="spinner" /> : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
