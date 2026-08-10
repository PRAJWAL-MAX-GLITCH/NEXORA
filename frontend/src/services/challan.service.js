import api from './api';

export const getChallans = (params) =>
  api.get('/challans', { params }).then((r) => r.data.data);

export const getChallan = (id) =>
  api.get(`/challans/${id}`).then((r) => r.data.data);

export const createChallan = (data) =>
  api.post('/challans', data).then((r) => r.data.data);

export const updateChallan = (id, data) =>
  api.put(`/challans/${id}`, data).then((r) => r.data.data);

export const confirmChallan = (id) =>
  api.post(`/challans/${id}/confirm`).then((r) => r.data.data);

export const cancelChallan = (id) =>
  api.post(`/challans/${id}/cancel`).then((r) => r.data.data);
