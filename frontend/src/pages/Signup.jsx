import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-dark-600', width: 'w-0' };
    if (password.length < 8) return { label: 'Too Short (Min 8 chars)', color: 'bg-red-500', width: 'w-1/3' };
    
    // Check complexity
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    if (hasLetters && hasNumbers && hasSpecial) {
      return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    }
    return { label: 'Medium (Add numbers/special chars)', color: 'bg-amber-500', width: 'w-2/3' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !college || !password) {
      return setErrorMsg('Please fill in all fields.');
    }
    if (password.length < 8) {
      return setErrorMsg('Password must be at least 8 characters long.');
    }
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setErrorMsg('Please enter a valid email address.');
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await signup({ name, email, password, college });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-hero-pattern">
      <div className="w-full max-w-md glass p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/35 mx-auto mb-3 text-xl">
            N
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-slate-400 mt-1">Get instant access to NASSCOM practice test sessions</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">College Name</label>
            <input
              type="text"
              placeholder="AWH Engineering College"
              className="input"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Min 8 characters"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-xxs mb-1">
                  <span className="text-slate-400">Password strength:</span>
                  <span className="font-semibold text-slate-300">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-dark-600 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-350`} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <div className="spinner" /> : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium hover:underline">
              Log in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
