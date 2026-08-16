import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { AdminService } from '../services/admin.service'
import type { ListParams } from '../services/admin.service'

// Query Key Factory
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  users: (params: ListParams) => [...adminKeys.all, 'users', params] as const,
  roles: () => [...adminKeys.all, 'roles'] as const,
  vendors: (params: ListParams) => [...adminKeys.all, 'vendors', params] as const,
  transactions: (params: ListParams) => [...adminKeys.all, 'transactions', params] as const,
  orders: (params: ListParams) => [...adminKeys.all, 'orders', params] as const,
  emailTemplates: () => [...adminKeys.all, 'emailTemplates'] as const,
  emailSchedules: (params: ListParams) => [...adminKeys.all, 'emailSchedules', params] as const,
  walletStats: () => [...adminKeys.all, 'walletStats'] as const,
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
    mutationFn: ({ id, dto }: { id: string; dto: { permissions: string[]; customRole: string | null } }) =>
      AdminService.updateAdminPermissions(id, dto),
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
    mutationFn: ({ id, verified, notify }: { id: string; verified: boolean; notify?: boolean }) =>
      AdminService.toggleVerifyVendor(id, verified, notify),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'vendors'] })
      queryClient.invalidateQueries({ queryKey: adminKeys.walletStats() })
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
    },
  })
}

export function useResolveDispute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: 'refund' | 'dismiss' }) =>
      AdminService.resolveDispute(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] })
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
    mutationFn: ({ id, dto }: { id: string; dto: { name: string; subject: string; body: string } }) =>
      AdminService.updateTemplate(id, dto),
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
