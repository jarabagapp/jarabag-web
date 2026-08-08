import { apiClient } from './api'
import type { Order } from '@/types'

export class OrdersService {
  static async getConsumerOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<{ data: Order[] }>('/orders/consumer')
    return data.data
  }

  static async getVendorOrders(): Promise<Order[]> {
    const { data } = await apiClient.get<{ data: Order[] }>('/orders/vendor')
    return data.data
  }

  static async reserveBag(bagId: string): Promise<Order> {
    const { data } = await apiClient.post<{ data: Order }>('/orders/reserve', { bagId })
    return data.data
  }

  static async cancelOrder(id: string): Promise<Order> {
    const { data } = await apiClient.post<{ data: Order }>(`/orders/${id}/cancel`)
    return data.data
  }

  static async verifyPickup(id: string, otpCode: string): Promise<{ message: string; order: Order }> {
    const { data } = await apiClient.post<{ data: { message: string; order: Order } }>(`/orders/${id}/pickup`, {
      otpCode,
    })
    return data.data
  }

  static async updateStatus(id: string, status: 'ready' | 'confirmed'): Promise<Order> {
    const { data } = await apiClient.patch<{ data: Order }>(`/orders/${id}/status`, { status })
    return data.data
  }

  static async undoStatus(id: string): Promise<{ message: string; order: Order }> {
    const { data } = await apiClient.post<{ data: { message: string; order: Order } }>(`/orders/${id}/undo`)
    return data.data
  }
}
