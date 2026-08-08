<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminTransactions, useOverrideBalance, useAdminWalletStats } from '../composables/useAdminQuery'

interface TransactionRecord {
  id: string
  userId: string
  type: 'top-up' | 'withdrawal' | 'payment' | 'refund'
  amount: number
  currency: string
  description: string
  reference: string
  createdAt: string
  user?: {
    name: string
    email: string
    phone: string
  }
}

const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

// Override Form States
const showOverrideModal = ref(false)
const targetUserId = ref('')
const overrideAmount = ref(0)
const overrideType = ref<'credit' | 'debit'>('credit')
const overrideDesc = ref('')
const overrideLoading = ref(false)
const overrideError = ref('')

const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: debouncedSearchQuery.value.trim() || undefined,
}))

// Queries
const { data, isLoading: loading, error } = useAdminTransactions(() => listParams.value)
const transactions = computed<TransactionRecord[]>(() => (data.value?.transactions as any) || [])
const total = computed(() => data.value?.total || 0)

const { data: statsData, isLoading: statsLoading } = useAdminWalletStats()
const totals = computed(() => statsData.value?.totals || { totalPayments: 0, totalTopups: 0, totalWithdrawals: 0, totalRefunds: 0, totalCommissions: 0, totalOverrides: 0 })
const dailyStats = computed(() => statsData.value?.daily || [])

const overrideBalanceMutation = useOverrideBalance()

// SVG Chart Calculations
const chartWidth = 600
const chartHeight = 220

const maxVal = computed(() => {
  const data = dailyStats.value
  if (data.length === 0) return 1000
  return Math.max(...data.map(d => Math.max(d.payments, d.commissions * 8)), 1000)
})

const pointsCommissions = computed(() => {
  const data = dailyStats.value
  if (data.length < 2) return ''
  const max = maxVal.value
  return data.map((d, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 40) + 20
    const y = chartHeight - 30 - (d.commissions / max) * (chartHeight - 60)
    return `${x},${y}`
  }).join(' ')
})

const pointsPayments = computed(() => {
  const data = dailyStats.value
  if (data.length < 2) return ''
  const max = maxVal.value
  return data.map((d, index) => {
    const x = (index / (data.length - 1)) * (chartWidth - 40) + 20
    const y = chartHeight - 30 - (d.payments / max) * (chartHeight - 60)
    return `${x},${y}`
  }).join(' ')
})

const pathCommissionsArea = computed(() => {
  const pts = pointsCommissions.value
  if (!pts) return ''
  const pointsArray = pts.split(' ')
  if (pointsArray.length === 0) return ''
  const firstPt = pointsArray[0]
  const lastPt = pointsArray[pointsArray.length - 1]
  if (!firstPt || !lastPt) return ''
  const firstX = firstPt.split(',')[0]
  const lastX = lastPt.split(',')[0]
  if (firstX === undefined || lastX === undefined) return ''
  const bottomY = chartHeight - 30
  return `M ${firstX} ${bottomY} L ${pts} L ${lastX} ${bottomY} Z`
})

const pathPaymentsArea = computed(() => {
  const pts = pointsPayments.value
  if (!pts) return ''
  const pointsArray = pts.split(' ')
  if (pointsArray.length === 0) return ''
  const firstPt = pointsArray[0]
  const lastPt = pointsArray[pointsArray.length - 1]
  if (!firstPt || !lastPt) return ''
  const firstX = firstPt.split(',')[0]
  const lastX = lastPt.split(',')[0]
  if (firstX === undefined || lastX === undefined) return ''
  const bottomY = chartHeight - 30
  return `M ${firstX} ${bottomY} L ${pts} L ${lastX} ${bottomY} Z`
})

// Tooltip / hovering helper for charts
const hoverIndex = ref<number | null>(null)
const hoveredDay = computed(() => {
  if (hoverIndex.value === null || !dailyStats.value[hoverIndex.value]) return null
  return dailyStats.value[hoverIndex.value]
})

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mIdx = parseInt(parts[1] || '0', 10) - 1
  return `${months[mIdx] || ''} ${parseInt(parts[2] || '0', 10)}`
}

