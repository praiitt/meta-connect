import { apiClient } from './client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export const fetchCategories = () => apiClient.get<Category[]>('/categories');
export const fetchCategory = (id: string) => apiClient.get<Category>(`/categories/${id}`);
export const createCategory = (data: { name: string; description?: string }) => apiClient.post('/categories', data);
export const updateCategory = (id: string, data: { name?: string; description?: string }) => apiClient.patch(`/categories/${id}`, data);
export const deleteCategory = (id: string) => apiClient.delete(`/categories/${id}`);
