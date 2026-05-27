import { apiClient } from '@/utils/apiClient';
import { CreateProductRequest, PaginatedResponse, Product, UpdateProductRequest } from '@/types';

export const productService = {
  fetchProducts(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    return apiClient.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
  },

  fetchMyProducts() {
    return apiClient.get<Product[]>('/products/my-products');
  },

  fetchLowStock(threshold = 10) {
    return apiClient.get<Product[]>(`/products/low-stock?threshold=${threshold}`);
  },

  fetchProductById(id: string) {
    return apiClient.get<Product>(`/products/${id}`);
  },

  createProduct(payload: CreateProductRequest) {
    return apiClient.post<Product>('/products', payload);
  },

  updateProduct(id: string, payload: UpdateProductRequest) {
    return apiClient.put<Product>(`/products/${id}`, payload);
  },

  deleteProduct(id: string) {
    return apiClient.delete<void>(`/products/${id}`);
  },
};
