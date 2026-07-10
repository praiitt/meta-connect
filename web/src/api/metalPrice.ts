import { apiClient } from './client';

export type MetalType = "STEEL" | "ALUMINIUM" | "BRASS" | "COPPER" | "BRONZE" | "IRON";

export interface MetalPrice {
  id: string;
  metalType: MetalType;
  pricePerKg: number;
  effectiveDate: string;
  createdById: string;
  createdAt: string;
}

export interface UpdateMetalPriceRequest {
  metalType: string;
  pricePerKg: number;
  effectiveDate?: string;
  notifyRetailers?: boolean;
}

export const metalPriceApi = {
  // Returns array of latest prices for all metals
  getCurrentAll: () => apiClient.get<MetalPrice[]>('/metal-price/current'),
  
  // Returns latest price for specific metal
  getCurrent: (metalType: string) => apiClient.get<MetalPrice>(`/metal-price/current/${metalType}`),
  
  // History for all
  getHistoryAll: (limit = 100) => 
    apiClient.get<MetalPrice[]>(`/metal-price/history-all?limit=${limit}`),

  // History for specific
  getHistory: (metalType: string, limit = 30) => 
    apiClient.get<MetalPrice[]>(`/metal-price/history/${metalType}?limit=${limit}`),
  
  // Update price
  updatePrice: (data: UpdateMetalPriceRequest) => 
    apiClient.post<MetalPrice>('/metal-price', data),
};
