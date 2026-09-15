import { apiClient } from './axios';

export const authApi = {
  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data.user;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  updateProfile: async (payload: { name?: string, email?: string, phone?: string, avatar_url?: string }) => {
    const { data } = await apiClient.put('/auth/me', payload);
    return data.user;
  }
};
