<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { refDebounced } from '@vueuse/core'
import { useQueryClient } from '@tanstack/vue-query'
import AdminLayout from '../components/AdminLayout.vue'
import DisputeAdjudicationDrawer from '../components/DisputeAdjudicationDrawer.vue'
import { useAdminOrders, adminKeys } from '../composables/useAdminQuery'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const activeTab = ref<'pending' | 'resolved' | 'dismissed' | 'all'>('pending')
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 300)
const selectedOrder = ref<any | null>(null)

// We query orders with isDisputed or all disputed records
const { data, isLoading, error } = useAdminOrders(() => ({
  page: 1,
  pageSize: 100,
}))

const allOrders = computed(() => data.value?.orders || [])

// Filter orders that have dispute data (either currently isDisputed or have disputeStatus/category)
const disputeOrders = computed(() => {
  return allOrders.value.filter((o: any) => {
    return (
      o.isDisputed ||
      o.disputeStatus ||
      o.disputeCategory ||
      o.disputeReason ||
      o.status === 'refunded'
    )
  })
})

// Metrics
const openDisputesCount = computed(() => {
  return disputeOrders.value.filter(
    (o: any) => o.disputeStatus === 'pending' || (o.isDisputed && o.disputeStatus !== 'resolved' && o.disputeStatus !== 'dismissed')
  ).length
})

const escrowAtRisk = computed(() => {
  return disputeOrders.value
    .filter(
      (o: any) =>
        o.disputeStatus === 'pending' || (o.isDisputed && o.disputeStatus !== 'resolved' && o.disputeStatus !== 'dismissed')
    )
    .reduce((sum: number, o: any) => sum + (o.amount || 0), 0)
})

const resolutionRate = computed(() => {
  const total = disputeOrders.value.length
  if (!total) return 100
  const resolved = disputeOrders.value.filter(
    (o: any) => o.disputeStatus === 'resolved' || o.disputeStatus === 'dismissed'
  ).length
  return Math.round((resolved / total) * 100)
})

// Tab & Search filtered list
const filteredOrders = computed(() => {
  return disputeOrders.value.filter((o: any) => {
    // Tab filter
    if (activeTab.value === 'pending') {
      const isPending =
        o.disputeStatus === 'pending' || (o.isDisputed && o.disputeStatus !== 'resolved' && o.disputeStatus !== 'dismissed')
      if (!isPending) return false
    } else if (activeTab.value === 'resolved') {
      if (o.disputeStatus !== 'resolved' && o.status !== 'refunded') return false
    } else if (activeTab.value === 'dismissed') {
      if (o.disputeStatus !== 'dismissed') return false
    }

    // Search filter
    if (debouncedSearch.value.trim()) {
      const q = debouncedSearch.value.trim().toLowerCase()
      const matchId = o.id?.toLowerCase().includes(q)
      const matchCust = o.user?.name?.toLowerCase().includes(q) || o.user?.phone?.includes(q)
      const matchVendor = o.vendor?.name?.toLowerCase().includes(q)
      const matchReason = o.disputeReason?.toLowerCase().includes(q)
      if (!matchId && !matchCust && !matchVendor && !matchReason) return false
    }

    return true
  })
})

// Check if route has orderId query parameter on load or change
const syncRouteOrderId = () => {
  const qOrderId = route.query.orderId as string
  if (qOrderId && allOrders.value.length > 0) {
    const found = allOrders.value.find((o: any) => o.id === qOrderId)
    if (found) {
      selectedOrder.value = found
    }
  }
}

watch(() => allOrders.value, syncRouteOrderId, { immediate: true })
watch(() => route.query.orderId, syncRouteOrderId)

const handleDrawerClose = () => {
  selectedOrder.value = null
  if (route.query.orderId) {
    router.replace({ query: { ...route.query, orderId: undefined } })
  }
}

