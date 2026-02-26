import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Employee APIs ───

export const getEmployees = () => api.get('/api/employees');

export const getEmployee = (id) => api.get(`/api/employees/${id}`);

export const createEmployee = (data) => api.post('/api/employees', data);

export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`);

// ─── Attendance APIs ───

export const markAttendance = (data) => api.post('/api/attendance', data);

export const getAttendance = (employeeId, dateFrom, dateTo) => {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  return api.get(`/api/attendance/${employeeId}`, { params });
};

export const getAllAttendance = (dateFrom, dateTo) => {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  return api.get('/api/attendance', { params });
};

// ─── Dashboard APIs ───

export const getDashboardSummary = () => api.get('/api/dashboard/summary');

export default api;
