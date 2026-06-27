import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setErrorMsg('Please fill in all fields.');
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-hero-pattern">
      <div className="w-full max-w-md glass p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/35 mx-auto mb-4 text-xl">
            N
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-1">Log in to continue your NASSCOM practice prep</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </span>
            {errorMsg.toLowerCase().includes('not registered') && (
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold underline ml-5 mt-1 block">
                Go to Sign Up Page &rarr;
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              placeholder="name@college.edu"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <div className="spinner" /> : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium hover:underline">
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
