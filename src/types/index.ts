/* ─── Geolocation ─── */

export interface GeoCoords {
  lat: number
  lng: number
}

/* ─── User ─── */

export type UserRole = 'consumer' | 'vendor' | 'admin' | 'superadmin'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  permissions?: string[]
  avatarUrl?: string
  walletBalance: number
  createdAt: string
}

/* ─── Vendor ─── */

export type VendorType = 'restaurant' | 'buka' | 'bakery'

export interface Vendor {
  id: string
  userId: string
  name: string
  type: VendorType
  description: string
  location: GeoCoords
  address: string
  rating: number
  totalRatings: number
  verified: boolean
  imageUrl?: string
  openingHours: string
}

/* ─── JaraBag (Surplus Listing) ─── */

export type BagCategory = 'rice-dishes' | 'soups-stews' | 'grills' | 'pastries' | 'mixed' | 'beverages'

export type BagStatus = 'available' | 'reserved' | 'picked-up' | 'expired'

export interface JaraBag {
  id: string
  vendorId: string
  vendor?: Vendor
  title: string
  description: string
  category: BagCategory
  originalPrice: number
  discountedPrice: number
  currency: string
  pickupWindowStart: string
  pickupWindowEnd: string
  preparedAt: string
  listedAt: string
  imageUrl?: string
  images?: string[]
  status: BagStatus
  quantity: number
  quantityRemaining: number
}

/* ─── Order ─── */

export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'picked-up' | 'cancelled' | 'refunded'

export interface Order {
  id: string
  bagId: string
  bag?: JaraBag
  userId: string
  userName?: string
  status: OrderStatus
  otpCode: string
  reservedAt: string
  pickedUpAt?: string
  cancelledAt?: string
  amount: number
  currency: string
}

/* ─── Wallet ─── */

export type TransactionType = 'top-up' | 'payment' | 'refund' | 'commission' | 'withdrawal'

export interface WalletTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  currency: string
  description: string
  reference: string
  createdAt: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  isDefault: boolean
}

/* ─── Rating ─── */

export interface VendorRating {
  id: string
  orderId: string
  vendorId: string
  userId: string
  freshness: number
  aroma: number
  portionHonesty: number
  comment?: string
  createdAt: string
}

/* ─── Toast / UI ─── */

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

/* ─── Notification ─── */

export interface PushNotification {
  id: string
  title: string
  body: string
  type: 'deal' | 'order-update' | 'system'
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

/* ─── API Response Wrapper ─── */

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/* ─── Custom Role & Permissions ─── */
export interface Role {
  id: string
  name: string
  permissions: string[]
  createdAt?: string
  updatedAt?: string
}

/* ─── Email Templates & Campaigns ─── */
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  createdAt?: string
  updatedAt?: string
}

export interface EmailSchedule {
  id: string
  to: string
  subject: string
  body: string
  scheduledAt: string
  status: 'pending' | 'sent' | 'failed'
  error?: string
  createdAt: string
  updatedAt?: string
}

/* ─── Platform Settings ─── */
export interface PlatformSettings {
  maxListingDurationHours?: number
  maxListingDuration?: number
  description?: string
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
  minVendorListingBalance?: number
  standardCashbackRate?: number
  vipCashbackRate?: number
  maxStandardOrderCashback?: number
  maxVipOrderCashback?: number
}

