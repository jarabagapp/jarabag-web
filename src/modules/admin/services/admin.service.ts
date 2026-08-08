import { apiClient } from '@/services/api'
import type { User, WalletTransaction, Role, EmailTemplate, EmailSchedule } from '@/types'

export interface ListParams {
  page?: number
  pageSize?: number
  role?: string
  status?: string
  isDisputed?: string
  search?: string
}

export class AdminService {
  // Stats
  static async getStats(): Promise<any> {
    const { data } = await apiClient.get('/admin/stats')
    return data.data || data
  }

  // Settings
  static async getSettings(): Promise<any> {
    const { data } = await apiClient.get('/bags/settings')
    return data.data || data
  }

  static async updateSettings(dto: {
    maxListingDurationHours: number
    description: string
    inconvenienceAmount?: number
    commissionPercentage?: number
    maxCommissionAmount?: number
    noShowFirstConsumerRefundPercentage?: number
    noShowFirstVendorSharePercentage?: number
    noShowFirstPlatformSharePercentage?: number
    noShowRepeatConsumerRefundPercentage?: number
    noShowRepeatVendorSharePercentage?: number
    noShowRepeatPlatformSharePercentage?: number
    lateCancelConsumerRefundPercentage?: number
    lateCancelVendorSharePercentage?: number
    lateCancelPlatformSharePercentage?: number
    notifyUsers?: boolean
    minVendorListingBalance?: number
    standardCashbackRate?: number
    vipCashbackRate?: number
    maxStandardOrderCashback?: number
    maxVipOrderCashback?: number
  }): Promise<any> {
    const { data } = await apiClient.patch('/bags/settings', dto)
    return data.data || data
  }

  // Users
  static async getUsers(params: ListParams): Promise<{ users: User[]; total: number }> {
    const { data } = await apiClient.get('/admin/users', { params })
    return data.data || data
  }

  static async createAdmin(dto: {
    name: string
    email: string
    phone: string
    role: 'admin' | 'superadmin'
    permissions?: string[]
    customRole?: string | null
    password?: string
  }): Promise<User> {
    const { data } = await apiClient.post('/admin/users', dto)
    return data.data || data
  }

  static async updateAdminPermissions(
    id: string,
    dto: { permissions: string[]; customRole: string | null }
  ): Promise<User> {
    const { data } = await apiClient.put(`/admin/users/${id}/permissions`, dto)
    return data.data || data
  }

  static async toggleBlockUser(id: string, isBlocked: boolean, notify?: boolean): Promise<any> {
    const { data } = await apiClient.put(`/admin/users/${id}/block`, { isBlocked, notify })
    return data.data || data
  }

  // Vendors
  static async getVendors(params: ListParams): Promise<{ vendors: any[]; total: number }> {
    const { data } = await apiClient.get('/admin/vendors', { params })
    return data.data || data
  }

  static async toggleVerifyVendor(id: string, verified: boolean, notify?: boolean): Promise<any> {
    const { data } = await apiClient.put(`/admin/vendors/${id}/verify`, { verified, notify })
    return data.data || data
  }

  // Wallets & Transactions
  static async getTransactions(params: ListParams): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const { data } = await apiClient.get('/admin/wallets/transactions', { params })
    return data.data || data
  }

  static async overrideBalance(dto: {
    userId: string
    amount: number
    type: 'credit' | 'debit'
    description: string
  }): Promise<any> {
    const { data } = await apiClient.post('/admin/wallets/override', dto)
    return data.data || data
  }

  // Orders
  static async getOrders(params: ListParams): Promise<{ orders: any[]; total: number }> {
    const { data } = await apiClient.get('/admin/orders', { params })
    return data.data || data
  }

  static async overrideOrderStatus(id: string, status: string): Promise<any> {
    const { data } = await apiClient.put(`/admin/orders/${id}/status`, { status })
    return data.data || data
  }

  static async resolveDispute(id: string, resolution: 'refund' | 'dismiss'): Promise<any> {
    const { data } = await apiClient.put(`/admin/orders/${id}/resolve-dispute`, { resolution })
    return data.data || data
  }

  // Roles
  static async getRoles(): Promise<Role[]> {
    const { data } = await apiClient.get('/admin/roles')
    return data.data || data
  }

  static async createRole(dto: { name: string; permissions: string[] }): Promise<Role> {
    const { data } = await apiClient.post('/admin/roles', dto)
    return data.data || data
  }

  static async updateRole(id: string, dto: { name: string; permissions: string[] }): Promise<Role> {
    const { data } = await apiClient.put(`/admin/roles/${id}`, dto)
    return data.data || data
  }

  static async deleteRole(id: string): Promise<any> {
    const { data } = await apiClient.delete(`/admin/roles/${id}`)
    return data.data || data
  }

  // Email Templates
  static async getTemplates(): Promise<EmailTemplate[]> {
    const { data } = await apiClient.get('/admin/emails/templates')
    return data.data || data
  }

  static async createTemplate(dto: { name: string; subject: string; body: string }): Promise<EmailTemplate> {
    const { data } = await apiClient.post('/admin/emails/templates', dto)
    return data.data || data
  }

  static async updateTemplate(id: string, dto: { name: string; subject: string; body: string }): Promise<EmailTemplate> {
    const { data } = await apiClient.put(`/admin/emails/templates/${id}`, dto)
    return data.data || data
  }

  static async deleteTemplate(id: string): Promise<any> {
    const { data } = await apiClient.delete(`/admin/emails/templates/${id}`)
    return data.data || data
  }

  // Email Schedules
  static async getEmailSchedules(params: ListParams): Promise<{ schedules: EmailSchedule[]; total: number }> {
    const { data } = await apiClient.get('/admin/emails/schedule', { params })
    return data.data || data
  }

  static async scheduleEmail(dto: { to: string; subject: string; body: string; scheduledAt: string; targetingFilters?: any }): Promise<EmailSchedule> {
    const { data } = await apiClient.post('/admin/emails/schedule', dto)
    return data.data || data
  }

  static async getWalletStats(): Promise<{ totals: any; daily: any[] }> {
    const { data } = await apiClient.get('/admin/wallets/stats')
    return data.data || data
  }
}
