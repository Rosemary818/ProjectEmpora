const API_URL = 'http://localhost:5000/api/activities';

export const getRecentActivities = async (filter = 'all', limit = 0) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No authentication token found');

  const url = new URL(API_URL);
  if (filter) url.searchParams.append('filter', filter);
  if (limit > 0) url.searchParams.append('limit', limit);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch activities');
  }

  return data.data;
};
