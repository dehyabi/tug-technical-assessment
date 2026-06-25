import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreatePackageDto {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  status?: 'active' | 'inactive';
}

export const packagesApi = {
  getAll: () => api.get('/admin/packages'),
  getById: (id: string) => api.get(`/admin/packages/${id}`),
  create: (data: CreatePackageDto) => api.post('/admin/packages', data),
  update: (id: string, data: Partial<CreatePackageDto>) => api.put(`/admin/packages/${id}`, data),
  delete: (id: string) => api.delete(`/admin/packages/${id}`),
};

export default api;
