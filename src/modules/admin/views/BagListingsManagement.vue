<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminBags, useUpdateAdminBagStatus } from '../composables/useAdminQuery'

interface BagRecord {
  id: string
  title: string
  description?: string
  category: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  quantityRemaining: number
  status: 'available' | 'reserved' | 'picked-up' | 'expired' | 'scheduled'
  pickupWindowStart?: string
  pickupWindowEnd?: string
  imageUrl?: string
  isPromoted?: boolean
  boostTier?: string
  priceDroppedAt?: string
  isBatchCrowdfunded?: boolean
  minOrdersToCook?: number
  createdAt?: string
  vendor?: {
    id: string
    name: string
    address: string
    verified: boolean
    verificationLevel?: string
  } | null
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'rice-dishes', label: 'Rice Dishes' },
  { value: 'soups-stews', label: 'Soups & Stews' },
  { value: 'swallow', label: 'Swallow' },
  { value: 'grills', label: 'Grills & Suya' },
  { value: 'snacks', label: 'Snacks & Small Chops' },
  { value: 'noodles-pasta', label: 'Noodles & Pasta' },
  { value: 'pastries', label: 'Pastries & Bread' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'salads-wraps', label: 'Salads & Wraps' },
  { value: 'continental', label: 'Continental' },
  { value: 'drinks', label: 'Drinks & Beverages' },
  { value: 'other', label: 'Other' },
]

const page = ref(1)
const pageSize = ref(12)
const filterStatus = ref('')
const filterCategory = ref('')
const searchQuery = ref('')
const debouncedSearch = refDebounced(searchQuery, 300)

const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  status: filterStatus.value || undefined,
  category: filterCategory.value || undefined,
  search: debouncedSearch.value.trim() || undefined,
}))

const { data, isLoading: loading, error } = useAdminBags(() => listParams.value)
const bags = computed<BagRecord[]>(() => data.value?.bags || [])
const total = computed(() => data.value?.total || 0)

const updateBagStatusMutation = useUpdateAdminBagStatus()

watch([filterStatus, filterCategory, debouncedSearch], () => {
  page.value = 1
})

const showModerateModal = ref(false)
const targetBag = ref<BagRecord | null>(null)
const targetStatus = ref<'available' | 'expired'>('expired')
const moderationReason = ref('')
const moderating = ref(false)

const openModerateModal = (bag: BagRecord, nextStatus: 'available' | 'expired') => {
  targetBag.value = bag
  targetStatus.value = nextStatus
  moderationReason.value = ''
  showModerateModal.value = true
}

