import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AuthService, type OtpRequestDto, type OtpVerifyDto } from '../services/auth.service'
import type { User, UserRole } from '@/types'

// Strict Query Key Factory for Auth module
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

export function useProfileQuery(enabled = false) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => AuthService.getProfile(),
    enabled,
    staleTime: 5 * 60 * 1000, // Cache profile for 5 minutes
  })
}

export function useRequestOtpMutation() {
  return useMutation({
    mutationFn: (dto: OtpRequestDto) => AuthService.requestOtp(dto),
  })
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: OtpVerifyDto) => AuthService.verifyOtp(dto),
    onSuccess: (data) => {
      // Seed user profile directly into query cache upon success
      queryClient.setQueryData(authKeys.profile(), data.user)
    },
  })
}

export function useDevLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (role: UserRole) => AuthService.devLogin(role),
    onSuccess: (data) => {
      // Seed user profile directly into query cache upon success
      queryClient.setQueryData(authKeys.profile(), data.user)
    },
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (updates: Partial<Pick<User, 'name' | 'email' | 'phone'>>) =>
      AuthService.updateProfile(updates),
    onSuccess: (updatedUser) => {
      // Update local profile query cache immediately
      queryClient.setQueryData(authKeys.profile(), updatedUser)
    },
  })
}
