const API_URL = 'http://localhost:5000/api/announcements';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const announcementService = {
  getAnnouncements: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_URL}?${queryParams}` : API_URL;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getAnnouncementById: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  createAnnouncement: async (data) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateAnnouncement: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteAnnouncement: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.json();
  },

  publishAnnouncement: async (id) => {
    const response = await fetch(`${API_URL}/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return response.json();
  },

  archiveAnnouncement: async (id) => {
    const response = await fetch(`${API_URL}/${id}/archive`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return response.json();
  }
};
