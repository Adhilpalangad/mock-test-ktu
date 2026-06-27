const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let _access = null, _refresh = null;

export function initTokens() {
  _access  = localStorage.getItem('at');
  _refresh = localStorage.getItem('rt');
}
export function saveTokens(a, r) {
  _access = a; _refresh = r;
  localStorage.setItem('at', a);
  localStorage.setItem('rt', r);
}
export function clearTokens() {
  _access = _refresh = null;
  localStorage.removeItem('at');
  localStorage.removeItem('rt');
  localStorage.removeItem('user');
}

async function tryRefresh() {
  if (!_refresh) throw new Error('No refresh token');
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: _refresh })
  });
  if (!res.ok) throw new Error('Refresh failed');
  const d = await res.json();
  saveTokens(d.accessToken, d.refreshToken);
  return d.accessToken;
}

async function req(path, opts = {}, retry = true) {
  initTokens();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (_access) headers['Authorization'] = `Bearer ${_access}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (res.status === 401 && retry) {
    try {
      const token = await tryRefresh();
      headers['Authorization'] = `Bearer ${token}`;
      const r2 = await fetch(`${BASE}${path}`, { ...opts, headers });
      if (!r2.ok) { const e = await r2.json().catch(() => ({})); throw new Error(e.message || 'Request failed'); }
      return r2.json();
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `Error ${res.status}`);
  }
  return res.json();
}

export const authAPI     = {
  signup: d => req('/auth/signup', { method: 'POST', body: JSON.stringify(d) }),
  login:  d => req('/auth/login',  { method: 'POST', body: JSON.stringify(d) }),
};
export const testsAPI    = { active: () => req('/mocktests/active') };
export const attemptsAPI = {
  start:   id     => req('/attempts/start', { method: 'POST', body: JSON.stringify({ mockTestId: id }) }),
  get:     id     => req(`/attempts/${id}`),
  answer:  (id,qId,indices) => req(`/attempts/${id}/answer`, { method: 'PATCH', body: JSON.stringify({ questionId: qId, selectedOptionIndices: indices }) }),
  submit:  id     => req(`/attempts/${id}/submit`, { method: 'POST' }),
  history: ()     => req('/attempts/history'),
  review:  id     => req(`/attempts/${id}/review`),
};
export const questionsAPI = {
  bank: (p={}) => req('/questions/bank?' + new URLSearchParams(p).toString()),
};
export const feedbackAPI  = {
  submit: d => req('/feedback', { method: 'POST', body: JSON.stringify(d) }),
};
export const adminAPI = {
  users: () => req('/admin/users')
};
