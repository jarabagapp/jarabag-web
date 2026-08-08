import { apiClient } from '@/services/api'
import type { User, UserRole } from '@/types'

export interface OtpRequestDto {
  phone: string
  role: UserRole
  name?: string
}

export interface OtpVerifyDto {
  phone: string
  code: string
}

export interface AuthResponseDto {
  accessToken: string
  user: User
}

export class AuthService {
  static async requestOtp(dto: OtpRequestDto): Promise<void> {
    await apiClient.post('/auth/otp/request', dto)
  }

  static async verifyOtp(dto: OtpVerifyDto): Promise<AuthResponseDto> {
    const { data } = await apiClient.post<{ data: AuthResponseDto }>('/auth/otp/verify', dto)
    return data.data
  }

  static async devLogin(role: UserRole): Promise<AuthResponseDto> {
    const { data } = await apiClient.post<{ data: AuthResponseDto }>('/auth/dev-login', { role })
    return data.data
  }

  static async getProfile(): Promise<User> {
    const { data } = await apiClient.get<{ data: User }>('/users/profile')
    return data.data
  }

  static async updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'phone'>>): Promise<User> {
    const { data } = await apiClient.patch<{ data: User }>('/users/profile', updates)
    return data.data
  }
}
