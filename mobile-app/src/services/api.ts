import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface MobilePackage {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string;
}

export const packagesApi = {
  getActivePackages: () => api.get<MobilePackage[]>('/mobile/packages'),
};

export default api;
