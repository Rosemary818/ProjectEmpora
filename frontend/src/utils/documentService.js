const API_URL = 'http://localhost:5000/api/documents';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const documentService = {
  uploadDocument: async (formData) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Note: Do not set Content-Type for FormData, browser sets it automatically with boundary
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to upload document');
    }
    return response.json();
  },

  getDocuments: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const url = query ? `${API_URL}?${query}` : API_URL;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to fetch documents');
    }
    return response.json();
  },

  deleteDocument: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to delete document');
    }
    return true; // 204 No Content
  },

  downloadDocument: async (id, fileName) => {
    const response = await fetch(`${API_URL}/${id}/download`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to download document');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
