const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
};

export const vocab = {
  getAll: ()         => request('/vocab'),
  add:    (body)     => request('/vocab',       { method: 'POST',   body: JSON.stringify(body) }),
  update: (id, body) => request(`/vocab/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  remove: (id)       => request(`/vocab/${id}`, { method: 'DELETE' }),
};
