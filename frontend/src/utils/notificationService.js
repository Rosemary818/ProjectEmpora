import { API_BASE_URL } from '../config/api';
const API_URL = `${API_BASE_URL}/api/notifications`;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const notificationService = {
  getNotifications: async () => {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_URL}/unread-count`, {
      method: 'GET',
      headers: getHeaders()
    });
    return response.json();
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_URL}/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return response.json();
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_URL}/mark-all-read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return response.json();
  }
};
