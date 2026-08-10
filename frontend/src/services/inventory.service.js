import api from './api';

export const stockIn = (data) =>
  api.post('/inventory/stock-in', data).then((r) => r.data.data);

export const stockOut = (data) =>
  api.post('/inventory/stock-out', data).then((r) => r.data.data);

export const getMovements = (params) =>
  api.get('/inventory/movements', { params }).then((r) => r.data.data);

export const getLowStock = () =>
  api.get('/inventory/low-stock').then((r) => r.data.data);
