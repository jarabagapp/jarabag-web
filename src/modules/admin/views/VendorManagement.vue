<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { refDebounced } from '@vueuse/core'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminVendors, useToggleVerifyVendor } from '../composables/useAdminQuery'

interface VendorRecord {
  id: string
  userId: string
  name: string
  type: 'restaurant' | 'buka' | 'bakery'
  description: string
  address: string
  rating: number
  totalRatings: number
  verified: boolean
  openingHours: string
  email?: string
  phone?: string
  isBlocked: boolean
}

const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: debouncedSearchQuery.value.trim() || undefined,
}))

const { data, isLoading: loading, error } = useAdminVendors(() => listParams.value)
const vendors = computed(() => data.value?.vendors || [])
const total = computed(() => data.value?.total || 0)

const toggleVerifyMutation = useToggleVerifyVendor()

watch(debouncedSearchQuery, () => {
  page.value = 1
})

const handlePageChange = (p: number) => {
  page.value = p
}

const showVerifyConfirmModal = ref(false)
const targetVerifyVendor = ref<VendorRecord | null>(null)
const verifyNotifyUser = ref(true)

const handleToggleVerify = (vendor: VendorRecord) => {
  targetVerifyVendor.value = vendor
  verifyNotifyUser.value = true
  showVerifyConfirmModal.value = true
}

const confirmToggleVerify = async () => {
  if (!targetVerifyVendor.value) return
  try {
    const updatedStatus = !targetVerifyVendor.value.verified
    await toggleVerifyMutation.mutateAsync({
      id: targetVerifyVendor.value.id,
      verified: updatedStatus,
      notify: verifyNotifyUser.value,
    })
    showVerifyConfirmModal.value = false
  } catch (err: any) {
    alert(err.message || 'Failed to update vendor verification status.')
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Vendor Profiles</h2>
          <p class="text-text-sub text-sm mt-1">Audit local bukas, bakeries, and restaurants and manage verification badges.</p>
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
            placeholder="Search vendor, category, phone..."
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
      <div v-else-if="vendors.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">🏪</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Vendors Found</h3>
        <p class="text-text-sub text-sm max-w-sm">No registered vendors match your search keywords. Clear filters or add new vendors via the mobile app.</p>
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
                <th class="py-4 px-6">Store Detail</th>
                <th class="py-4 px-6">Contact Info</th>
                <th class="py-4 px-6">Store Category</th>
                <th class="py-4 px-6">Ratings</th>
                <th class="py-4 px-6">Verification</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="v in vendors" :key="v.id" class="hover:bg-surface-base/20 text-sm">
                <td class="py-4 px-6 max-w-xs">
                  <div class="font-semibold text-text-main truncate">{{ v.name }}</div>
                  <div class="text-text-sub text-xs mt-1 truncate">{{ v.address }}</div>
                  <div class="text-[10px] text-text-muted italic mt-0.5 line-clamp-1">Hours: {{ v.openingHours }}</div>
                </td>
                <td class="py-4 px-6 text-text-sub">
                  <div>{{ v.email || '—' }}</div>
                  <div class="text-text-muted text-xs mt-0.5">{{ v.phone }}</div>
                </td>
                <td class="py-4 px-6">
                  <span class="bg-surface-base border border-border-strong text-[10px] font-bold uppercase px-2 py-0.5 rounded text-text-sub">
                    {{ v.type }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-1.5 font-bold text-orange-500 text-sm">
                    ⭐ {{ v.rating.toFixed(1) }}
                    <span class="text-xs text-text-muted font-normal">({{ v.totalRatings }} reviews)</span>
                  </div>
                </td>
                <td class="py-4 px-6">
                  <span
                    :class="v.verified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'"
                    class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  >
                    {{ v.verified ? 'Verified ✓' : 'Pending Verification' }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right">
                  <button
                    @click="handleToggleVerify(v)"
                    :class="v.verified ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10' : 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10'"
                    class="text-xs font-bold px-3 py-1.5 rounded-lg border border-transparent transition-colors cursor-pointer"
                  >
                    {{ v.verified ? 'Revoke Status' : 'Approve Verify' }}
                  </button>
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

    <!-- Vendor Verification Confirmation Modal -->
    <div v-if="showVerifyConfirmModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">
            {{ targetVerifyVendor?.verified ? 'Revoke Verification' : 'Verify Vendor' }}
          </h3>
          <p class="text-xs text-text-muted mt-1">
            Are you sure you want to {{ targetVerifyVendor?.verified ? 'revoke verification for' : 'approve and verify' }} <strong>{{ targetVerifyVendor?.name }}</strong>?
          </p>
        </div>

        <div class="space-y-4">
          <label class="flex items-center p-3 bg-surface-base border border-border-strong rounded-lg cursor-pointer">
            <input
              v-model="verifyNotifyUser"
              type="checkbox"
              class="accent-orange-600 rounded"
            />
            <span class="ml-3 text-xs font-semibold text-text-main">Notify vendor via email</span>
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showVerifyConfirmModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="confirmToggleVerify" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