const handleResolved = () => {
  queryClient.invalidateQueries({ queryKey: [...adminKeys.all, 'orders'] })
  queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  handleDrawerClose()
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCategory = (cat?: string) => {
  switch (cat) {
    case 'store_closed':
      return '🏪 Store Closed'
    case 'food_spoiled':
      return '🥩 Food Spoiled'
    case 'missing_items':
      return '📦 Missing Items'
    case 'vendor_refused':
      return '🚫 Vendor Refused'
    default:
      return '⚠️ Other Issue'
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚖️</span>
            <h2 class="text-3xl font-black text-text-main tracking-tight font-display">
              Disputes & Claims Adjudication
            </h2>
          </div>
          <p class="text-text-sub text-sm mt-1">
            Arbitrate customer grievances, inspect photographic evidence, and execute atomic escrow resolution.
          </p>
        </div>
      </div>

      <!-- Top Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Open Disputes</span>
            <span class="p-2 bg-orange-500/10 text-orange-500 rounded-lg text-lg">📋</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-text-main font-display">{{ openDisputesCount }}</span>
            <span class="text-xs text-text-muted">pending review</span>
          </div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Escrow at Risk</span>
            <span class="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-lg">💰</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-text-main font-display">{{ formatCurrency(escrowAtRisk) }}</span>
            <span class="text-xs text-text-muted">held in escrow</span>
          </div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Resolution Rate</span>
            <span class="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-lg">⚖️</span>
          </div>
          <div class="mt-4 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-500 font-display">{{ resolutionRate }}%</span>
            <span class="text-xs text-text-muted">all-time settled</span>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Tabs -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-surface-base rounded-xl border border-border-strong w-full md:w-auto overflow-x-auto">
          <button
            @click="activeTab = 'pending'"
            data-testid="tab-pending"
            :class="{
              'bg-orange-600 text-white font-bold shadow-sm': activeTab === 'pending',
              'text-text-sub hover:text-text-main font-medium': activeTab !== 'pending',
            }"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Pending Review
            <span
              v-if="openDisputesCount > 0"
              class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold"
            >
              {{ openDisputesCount }}
            </span>
          </button>

          <button
            @click="activeTab = 'resolved'"
            data-testid="tab-resolved"
            :class="{
              'bg-orange-600 text-white font-bold shadow-sm': activeTab === 'resolved',
              'text-text-sub hover:text-text-main font-medium': activeTab !== 'resolved',
            }"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Resolved
          </button>

          <button
            @click="activeTab = 'dismissed'"
            data-testid="tab-dismissed"
            :class="{
              'bg-orange-600 text-white font-bold shadow-sm': activeTab === 'dismissed',
              'text-text-sub hover:text-text-main font-medium': activeTab !== 'dismissed',
            }"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Dismissed
          </button>

          <button
            @click="activeTab = 'all'"
            data-testid="tab-all"
            :class="{
              'bg-orange-600 text-white font-bold shadow-sm': activeTab === 'all',
              'text-text-sub hover:text-text-main font-medium': activeTab !== 'all',
            }"
            class="px-4 py-2 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            All Disputes
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search dispute, user, vendor..."
            class="w-full bg-surface-base border border-border-strong rounded-xl pl-9 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-orange-500 transition-all"
          />
          <span class="absolute left-3 top-2.5 text-text-muted text-xs">🔍</span>
        </div>
      </div>

      <!-- Loading / Error States -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredOrders.length === 0"
        class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3"
      >
        <span class="text-4xl">🎉</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Disputes Found</h3>
        <p class="text-text-sub text-sm max-w-sm">
          There are no claims matching the current tab or search criteria.
        </p>
      </div>

      <!-- Table View -->
      <div v-else class="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-subtle bg-surface-base/40 text-xs font-bold uppercase tracking-wider text-text-muted">
                <th class="py-4 px-6">Order ID & Date</th>
                <th class="py-4 px-6">Customer</th>
                <th class="py-4 px-6">Vendor & Food Deal</th>
                <th class="py-4 px-6">Category & Evidence</th>
                <th class="py-4 px-6">Escrow Amount</th>
                <th class="py-4 px-6">Dispute Status</th>
                <th class="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr
                v-for="o in filteredOrders"
                :key="o.id"
                class="hover:bg-surface-base/30 text-sm transition-colors"
              >
                <!-- Order ID -->
                <td class="py-4 px-6">
                  <div class="font-mono font-bold text-xs text-text-main">
                    #{{ o.id.toUpperCase() }}
                  </div>
                  <div class="text-[10px] text-text-muted mt-0.5">
                    {{ formatDate(o.disputedAt || o.createdAt) }}
                  </div>
                </td>

                <!-- Customer -->
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main">
                    {{ o.user?.name || 'Customer' }}
                  </div>
                  <div class="text-xs text-text-muted mt-0.5">
                    {{ o.user?.phone || o.user?.email || 'N/A' }}
                  </div>
                </td>

                <!-- Vendor & Deal -->
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main">
                    {{ o.bag?.title || 'Food Deal' }}
                  </div>
                  <div class="text-xs text-orange-500 mt-0.5">
                    🏪 {{ o.vendor?.name || 'Vendor' }}
                  </div>
                </td>

                <!-- Category & Photos -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      {{ formatCategory(o.disputeCategory) }}
                    </span>
                    <span
                      v-if="(o.disputeEvidencePhotos || o.evidencePhotos)?.length"
                      class="text-[10px] font-bold text-text-muted flex items-center gap-1 bg-surface-base border border-border-strong px-1.5 py-0.5 rounded"
                    >
                      📷 {{ (o.disputeEvidencePhotos || o.evidencePhotos).length }} photo(s)
                    </span>
                  </div>
                  <div v-if="o.disputeReason" class="text-xs text-text-sub italic line-clamp-1 mt-1 max-w-xs">
                    "{{ o.disputeReason }}"
                  </div>
                </td>

                <!-- Amount -->
                <td class="py-4 px-6">
                  <div class="font-extrabold text-text-main">
                    {{ formatCurrency(o.amount) }}
                  </div>
                  <span
                    class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-base border border-border-strong text-text-muted inline-block mt-0.5"
                  >
                    {{ o.paymentStatus }}
                  </span>
                </td>

                <!-- Status -->
                <td class="py-4 px-6">
                  <span
                    :class="{
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20':
                        (o.disputeStatus || 'pending') === 'pending',
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20':
                        o.disputeStatus === 'resolved',
                      'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20':
                        o.disputeStatus === 'dismissed',
                    }"
                    class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  >
                    {{ o.disputeStatus || (o.isDisputed ? 'pending' : 'resolved') }}
                  </span>
                </td>

                <!-- Action Button -->
                <td class="py-4 px-6 text-right">
                  <button
                    @click="selectedOrder = o"
                    data-testid="adjudicate-btn"
                    class="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                  >
                    <span>⚖️</span>
                    <span>Review & Adjudicate</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Adjudication Drawer -->
    <DisputeAdjudicationDrawer
      :open="!!selectedOrder"
      :order="selectedOrder"
      @close="handleDrawerClose"
      @resolved="handleResolved"
    />
  </AdminLayout>
</template>
