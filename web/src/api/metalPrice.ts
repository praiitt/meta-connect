import { apiClient } from './client';

export interface MetalPrice {
  id: string;
  pricePerKg: number;
  effectiveDate: string;
  createdById: string;
  createdAt: string;
}

export interface UpdateMetalPriceRequest {
  pricePerKg: number;
  effectiveDate?: string;
  notifyRetailers?: boolean;
}

export const metalPriceApi = {
  getCurrent: () => apiClient.get<MetalPrice>('/metal-price/current'),
  
  getHistory: (limit = 30) => 
    apiClient.get<MetalPrice[]>(`/metal-price/history?limit=${limit}`),
  
  updatePrice: (data: UpdateMetalPriceRequest) => 
    apiClient.post<MetalPrice>('/metal-price', data),
};
