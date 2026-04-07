const API_BASE_URL = 'http://localhost:8081/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`API GET error: ${res.status} ${res.statusText}`);
    return res.json();
  },
 post: async (endpoint: string, body: any) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('🔥 Backend Response:', data);
      throw new Error(data.message || `API POST error: ${res.status}`);
    }

    return data;

  } catch (err) {
    console.error('🚨 FETCH ERROR:', err);
    throw err;
  }
},
  patch: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API PATCH error: ${res.status} ${res.statusText}`);
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers: getHeaders() });
    if (!res.ok) throw new Error(`API DELETE error: ${res.status} ${res.statusText}`);
    return res.status !== 204 ? res.json() : null;
  },
};
