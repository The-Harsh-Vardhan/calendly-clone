const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const res = await fetch(url, config);
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Event Types
export const eventTypesApi = {
  list: () => request('/event-types'),
  getBySlug: (slug) => request(`/event-types/${slug}`),
  getById: (id) => request(`/event-types/${id}/details`),
  create: (data) => request('/event-types', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/event-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/event-types/${id}`, { method: 'DELETE' }),
};

// Availability
export const availabilityApi = {
  get: () => request('/availability'),
  update: (data) => request('/availability', { method: 'PUT', body: JSON.stringify(data) }),
  getSlots: (slug, date, timezone) => 
    request(`/availability/${slug}/${date}?timezone=${encodeURIComponent(timezone)}`),
};

// Bookings
export const bookingsApi = {
  list: (type) => request(`/bookings?type=${type}`),
  create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};
