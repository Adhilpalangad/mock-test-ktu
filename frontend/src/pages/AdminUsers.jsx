import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.users()
      .then(setUsers)
      .catch(err => setError(err.message || 'Failed to load user accounts.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.college.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-900 text-slate-100">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Registered Users</h2>
            <p className="text-slate-400 mt-1">Manage and view details of student and administrator accounts.</p>
          </div>
          <div className="text-xs bg-dark-800 border border-dark-400/40 px-4 py-2 rounded-lg font-semibold">
            👤 Total Registered: <span className="text-primary-400 font-mono">{users.length}</span>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/40 rounded-xl text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, college, or email..."
            className="w-full max-w-md px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-400/40 text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition-all placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner !w-8 !h-8" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass p-12 text-center text-slate-500">
            📭 No registered users match your search query.
          </div>
        ) : (
          <div className="glass overflow-x-auto border border-dark-400/40 rounded-2xl shadow-xl">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-dark-800 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-dark-400/50">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-400/30">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                    <td className="px-6 py-4 text-slate-400">{user.college}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider border ${
                        user.role === 'admin' 
                          ? 'text-amber-400 bg-amber-950/30 border-amber-900/45' 
                          : 'text-primary-400 bg-primary-950/30 border-primary-900/45'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xxs text-primary-400 font-mono font-bold break-all select-all block max-w-xs" title={user.plainPassword}>
                        {user.plainPassword}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
