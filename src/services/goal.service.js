const API_URL = 'http://localhost:5000/api/goals';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const goalService = {
  // --- Employee Methods ---
  getEmployeeGoals: async (status = 'All') => {
    try {
      const response = await fetch(`${API_URL}/employee?status=${status}`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch goals');
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateGoalProgress: async (id, progress) => {
    try {
      const response = await fetch(`${API_URL}/employee/${id}/progress`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ progress })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update progress');
      return data;
    } catch (error) {
      throw error;
    }
  },

  // --- Manager Methods ---
  createGoal: async (goalData) => {
    try {
      const response = await fetch(`${API_URL}/manager`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create goal');
      return data;
    } catch (error) {
      throw error;
    }
  },

  getManagerGoals: async (status = 'All', employeeId = 'All') => {
    try {
      const response = await fetch(`${API_URL}/manager?status=${status}&employeeId=${employeeId}`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch goals');
      return data;
    } catch (error) {
      throw error;
    }
  },

  updateGoalManager: async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/manager/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update goal');
      return data;
    } catch (error) {
      throw error;
    }
  },
};