const confirmModerateBag = async () => {
  if (!targetBag.value) return
  moderating.value = true
  try {
    await updateBagStatusMutation.mutateAsync({
      id: targetBag.value.id,
      status: targetStatus.value,
      reason: moderationReason.value.trim() || undefined,
    })
    showModerateModal.value = false
  } catch (err: any) {
    alert(err?.response?.data?.message || err.message || 'Failed to update deal status.')
  } finally {
    moderating.value = false
  }
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(val || 0)

const formatWindow = (start?: string, end?: string) => {
  if (!start || !end) return 'Flexible'
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  return `${fmt(start)} – ${fmt(end)}`
}

const getDiscountPct = (b: BagRecord) => {
  if (!b.originalPrice || b.originalPrice <= b.discountedPrice) return 0
  return Math.round(((b.originalPrice - b.discountedPrice) / b.originalPrice) * 100)
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Deal Listings Moderation</h2>
          <p class="text-text-sub text-sm mt-1">
            Inspect live, scheduled, and expired JaraBag food deals across all kitchens and moderate inventory.
          </p>
        </div>
        <div class="text-xs font-bold text-text-muted uppercase tracking-wider bg-surface-raised border border-border-subtle px-4 py-2 rounded-xl">
          {{ total }} Listing(s)
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-text-muted uppercase tracking-wide">Status:</label>
            <select
              v-model="filterStatus"
              class="bg-surface-base border border-border-strong rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="available">Available (Live)</option>
              <option value="scheduled">Scheduled</option>
              <option value="reserved">Reserved (Sold Out)</option>
              <option value="picked-up">Picked Up</option>
              <option value="expired">Expired / Removed</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-text-muted uppercase tracking-wide">Category:</label>
            <select
              v-model="filterCategory"
              class="bg-surface-base border border-border-strong rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none"
            >
              <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
        </div>

        <div class="relative w-full lg:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search meal title, kitchen..."
            class="w-full bg-surface-base border border-border-strong rounded-xl pl-9 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-orange-500"
          />
          <span class="absolute left-3 top-2.5 text-text-muted text-xs">🔍</span>
        </div>
      </div>

      <!-- Loading / Error / Empty -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <div
        v-else-if="bags.length === 0"
        class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3"
      >
        <span class="text-5xl">🍲</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Deal Listings Found</h3>
        <p class="text-text-sub text-sm max-w-sm">No food bags match your current status, category, or search filters.</p>
        <button
          v-if="filterStatus || filterCategory || searchQuery"
          @click="filterStatus = ''; filterCategory = ''; searchQuery = ''"
          class="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      <!-- Listings Table -->
      <div v-else class="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-subtle bg-surface-base/30 text-xs font-bold uppercase tracking-wider text-text-muted">
                <th class="py-4 px-6">Deal &amp; Category</th>
                <th class="py-4 px-6">Vendor Kitchen</th>
                <th class="py-4 px-6">Pricing &amp; Stock</th>
                <th class="py-4 px-6">Pickup Window</th>
                <th class="py-4 px-6">Status &amp; Boosts</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="b in bags" :key="b.id" class="hover:bg-surface-base/20 text-sm">
                <td class="py-4 px-6 max-w-xs">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="b.imageUrl"
                      :src="b.imageUrl"
                      :alt="b.title"
                      class="w-11 h-11 rounded-xl object-cover border border-border-strong shrink-0"
                    />
                    <div
                      v-else
                      class="w-11 h-11 rounded-xl bg-surface-base border border-border-strong flex items-center justify-center text-lg shrink-0"
                    >
                      🍱
                    </div>
                    <div class="min-w-0">
                      <div class="font-bold text-text-main truncate">{{ b.title }}</div>
                      <div class="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-0.5">
                        {{ b.category }}
                      </div>
                    </div>
                  </div>
                </td>

                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main">{{ b.vendor?.name || 'Unknown Kitchen' }}</div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span
                      :class="b.vendor?.verified ? 'text-emerald-500' : 'text-amber-500'"
                      class="text-[10px] font-bold uppercase"
                    >
                      {{ b.vendor?.verificationLevel === 'gold' ? '🏆 Gold' : (b.vendor?.verified ? '✓ Verified' : '⏳ Unverified') }}
                    </span>
                    <span v-if="b.vendor?.address" class="text-[11px] text-text-muted truncate max-w-[150px]">
                      • {{ b.vendor.address }}
                    </span>
                  </div>
                </td>

                <td class="py-4 px-6">
                  <div class="flex items-baseline gap-2">
                    <span class="font-extrabold text-orange-500">{{ formatCurrency(b.discountedPrice) }}</span>
                    <span class="text-xs line-through text-text-muted">{{ formatCurrency(b.originalPrice) }}</span>
                    <span v-if="getDiscountPct(b) > 0" class="text-[10px] font-bold text-emerald-500">
                      -{{ getDiscountPct(b) }}%
                    </span>
                  </div>
                  <div class="text-xs text-text-sub mt-0.5">
                    Stock: <strong>{{ b.quantityRemaining }}</strong> / {{ b.quantity }} left
                  </div>
                </td>

                <td class="py-4 px-6 text-xs text-text-sub">
                  {{ formatWindow(b.pickupWindowStart, b.pickupWindowEnd) }}
                </td>

                <td class="py-4 px-6">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      :class="{
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': b.status === 'available',
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20': b.status === 'scheduled',
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20': b.status === 'reserved',
                        'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20': b.status === 'picked-up' || b.status === 'expired',
                      }"
                      class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    >
                      {{ b.status }}
                    </span>
                    <span
                      v-if="b.isPromoted"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20"
                    >
                      🚀 {{ b.boostTier || 'Boosted' }}
                    </span>
                    <span
                      v-if="b.priceDroppedAt"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    >
                      ⚡ Price Drop
                    </span>
                    <span
                      v-if="b.isBatchCrowdfunded"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    >
                      🍲 Batch ({{ b.minOrdersToCook }})
                    </span>
                  </div>
                </td>

                <td class="py-4 px-6 text-right space-x-2">
                  <router-link
                    :to="`/bag/${b.id}`"
                    target="_blank"
                    class="text-xs text-blue-500 hover:text-blue-400 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                  >
                    Preview ↗
                  </router-link>

                  <button
                    v-if="b.status === 'available' || b.status === 'scheduled'"
                    @click="openModerateModal(b, 'expired')"
                    class="text-xs text-red-500 hover:text-red-400 font-bold px-2.5 py-1 rounded border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    Expire
                  </button>
                  <button
                    v-else-if="b.status === 'expired' && b.quantityRemaining > 0"
                    @click="openModerateModal(b, 'available')"
                    class="text-xs text-emerald-500 hover:text-emerald-400 font-bold px-2.5 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    Restore
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 bg-surface-base/30 border-t border-border-subtle flex items-center justify-between">
          <div class="text-xs text-text-muted">
            Showing {{ ((page - 1) * pageSize) + 1 }} to {{ Math.min(page * pageSize, total) }} of {{ total }} listings
          </div>
          <div class="flex gap-2">
            <button
              :disabled="page <= 1"
              @click="page = page - 1"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              :disabled="page * pageSize >= total"
              @click="page = page + 1"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Moderate Listing Modal -->
    <div v-if="showModerateModal && targetBag" class="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-5">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">
            {{ targetStatus === 'expired' ? 'Expire / Remove Listing' : 'Restore Listing to Live Feed' }}
          </h3>
          <p class="text-xs text-text-sub mt-1">
            {{ targetStatus === 'expired' ? 'Remove' : 'Re-activate' }} <strong>"{{ targetBag.title }}"</strong> from <strong>{{ targetBag.vendor?.name || 'Vendor' }}</strong>.
          </p>
        </div>

        <div v-if="targetStatus === 'expired'" class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-text-sub">
            Moderation Reason (sent to vendor via push alert)
          </label>
          <textarea
            v-model="moderationReason"
            rows="3"
            placeholder="e.g. Misleading photo or pricing policy violation..."
            class="w-full bg-surface-base border border-border-strong rounded-xl p-3 text-sm text-text-main focus:outline-none focus:border-orange-500"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="showModerateModal = false"
            class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="confirmModerateBag"
            :disabled="moderating"
            :class="targetStatus === 'expired' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'"
            class="px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
          >
            {{ moderating ? 'Updating...' : (targetStatus === 'expired' ? 'Confirm Expire' : 'Confirm Restore') }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
