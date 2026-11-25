<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminStats, useAdminSettings } from '../composables/useAdminQuery'
import AdminLayout from '../components/AdminLayout.vue'

const authStore = useAuthStore()
const { data: stats, isLoading: loading, error } = useAdminStats()
const { data: settings } = useAdminSettings()

const commissionPct = computed(() => settings.value?.commissionPercentage ?? 5)
const isSuperAdmin = computed(() => authStore.user?.role === 'superadmin')

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(num)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Welcome Header -->
      <div>
        <h2 class="text-3xl font-black text-text-main tracking-tight font-display">System Overview</h2>
        <p class="text-text-sub text-sm mt-1">Real-time telemetry and operation statistics for the Jarabag platform.</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- KPI Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- KPI Card: Consumers -->
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Consumers</p>
            <p class="text-3xl font-black text-text-main font-display mt-2">
              {{ formatNumber(stats?.consumers ?? 0) }}
            </p>
            <span class="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded mt-2 inline-block">Active Users</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">👤</div>
        </div>

        <!-- KPI Card: Vendors -->
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Vendors</p>
            <p class="text-3xl font-black text-text-main font-display mt-2">
              {{ formatNumber(stats?.vendors ?? 0) }}
            </p>
            <span class="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded mt-2 inline-block">Registered</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">🏪</div>
        </div>

        <!-- KPI Card: Active Listings -->
        <router-link
          to="/admin/bags"
          class="bg-surface-raised border border-border-subtle hover:border-orange-500/40 p-6 rounded-2xl flex items-center justify-between shadow-xl transition-colors"
        >
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Active Listings</p>
            <p class="text-3xl font-black text-text-main font-display mt-2">
              {{ formatNumber(stats?.activeBags ?? 0) }}
            </p>
            <span class="text-[10px] text-orange-500 font-semibold bg-orange-500/10 px-2 py-0.5 rounded mt-2 inline-block">Live JaraBags →</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">🍲</div>
        </router-link>

        <!-- KPI Card: Total Orders -->
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Orders</p>
            <p class="text-3xl font-black text-text-main font-display mt-2">
              {{ formatNumber(stats?.orders ?? 0) }}
            </p>
            <span class="text-[10px] text-text-muted font-semibold bg-surface-base px-2 py-0.5 rounded mt-2 inline-block">All Time</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">🛍️</div>
        </div>

        <!-- KPI Card: Gross Volume (GMV) -->
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Gross Transaction Volume</p>
            <p class="text-3xl font-black text-text-main font-display mt-2">
              {{ formatCurrency(stats?.totalVolume ?? 0) }}
            </p>
            <span class="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded mt-2 inline-block">Escrow Released</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">₦</div>
        </div>

        <!-- KPI Card: Platform Commission -->
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-text-muted">Platform Commission ({{ commissionPct }}%)</p>
            <p class="text-3xl font-black text-orange-500 font-display mt-2">
              {{ formatCurrency(stats?.totalCommission ?? 0) }}
            </p>
            <span class="text-[10px] text-orange-500 font-semibold bg-orange-500/10 px-2 py-0.5 rounded mt-2 inline-block">Jarabag Net Earnings</span>
          </div>
          <div class="text-4xl bg-surface-base p-4 rounded-xl">📈</div>
        </div>
      </div>

      <!-- Quick Action Operations panel -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-xl space-y-4">
          <h3 class="text-lg font-bold text-text-main font-display">Administrative Shortcuts</h3>
          <p class="text-xs text-text-sub leading-normal">
            Quickly jump between platform panels to execute actions. You must have the corresponding permissions.
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <router-link
              to="/admin/users"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              👤 Manage Users
            </router-link>
            <router-link
              to="/admin/vendors"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              🏪 Verify Vendors
            </router-link>
            <router-link
              to="/admin/bags"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              🍲 Moderate Deals
            </router-link>
            <router-link
              to="/admin/wallets"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              💳 Financial Ledger
            </router-link>
            <router-link
              to="/admin/orders"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              🛍️ Order Overrides
            </router-link>
            <router-link
              to="/admin/emails"
              class="p-3.5 bg-surface-base hover:bg-surface-base/80 border border-border-strong rounded-xl text-center font-bold text-xs hover:border-orange-500/30 transition-all"
            >
              📣 Push & Emails
            </router-link>
          </div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div class="space-y-2">
            <h3 class="text-lg font-bold text-text-main font-display">System Health & Config</h3>
            <p class="text-xs text-text-sub leading-relaxed">
              Manage platform commissions, boost fees, Jara Pass pricing, cashback loyalty tiers, and no-show escrow split policies.
            </p>
          </div>
          <router-link
            v-if="isSuperAdmin"
            to="/admin/settings"
            class="w-full bg-surface-base border border-border-strong hover:bg-surface-base/80 text-center font-bold text-xs py-3.5 rounded-xl block hover:border-orange-500/30 transition-all"
          >
            ⚙️ Edit Platform Rules
          </router-link>
          <div
            v-else
            class="w-full bg-surface-base/50 border border-border-subtle text-center text-text-muted font-semibold text-xs py-3.5 rounded-xl"
          >
            🔒 Global Platform Rules require Superadmin access
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
