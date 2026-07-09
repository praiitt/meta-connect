import { apiClient } from './client';

export const fetchOverview = () => apiClient.get('/analytics/overview');
export const fetchRevenueTrend = (days: number = 30) => apiClient.get(`/analytics/revenue-trend?days=${days}`);
export const fetchTopProducts = () => apiClient.get('/analytics/top-products');
