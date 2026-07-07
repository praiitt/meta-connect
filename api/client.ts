import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL points to the dev environment
const BASE_URL = 'https://metal-connect.dev.rraasi.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for request:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
