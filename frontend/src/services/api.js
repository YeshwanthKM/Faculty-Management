import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const facultyApi = {
  getAll: () => axios.get(`${API_BASE_URL}/faculty`),
  create: (data) => axios.post(`${API_BASE_URL}/faculty`, data),
  update: (id, data) => axios.put(`${API_BASE_URL}/faculty/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/faculty/${id}`),
};

export const examApi = {
  getAll: () => axios.get(`${API_BASE_URL}/exams`),
  create: (data) => axios.post(`${API_BASE_URL}/exams`, data),
  bulkCreateWithAllocations: (data) => axios.post(`${API_BASE_URL}/exams/bulk_with_allocations`, data),
  clearAll: () => axios.delete(`${API_BASE_URL}/exams/clear_all`),
  deleteBySession: (date, session) => axios.delete(`${API_BASE_URL}/exams/by_session?exam_date=${date}&session=${session}`),
  update: (id, data) => axios.put(`${API_BASE_URL}/exams/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE_URL}/exams/${id}`),
};

export const allocationApi = {
  getAll: () => axios.get(`${API_BASE_URL}/allocations`),
  generate: (scheduleId) => axios.post(`${API_BASE_URL}/allocations/generate/${scheduleId}`),
  getInsights: () => axios.get(`${API_BASE_URL}/insights`),
};
