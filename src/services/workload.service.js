const API_URL = 'http://localhost:5000/api/workloads';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const workloadService = {
  getMyWorkload: async () => {
    try {
      const response = await fetch(`${API_URL}/my-workload`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch my workload');
      return data;
    } catch (error) {
      console.error('Error fetching my workload:', error);
      throw error;
    }
  },

  getTeamWorkload: async () => {
    try {
      const response = await fetch(`${API_URL}/team`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch team workload');
      return data;
    } catch (error) {
      console.error('Error fetching team workload:', error);
      throw error;
    }
  },

  updateWellbeing: async (status) => {
    try {
      const response = await fetch(`${API_URL}/wellbeing`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update wellbeing');
      return data;
    } catch (error) {
      console.error('Error updating wellbeing:', error);
      throw error;
    }
  }
};
