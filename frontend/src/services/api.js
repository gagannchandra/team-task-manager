const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';

  // If the response is not JSON (e.g. HTML error page from Railway/proxy)
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}). Please try again.`);
    }
    // Try to parse as JSON anyway (some servers don't set content-type correctly)
    try {
      const data = await res.json();
      return data;
    } catch {
      throw new Error('Unexpected server response. Please try again.');
    }
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Something went wrong');
  return data;
};

const api = {
  // Auth
  register: (body) => fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) => fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Projects
  getProjects: () => fetch(`${API_BASE}/projects`, { headers: getHeaders() }).then(handleResponse),
  getProject: (id) => fetch(`${API_BASE}/projects/${id}`, { headers: getHeaders() }).then(handleResponse),
  createProject: (body) => fetch(`${API_BASE}/projects`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  addMember: (projectId, body) => fetch(`${API_BASE}/projects/${projectId}/members`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  removeMember: (projectId, userId) => fetch(`${API_BASE}/projects/${projectId}/members/${userId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Tasks
  getTasks: (projectId) => fetch(`${API_BASE}/projects/${projectId}/tasks`, { headers: getHeaders() }).then(handleResponse),
  createTask: (projectId, body) => fetch(`${API_BASE}/projects/${projectId}/tasks`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  updateTask: (projectId, taskId, body) => fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  deleteTask: (projectId, taskId) => fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),

  // Dashboard
  getStats: () => fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() }).then(handleResponse),
};

export default api;