watch(debouncedSearchQuery, () => {
  page.value = 1
})

const handlePageChange = (p: number) => {
  page.value = p
}

const handleWalletOverrideSubmit = async () => {
  if (!targetUserId.value || overrideAmount.value <= 0 || !overrideDesc.value) {
    overrideError.value = 'Target user ID, positive amount, and explanation description are required'
    return
  }

  overrideLoading.value = true
  overrideError.value = ''

  try {
    await overrideBalanceMutation.mutateAsync({
      userId: targetUserId.value,
      amount: overrideAmount.value,
      type: overrideType.value,
      description: overrideDesc.value,
    })

    showOverrideModal.value = false
    targetUserId.value = ''
    overrideAmount.value = 0
    overrideDesc.value = ''
  } catch (err: any) {
    overrideError.value = err.message || 'Failed to override user wallet balance.'
  } finally {
    overrideLoading.value = false
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
    maximumFractionDigits: 0,
  }).format(amount)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Wallets & Ledger</h2>
          <p class="text-text-sub text-sm mt-1">Audit escrow balances, adjust wallet deposits, and investigate payment logs.</p>
        </div>

        <div>
          <button
            @click="showOverrideModal = true"
            class="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all text-sm cursor-pointer"
          >
            💸 Balance Adjustment
          </button>
        </div>
      </div>

      <!-- Financial Overview Cards -->
      <div v-if="!statsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-surface-raised border border-border-subtle p-5 rounded-2xl shadow-sm">
          <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Volume</div>
          <div class="text-2xl font-black text-text-main mt-1 font-display">{{ formatCurrency(totals.totalPayments) }}</div>
          <div class="text-[10px] text-text-muted mt-1">Gross order payments processed</div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-5 rounded-2xl shadow-sm">
          <div class="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Platform Revenue (5%)</div>
          <div class="text-2xl font-black text-emerald-500 mt-1 font-display">{{ formatCurrency(totals.totalCommissions) }}</div>
          <div class="text-[10px] text-emerald-600/80 mt-1 font-semibold">Jarabag recurring platform profit</div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-5 rounded-2xl shadow-sm">
          <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Ledger Adjustments</div>
          <div class="text-2xl font-black text-amber-500 mt-1 font-display">{{ formatCurrency(totals.totalOverrides) }}</div>
          <div class="text-[10px] text-text-muted mt-1">Manual overrides credit & debit</div>
        </div>

        <div class="bg-surface-raised border border-border-subtle p-5 rounded-2xl shadow-sm">
          <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Escrow Deposits</div>
          <div class="text-2xl font-black text-text-main mt-1 font-display">{{ formatCurrency(totals.totalTopups) }}</div>
          <div class="text-[10px] text-text-muted mt-1">Net customer top-up capital</div>
        </div>
      </div>

      <!-- Ledger Profitability Chart -->
      <div v-if="!statsLoading && dailyStats.length > 0" class="bg-surface-raised border border-border-subtle p-6 rounded-2xl shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-text-sub font-display">Revenue and Volume Trends (Last 30 Days)</h3>
            <div class="flex gap-4 text-xs font-semibold">
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-orange-500 rounded-full inline-block"></span> Daily Volume</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span> 5% Commission</span>
            </div>
          </div>

          <!-- SVG Chart Area -->
          <div class="relative bg-surface-base/30 rounded-xl p-3 border border-border-subtle overflow-hidden">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="w-full h-auto overflow-visible">
              <!-- Y Axis Grid Lines -->
              <line :x1="20" :y1="chartHeight - 30" :x2="chartWidth - 20" :y2="chartHeight - 30" stroke="var(--color-border-subtle)" stroke-width="1" />
              <line :x1="20" :y1="(chartHeight - 30) / 2" :x2="chartWidth - 20" :y2="(chartHeight - 30) / 2" stroke="var(--color-border-subtle)" stroke-width="1" stroke-dasharray="4" />
              <line :x1="20" :y1="30" :x2="chartWidth - 20" :y2="30" stroke="var(--color-border-subtle)" stroke-width="1" stroke-dasharray="4" />

              <!-- Payments Line & Area -->
              <path :d="pathPaymentsArea" fill="url(#paymentsGrad)" opacity="0.05" />
              <polyline :points="pointsPayments" fill="none" stroke="oklch(0.68 0.19 50)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Commissions Line & Area -->
              <path :d="pathCommissionsArea" fill="url(#commGrad)" opacity="0.1" />
              <polyline :points="pointsCommissions" fill="none" stroke="oklch(0.65 0.18 155)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Interactive Hover Bars -->
              <rect
                v-for="(d, idx) in dailyStats"
                :key="idx"
                :x="((idx / (dailyStats.length - 1)) * (chartWidth - 40) + 20) - ((chartWidth - 40) / dailyStats.length) / 2"
                :y="10"
                :width="(chartWidth - 40) / dailyStats.length"
                :height="chartHeight - 40"
                fill="transparent"
                class="cursor-pointer hover:fill-orange-500/5"
                @mouseenter="hoverIndex = idx"
                @mouseleave="hoverIndex = null"
              />

              <!-- X-Axis Labels (draw first, middle, last date) -->
              <text :x="20" :y="chartHeight - 10" font-size="10" fill="var(--color-text-muted)" text-anchor="start" font-weight="bold">
                {{ formatShortDate(dailyStats[0]?.date) }}
              </text>
              <text :x="chartWidth / 2" :y="chartHeight - 10" font-size="10" fill="var(--color-text-muted)" text-anchor="middle" font-weight="bold">
                {{ formatShortDate(dailyStats[Math.floor(dailyStats.length / 2)]?.date) }}
              </text>
              <text :x="chartWidth - 20" :y="chartHeight - 10" font-size="10" fill="var(--color-text-muted)" text-anchor="end" font-weight="bold">
                {{ formatShortDate(dailyStats[dailyStats.length - 1]?.date) }}
              </text>

              <!-- Definitions for Gradients -->
              <defs>
                <linearGradient id="paymentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="oklch(0.68 0.19 50)" />
                  <stop offset="100%" stop-color="oklch(0.68 0.19 50)" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="oklch(0.65 0.18 155)" />
                  <stop offset="100%" stop-color="oklch(0.65 0.18 155)" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- Profitability Analysis Side Panel -->
        <div class="bg-surface-base/30 border border-border-subtle p-5 rounded-xl flex flex-col justify-between">
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-text-sub">Profitability Audit</h4>
            
            <div v-if="hoveredDay" class="bg-surface-raised border border-border-strong rounded-xl p-3.5 space-y-2.5">
              <div class="text-[10px] font-bold text-text-muted uppercase tracking-wider">Stats for {{ formatShortDate(hoveredDay.date) }}</div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-text-muted block text-[10px]">Daily Payments</span>
                  <span class="font-bold text-text-main text-sm">{{ formatCurrency(hoveredDay.payments) }}</span>
                </div>
                <div>
                  <span class="text-emerald-500 block text-[10px]">Estimated Profit</span>
                  <span class="font-bold text-emerald-500 text-sm">{{ formatCurrency(hoveredDay.commissions) }}</span>
                </div>
                <div>
                  <span class="text-text-muted block text-[10px]">Top-ups</span>
                  <span class="font-semibold text-text-sub">{{ formatCurrency(hoveredDay.topups) }}</span>
                </div>
                <div>
                  <span class="text-text-muted block text-[10px]">Refunds</span>
                  <span class="font-semibold text-text-sub">{{ formatCurrency(hoveredDay.refunds) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="bg-surface-base/50 border border-border-subtle rounded-xl p-4 text-center py-6 text-xs text-text-muted italic">
              Hover over chart nodes to audit day-by-day financials.
            </div>

            <div class="space-y-2">
              <h5 class="text-xs font-bold text-text-main">Is Jarabag Profitable?</h5>
              <p class="text-xs text-text-sub leading-relaxed">
                Yes! Jarabag earns a sustainable <span class="font-bold text-emerald-500">5.0% commission</span> on all successful order transactions.
                Manual overrides are isolated administrative adjustments (compensation, corrections) and do not affect underlying transaction commission margins.
              </p>
            </div>
          </div>

          <div class="border-t border-border-subtle pt-4 mt-4 flex items-center justify-between">
            <span class="text-xs text-text-sub font-semibold">Net Platform Margin:</span>
            <span class="text-sm font-black text-emerald-500">5.0% Fixed</span>
          </div>
        </div>
      </div>

      <!-- Search Toolbar -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex items-center justify-between gap-4">
        <div class="text-xs font-bold text-text-muted uppercase tracking-wide">
          Total matched: {{ total }}
        </div>
        <div class="relative w-full md:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search reference, email, desc..."
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
      <div v-else-if="transactions.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">💳</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Transactions Logged</h3>
        <p class="text-text-sub text-sm max-w-sm">No transaction matches your query. Clear search terms or adjust a wallet balance to initiate a ledger record.</p>
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
                <th class="py-4 px-6">Transaction Ref</th>
                <th class="py-4 px-6">Account Holder</th>
                <th class="py-4 px-6">Category</th>
                <th class="py-4 px-6">Description</th>
                <th class="py-4 px-6">Amount</th>
                <th class="py-4 px-6 text-right">Created At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="t in transactions" :key="t.id" class="hover:bg-surface-base/20 text-sm">
                <td class="py-4 px-6 font-mono text-xs text-text-main">
                  <div>{{ t.reference }}</div>
                  <div class="text-[9px] text-text-muted font-sans mt-0.5">ID: {{ t.id }}</div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main" v-if="t.user">{{ t.user.name }}</div>
                  <div class="text-xs text-text-sub" v-if="t.user">{{ t.user.email }}</div>
                  <div class="text-xs text-text-muted italic" v-else>ID: {{ t.userId }}</div>
                </td>
                <td class="py-4 px-6">
                  <span
                    :class="{
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': t.type === 'top-up' || t.type === 'refund',
                      'bg-red-500/10 text-red-500 border border-red-500/20': t.type === 'withdrawal' || t.type === 'payment',
                    }"
                    class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  >
                    {{ t.type }}
                  </span>
                </td>
                <td class="py-4 px-6 text-text-sub max-w-xs truncate" :title="t.description">
                  {{ t.description }}
                </td>
                <td class="py-4 px-6 font-black font-display text-sm">
                  <span :class="t.type === 'top-up' || t.type === 'refund' ? 'text-emerald-500' : 'text-red-500'">
                    {{ t.type === 'top-up' || t.type === 'refund' ? '+' : '-' }}
                    {{ formatCurrency(t.amount) }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right text-text-sub text-xs">
                  {{ formatDate(t.createdAt) }}
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

    <!-- Balance Override Modal -->
    <div v-if="showOverrideModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">Balance Adjustment</h3>
          <p class="text-xs text-text-muted mt-1">Directly inject or deduct funds from a user's jarabag escrow wallet.</p>
        </div>

        <div v-if="overrideError" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
          {{ overrideError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Target User ID</label>
            <input
              v-model="targetUserId"
              type="text"
              placeholder="64821c97a8cf92415d..."
              class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Operation</label>
              <select v-model="overrideType" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2.5 text-text-main focus:outline-none text-sm">
                <option value="credit">Credit (+)</option>
                <option value="debit">Debit (-)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Amount (NGN)</label>
              <input
                v-model="overrideAmount"
                type="number"
                placeholder="5000"
                class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Audit Description / Reason</label>
            <textarea
              v-model="overrideDesc"
              rows="3"
              placeholder="e.g. Compensated for missing meal package in dispute #1234"
              class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showOverrideModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="handleWalletOverrideSubmit" :disabled="overrideLoading" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            {{ overrideLoading ? 'Executing...' : 'Post Override' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
