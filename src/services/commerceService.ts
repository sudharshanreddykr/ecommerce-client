import { apiClient } from '@/utils/apiClient';
import { CartEvent, CartItem, CheckoutHold, Order, Product } from '@/types';

export const commerceService = {
  async recordCartEvent(product: Product, quantity: number) {
    return apiClient.post<CartEvent>('/commerce/cart-events', {
      productId: product.id,
      productName: product.name,
      quantity,
    });
  },

  async acquireCheckoutHold(items: CartItem[]) {
    return apiClient.post<CheckoutHold>('/commerce/holds', {
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
  },

  async getMyHold() {
    return apiClient.get<CheckoutHold | null>('/commerce/holds/me');
  },

  async releaseMyHold() {
    return apiClient.delete<void>('/commerce/holds/me');
  },

  async fetchAllCartEvents() {
    return apiClient.get<CartEvent[]>('/commerce/cart-events');
  },

  async fetchAllHolds() {
    return apiClient.get<CheckoutHold[]>('/commerce/holds');
  },

  async fetchAllOrders() {
    return apiClient.get<Order[]>('/commerce/orders');
  },
};
