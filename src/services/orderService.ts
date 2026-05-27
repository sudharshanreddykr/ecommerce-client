import { CartItem, CheckoutDraft, Order } from '@/types';
import { apiClient } from '@/utils/apiClient';

const CHECKOUT_DRAFT_KEY = 'checkout_draft';

export const orderService = {
  getCheckoutDraft(): CheckoutDraft | null {
    return JSON.parse(sessionStorage.getItem(CHECKOUT_DRAFT_KEY) || 'null');
  },

  saveCheckoutDraft(draft: CheckoutDraft) {
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  },

  clearCheckoutDraft() {
    sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
  },

  fetchMyOrders() {
    return apiClient.get<Order[]>('/commerce/orders/my');
  },

  fetchAllOrders() {
    return apiClient.get<Order[]>('/commerce/orders');
  },

  createOrder(draft: CheckoutDraft, items: CartItem[]) {
    return apiClient.post<Order>('/commerce/orders', {
      status: draft.paymentMethod === 'dummy-card' ? 'paid' : 'processing',
      total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: {
        email: draft.email,
        phoneNumber: draft.phoneNumber,
        addressLine1: draft.addressLine1,
        addressLine2: draft.addressLine2,
        city: draft.city,
        state: draft.state,
        postalCode: draft.postalCode,
        country: draft.country,
        deliveryInstructions: draft.deliveryInstructions,
      },
      paymentMethod: draft.paymentMethod,
    });
  },
};
