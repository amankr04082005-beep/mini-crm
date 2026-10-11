const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5200/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('crm_token');
  let res;

  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.message || 'Something went wrong', res.status);
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),

  getLeads: ({ status, search } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request(`/leads${qs ? `?${qs}` : ''}`);
  },
  getStats: () => request('/leads/stats/summary'),
  createLead: (body) => request('/leads', { method: 'POST', body }),
  updateLead: (id, body) => request(`/leads/${id}`, { method: 'PUT', body }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  addNote: (id, text) => request(`/leads/${id}/notes`, { method: 'POST', body: { text } }),
};
