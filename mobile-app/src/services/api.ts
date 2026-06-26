import axios from 'axios';
import { Platform } from 'react-native';

// ---------------------------------------------------------
// API Base URL Configuration
// ---------------------------------------------------------
// Choose the URL that matches your test setup:
//
// 1. Android Emulator:
//    http://10.0.2.2:3001
//
// 2. Physical Android via USB (adb reverse):
//    http://localhost:3001
//    Run this first: adb reverse tcp:3001 tcp:3001
//
// 3. Physical Android via Wi-Fi (same network as PC):
//    http://<YOUR_PC_LAN_IP>:3001
//    Example: http://192.168.1.42:3001
//
// 4. iOS Simulator:
//    http://localhost:3001
// ---------------------------------------------------------

const ANDROID_API_URL = 'http://localhost:3001';

const API_BASE_URL =
  Platform.OS === 'android' ? ANDROID_API_URL : 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
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
