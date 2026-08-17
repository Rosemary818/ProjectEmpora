const API_URL = 'http://localhost:5000/api/events';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const eventService = {
  getEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_URL}?${queryParams}` : API_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getEventById: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  createEvent: async (data) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateEvent: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteEvent: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },

  publishEvent: async (id) => {
    const response = await fetch(`${API_URL}/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return response.json();
  },

  cancelEvent: async (id) => {
    const response = await fetch(`${API_URL}/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return response.json();
  },

  postponeEvent: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}/postpone`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
