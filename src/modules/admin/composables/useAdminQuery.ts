import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { AdminService } from '../services/admin.service'
import type {
  ListParams,
  ResolveDisputePayload,
  BroadcastNotificationPayload,
} from '../services/admin.service'

// Query Key Factory
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  users: (params: ListParams) => [...adminKeys.all, 'users', params] as const,
  roles: () => [...adminKeys.all, 'roles'] as const,
  vendors: (params: ListParams) => [...adminKeys.all, 'vendors', params] as const,
  bags: (params: ListParams) => [...adminKeys.all, 'bags', params] as const,
  transactions: (params: ListParams) => [...adminKeys.all, 'transactions', params] as const,
  orders: (params: ListParams) => [...adminKeys.all, 'orders', params] as const,
  emailTemplates: () => [...adminKeys.all, 'emailTemplates'] as const,
  emailSchedules: (params: ListParams) => [...adminKeys.all, 'emailSchedules', params] as const,
  walletStats: () => [...adminKeys.all, 'walletStats'] as const,
  notificationStats: () => [...adminKeys.all, 'notificationStats'] as const,
}

// ─── Stats & Settings ───

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () => AdminService.getStats(),
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: adminKeys.settings(),
    queryFn: () => AdminService.getSettings(),
  })
}

export function useAdminWalletStats() {
  return useQuery({
    queryKey: adminKeys.walletStats(),
    queryFn: () => AdminService.getWalletStats(),
  })
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.settings() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
    },
  })
}

// ─── Users ───

export function useAdminUsers(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.users(params())),
    queryFn: () => AdminService.getUsers(params()),
  })
}

export function useCreateAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    },
  })
}

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: { permissions: string[]; customRole: string | null }
    }) => AdminService.updateAdminPermissions(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    },
  })
}

export function useToggleBlockUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isBlocked, notify }: { id: string; isBlocked: boolean; notify?: boolean }) =>
      AdminService.toggleBlockUser(id, isBlocked, notify),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'bags'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
    },
  })
}

// ─── Vendors ───

export function useAdminVendors(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.vendors(params())),
    queryFn: () => AdminService.getVendors(params()),
  })
}

export function useToggleVerifyVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      verified,
      notify,
      verificationLevel,
    }: {
      id: string
      verified: boolean
      notify?: boolean
      verificationLevel?: 'unverified' | 'verified' | 'gold'
    }) => AdminService.toggleVerifyVendor(id, verified, notify, verificationLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'vendors'] })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'bags'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
    },
  })
}

export function useUnsuspendVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resetStrikes }: { id: string; resetStrikes?: boolean }) =>
      AdminService.unsuspendVendor(id, resetStrikes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'vendors'] })
    },
  })
}

// ─── Bags / Deal Listings ───

export function useAdminBags(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.bags(params())),
    queryFn: () => AdminService.getBags(params()),
  })
}

export function useUpdateAdminBagStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string
      status: 'available' | 'expired'
      reason?: string
    }) => AdminService.updateBagStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'bags'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
    },
  })
}

// ─── Wallets ───

export function useAdminTransactions(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.transactions(params())),
    queryFn: () => AdminService.getTransactions(params()),
  })
}

export function useOverrideBalance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.overrideBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'transactions'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    },
  })
}

// ─── Orders ───

export function useAdminOrders(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.orders(params())),
    queryFn: () => AdminService.getOrders(params()),
    refetchInterval: 30000,
  })
}

export function useOverrideOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      AdminService.overrideOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
    },
  })
}

export function useResolveDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveDisputePayload }) =>
      AdminService.resolveDispute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'vendors'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
    },
  })
}

// ─── Roles ───

export function useAdminRoles() {
  return useQuery({
    queryKey: adminKeys.roles(),
    queryFn: () => AdminService.getRoles(),
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string; permissions: string[] } }) =>
      AdminService.updateRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() })
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] })
    },
  })
}

// ─── Email Templates ───

export function useAdminTemplates() {
  return useQuery({
    queryKey: adminKeys.emailTemplates(),
    queryFn: () => AdminService.getTemplates(),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.emailTemplates() })
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: { name: string; subject: string; body: string }
    }) => AdminService.updateTemplate(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.emailTemplates() })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.emailTemplates() })
    },
  })
}

// ─── Email Schedules ───

export function useAdminEmailSchedules(params: () => ListParams) {
  return useQuery({
    queryKey: computed(() => adminKeys.emailSchedules(params())),
    queryFn: () => AdminService.getEmailSchedules(params()),
  })
}

export function useScheduleEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.scheduleEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'emailSchedules'] })
    },
  })
}

export function useDeleteEmailSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: AdminService.deleteEmailSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'emailSchedules'] })
    },
  })
}

// ─── Push Notification Broadcasts ───

export function useAdminNotificationStats() {
  return useQuery({
    queryKey: adminKeys.notificationStats(),
    queryFn: () => AdminService.getNotificationStats(),
  })
}

export function useBroadcastNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: BroadcastNotificationPayload) => AdminService.broadcastNotification(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.notificationStats() })
    },
  })
}
