import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard / Attend Test', path: '/dashboard', icon: '📝' },
    { name: 'Attended Mock Details', path: '/history', icon: '📊' },
    { name: 'Question Bank', path: '/question-bank', icon: '📚' },
    { name: 'Feedback', path: '/feedback', icon: '💬' },
  ];


  return (
    <aside className="w-full md:w-64 bg-dark-800 border-b md:border-b-0 md:border-r border-dark-400/40 flex flex-col justify-between shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/35">
            N
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white uppercase">NASSCOM Prep</h1>
            <p className="text-xs text-slate-500">FutureSkills Prime</p>
          </div>
        </div>

        {/* User Profile menu widget */}
        <div className="mb-6 p-4 rounded-xl bg-dark-700/60 border border-dark-400/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-800 text-primary-300 flex items-center justify-center font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-200">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.college}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? 'nav-link-active' : 'nav-link'}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-dark-400/40">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-950/40 transition-all duration-150 border border-transparent hover:border-red-900/35"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
