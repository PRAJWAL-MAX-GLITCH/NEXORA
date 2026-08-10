import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data; // { token, id, name, email, role }
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data.data;
};
