<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminOrders, useOverrideOrderStatus } from '../composables/useAdminQuery'

interface OrderRecord {
  id: string
  userId: string
  bagId: string
  quantity: number
  amount: number
  status: 'pending' | 'ready-for-pickup' | 'picked-up' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'held-in-escrow' | 'released' | 'refunded'
  isDisputed: boolean
  disputeReason?: string
  createdAt: string
  user?: {
    name: string
    email: string
    phone: string
  }
  bag?: {
    title: string
    originalPrice: number
    discountedPrice: number
  }
  vendor?: {
    name: string
    address: string
  }
}

const page = ref(1)
const pageSize = ref(10)
const filterStatus = ref('')
const filterDisputed = ref('')
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  status: filterStatus.value || undefined,
  isDisputed: filterDisputed.value || undefined,
  search: debouncedSearchQuery.value.trim() || undefined,
}))

const { data, isLoading: loading, error } = useAdminOrders(() => listParams.value)
const orders = computed(() => data.value?.orders || [])
const total = computed(() => data.value?.total || 0)

// ─── Web Audio Real-Time Order Arrival Chime ───
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12) // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {}
}

const previousOrderCount = ref<number | null>(null)
watch(
  () => orders.value.length,
  (newCount) => {
    if (previousOrderCount.value !== null && newCount > previousOrderCount.value) {
      playOrderChime()
    }
    previousOrderCount.value = newCount
  },
  { immediate: true },
)

const overrideOrderStatusMutation = useOverrideOrderStatus()

watch([filterStatus, filterDisputed, debouncedSearchQuery], () => {
  page.value = 1
})

const handlePageChange = (p: number) => {
  page.value = p
}

const handleStatusOverride = async (order: OrderRecord, newStatus: string) => {
  if (!confirm(`Are you sure you want to force order status override to "${newStatus}"?`)) {
    return
  }

  try {
    await overrideOrderStatusMutation.mutateAsync({ id: order.id, status: newStatus })
  } catch (err: any) {
    alert(err.message || 'Failed to override order status.')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Order Registry</h2>
          <p class="text-text-sub text-sm mt-1">Audit customer purchases, resolve escrow disputes, and override state lifecycle.</p>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-text-muted uppercase tracking-wide">Status:</label>
            <select
              v-model="filterStatus"
              class="bg-surface-base border border-border-strong rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="ready-for-pickup">Ready for Pickup</option>
              <option value="picked-up">Picked Up</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-text-muted uppercase tracking-wide">Disputes:</label>
            <select
              v-model="filterDisputed"
              class="bg-surface-base border border-border-strong rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none"
            >
              <option value="">All Orders</option>
              <option value="true">Disputed Only</option>
              <option value="false">Non-Disputed</option>
            </select>
          </div>
        </div>

        <div class="relative w-full lg:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search order ID, user, vendor..."
            class="w-full bg-surface-base border border-border-strong rounded-xl pl-9 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-orange-500"
          />
          <span class="absolute left-3 top-2.5 text-text-muted text-xs">🔍</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">🛍️</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Orders Found</h3>
        <p class="text-text-sub text-sm max-w-sm">No shopping bags or orders match your filters. Clear search tags or check back later.</p>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
        >
          Clear Search
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-subtle bg-surface-base/30 text-xs font-bold uppercase tracking-wider text-text-muted">
                <th class="py-4 px-6">Order ID</th>
                <th class="py-4 px-6">Customer / Vendor</th>
                <th class="py-4 px-6">Bags Detailed</th>
                <th class="py-4 px-6">Escrow Ledger</th>
                <th class="py-4 px-6">Status / Dispute</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="o in orders" :key="o.id" class="hover:bg-surface-base/20 text-sm">
                <td class="py-4 px-6 font-mono text-xs text-text-main">
                  <div>#{{ o.id.toUpperCase() }}</div>
                  <div class="text-[9px] text-text-muted font-sans mt-0.5">{{ formatDate(o.createdAt) }}</div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main" v-if="o.user">{{ o.user.name }}</div>
                  <div class="text-xs text-orange-500 mt-0.5" v-if="o.vendor">🏪 {{ o.vendor.name }}</div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main" v-if="o.bag">{{ o.bag.title }}</div>
                  <div class="text-xs text-text-muted mt-0.5">Qty: {{ o.quantity }} • Rate: {{ formatCurrency(o.amount / o.quantity) }}</div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-bold text-text-main">{{ formatCurrency(o.amount) }}</div>
                  <span
                    :class="{
                      'bg-neutral-800 text-neutral-400 border border-neutral-700': o.paymentStatus === 'pending',
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': o.paymentStatus === 'held-in-escrow',
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': o.paymentStatus === 'released',
                      'bg-red-500/10 text-red-500 border border-red-500/20': o.paymentStatus === 'refunded',
                    }"
                    class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block"
                  >
                    {{ o.paymentStatus }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="space-y-1">
                    <span
                      :class="{
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': o.status === 'pending' || o.status === 'ready-for-pickup',
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': o.status === 'picked-up',
                        'bg-red-500/10 text-red-500 border border-red-500/20': o.status === 'cancelled' || o.status === 'refunded',
                      }"
                      class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    >
                      {{ o.status }}
                    </span>
                    <div v-if="o.isDisputed" class="bg-red-500/10 text-red-500 border border-red-500/20 p-2 rounded-lg text-xs max-w-xs mt-1">
                      <div class="font-bold">⚠️ DISPUTE OPENED</div>
                      <div class="font-light italic text-[11px] mt-0.5">"{{ o.disputeReason || 'No reason specified' }}"</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-right space-y-1.5">
                  <!-- Dispute Actions -->
                  <div v-if="o.isDisputed" class="flex flex-col items-end gap-1.5">
                    <router-link
                      :to="`/admin/disputes?orderId=${o.id}`"
                      class="text-xs bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>⚖️</span> Adjudicate Dispute
                    </router-link>
                  </div>

                  <!-- Regular Status Override shortcuts -->
                  <div v-else class="flex justify-end gap-1.5">
                    <button
                      v-if="o.status === 'pending'"
                      @click="handleStatusOverride(o, 'ready-for-pickup')"
                      class="text-[10px] text-orange-500 hover:bg-orange-500/10 font-bold px-2 py-1 rounded cursor-pointer border border-orange-500/20"
                    >
                      Set Ready
                    </button>
                    <button
                      v-if="o.status === 'ready-for-pickup'"
                      @click="handleStatusOverride(o, 'picked-up')"
                      class="text-[10px] text-emerald-500 hover:bg-emerald-500/10 font-bold px-2 py-1 rounded cursor-pointer border border-emerald-500/20"
                    >
                      Force Pickup
                    </button>
                    <button
                      v-if="o.status === 'pending' || o.status === 'ready-for-pickup'"
                      @click="handleStatusOverride(o, 'cancelled')"
                      class="text-[10px] text-red-500 hover:bg-red-500/10 font-bold px-2 py-1 rounded cursor-pointer border border-red-500/20"
                    >
                      Cancel Order
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 bg-surface-base/30 border-t border-border-subtle flex items-center justify-between">
          <div class="text-xs text-text-muted">
            Showing {{ ((page - 1) * pageSize) + 1 }} to {{ Math.min(page * pageSize, total) }} of {{ total }} records
          </div>
          <div class="flex gap-2">
            <button
              :disabled="page <= 1"
              @click="handlePageChange(page - 1)"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              :disabled="page * pageSize >= total"
              @click="handlePageChange(page + 1)"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
