<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useResolveDispute } from '../composables/useAdminQuery'

const props = defineProps<{
  open: boolean
  order: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'resolved'): void
}>()

const resolveDisputeMutation = useResolveDispute()

const selectedAction = ref<'full_refund' | 'partial_refund' | 'dismiss'>('full_refund')
const applyVendorStrike = ref(true)
const partialRefundAmount = ref<number | undefined>(undefined)
const adminNotes = ref('')
const activeLightboxPhoto = ref<string | null>(null)
const isSubmitting = ref(false)

// Reset form when order changes or drawer opens
watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      selectedAction.value = 'full_refund'
      applyVendorStrike.value = true
      adminNotes.value = ''
      activeLightboxPhoto.value = null
      const cash = newOrder.cashPaid ?? newOrder.amount ?? 0
      partialRefundAmount.value = Math.round(cash / 2)
    }
  },
  { immediate: true }
)

const cashPaid = computed(() => {
  if (!props.order) return 0
  return props.order.cashPaid ?? props.order.amount ?? 0
})

const coinsUsed = computed(() => {
  return props.order?.jaraCoinsUsed ?? 0
})

const evidencePhotos = computed<string[]>(() => {
  if (!props.order) return []
  return props.order.disputeEvidencePhotos || props.order.evidencePhotos || []
})

const partialVendorRemainder = computed(() => {
  const refund = Number(partialRefundAmount.value) || 0
  const remainder = Math.max(0, cashPaid.value - refund)
  return Math.round(remainder * 0.8)
})

const partialPlatformFee = computed(() => {
  const refund = Number(partialRefundAmount.value) || 0
  const remainder = Math.max(0, cashPaid.value - refund)
  return Math.round(remainder * 0.2)
})

const isValid = computed(() => {
  if (!adminNotes.value || adminNotes.value.trim().length < 5) return false
  if (selectedAction.value === 'partial_refund') {
    const amt = Number(partialRefundAmount.value)
    if (isNaN(amt) || amt <= 0 || amt > cashPaid.value) return false
  }
  return true
})

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
    year: 'numeric',
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

const formatRemedy = (remedy?: string) => {
  if (remedy === 'original_payment') return 'Original Payment Method'
  return 'Jara Wallet Credit'
}

const handleClose = () => {
  activeLightboxPhoto.value = null
  emit('close')
}

const handleSubmit = async () => {
  if (!isValid.value || !props.order) return

  isSubmitting.value = true
  try {
    const payload = {
      action: selectedAction.value,
      partialRefundAmount:
        selectedAction.value === 'partial_refund'
          ? Number(partialRefundAmount.value)
          : undefined,
      adminNotes: adminNotes.value.trim(),
      applyVendorStrike:
        selectedAction.value === 'full_refund' ? applyVendorStrike.value : false,
    }

    await resolveDisputeMutation.mutateAsync({
      id: props.order.id,
      payload,
    })

    emit('resolved')
    handleClose()
  } catch (err: any) {
    alert(err?.response?.data?.message || err.message || 'Failed to adjudicate dispute.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="open && order" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      @click="handleClose"
    ></div>

    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
      <div
        class="w-screen max-w-2xl bg-surface-base border-l border-border-subtle shadow-2xl flex flex-col text-text-main overflow-hidden transition-all"
      >
        <!-- Drawer Header -->
        <div class="px-6 py-5 border-b border-border-subtle bg-surface-raised/60 flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-orange-500 uppercase tracking-wider">
                Order Dispute
              </span>
              <span
                :class="{
                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20':
                    (order.disputeStatus || 'pending') === 'pending',
                  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20':
                    order.disputeStatus === 'resolved',
                  'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20':
                    order.disputeStatus === 'dismissed',
                }"
                class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              >
                {{ order.disputeStatus || (order.isDisputed ? 'pending' : 'resolved') }}
              </span>
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-base border border-border-strong text-text-sub"
              >
                Escrow: {{ order.paymentStatus }}
              </span>
            </div>
            <h2 class="text-xl font-black text-text-main font-display mt-1">
              #{{ order.id.toUpperCase() }}
            </h2>
            <p class="text-xs text-text-muted mt-0.5">
              Raised {{ formatDate(order.disputedAt || order.createdAt) }} • Customer: {{ order.user?.name || 'Customer' }}
            </p>
          </div>

          <button
            @click="handleClose"
            class="p-2 rounded-lg text-text-sub hover:text-text-main hover:bg-surface-base border border-border-strong cursor-pointer transition-colors"
            title="Close Drawer"
          >
            ✕
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- Customer Claim Card -->
          <div class="bg-surface-raised border border-border-subtle rounded-xl p-5 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-text-muted uppercase tracking-wider">
                Customer Claim
              </span>
              <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">
                {{ formatCategory(order.disputeCategory) }}
              </span>
            </div>

            <div class="bg-surface-base border border-border-strong rounded-lg p-3.5">
              <div class="text-xs font-semibold text-text-sub mb-1">Customer Statement:</div>
              <p class="text-sm italic text-text-main leading-relaxed">
                "{{ order.disputeReason || 'No customer reason specified.' }}"
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-text-muted block">Preferred Remedy:</span>
                <span class="font-bold text-text-main mt-0.5 block">
                  {{ formatRemedy(order.disputePreferredRemedy) }}
                </span>
              </div>
              <div>
                <span class="text-text-muted block">Contact Phone:</span>
                <span class="font-bold text-text-main mt-0.5 block">
                  {{ order.user?.phone || 'N/A' }}
                </span>
              </div>
            </div>

            <!-- Evidence Photos Grid -->
            <div>
              <span class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Evidence Photos ({{ evidencePhotos.length }})
              </span>
              <div v-if="evidencePhotos.length > 0" class="grid grid-cols-3 gap-3">
                <div
                  v-for="(photo, index) in evidencePhotos"
                  :key="index"
                  data-testid="evidence-photo-thumb"
                  @click="activeLightboxPhoto = photo"
                  class="group relative aspect-square rounded-lg overflow-hidden border border-border-strong bg-black cursor-pointer hover:border-orange-500 transition-all shadow-sm"
                >
                  <img
                    :src="photo"
                    :alt="`Evidence photo ${index + 1}`"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                  >
                    🔍 Inspect
                  </div>
                </div>
              </div>
              <div v-else class="text-xs text-text-muted italic py-2">
                No photographic evidence was uploaded with this claim.
              </div>
            </div>
          </div>

          <!-- Order Ledger & Vendor Reputation Widget -->
          <div class="bg-surface-raised border border-border-subtle rounded-xl p-5 space-y-4">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Order Ledger & Vendor Track Record
            </span>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-base border border-border-strong rounded-lg p-3 text-center">
              <div>
                <div class="text-[10px] text-text-muted uppercase font-bold">Total Paid</div>
                <div class="text-sm font-extrabold text-text-main mt-0.5">{{ formatCurrency(order.amount) }}</div>
              </div>
              <div>
                <div class="text-[10px] text-text-muted uppercase font-bold">Cash Portion</div>
                <div class="text-sm font-extrabold text-orange-500 mt-0.5">{{ formatCurrency(cashPaid) }}</div>
              </div>
              <div>
                <div class="text-[10px] text-text-muted uppercase font-bold">Jara Coins</div>
                <div class="text-sm font-extrabold text-yellow-500 mt-0.5">{{ coinsUsed }} Coins</div>
              </div>
              <div>
                <div class="text-[10px] text-text-muted uppercase font-bold">Quantity</div>
                <div class="text-sm font-extrabold text-text-main mt-0.5">{{ order.quantity ?? 1 }} bag(s)</div>
              </div>
            </div>

            <!-- Vendor Context Details -->
            <div class="border-t border-border-subtle pt-3 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-text-muted">Vendor:</span>
                <span class="font-bold text-text-main">{{ order.vendor?.name || 'Unknown Vendor' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text-muted">Fulfillment Rate:</span>
                <span class="font-extrabold text-emerald-500">
                  {{ order.vendor?.fulfillmentRate ?? 95 }}%
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-text-muted">Past Disputes / Strikes:</span>
                <span class="font-bold text-text-main">
                  {{ order.vendor?.disputeCount ?? 0 }} disputes •
                  <span class="text-red-500">{{ order.vendor?.strikeCount ?? 0 }} strike(s)</span>
                </span>
              </div>
              <div v-if="order.bag?.pickupWindowStart" class="flex items-center justify-between">
                <span class="text-text-muted">Scheduled Window:</span>
                <span class="font-mono text-[11px] text-text-sub">
                  {{ formatDate(order.bag.pickupWindowStart) }} - {{ formatDate(order.bag.pickupWindowEnd) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Adjudication Decision Form -->
          <div class="bg-surface-raised border border-border-subtle rounded-xl p-5 space-y-4">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Arbitration Ruling & Action
            </span>

            <!-- Radio Options -->
            <div class="space-y-3">
              <!-- Full Refund -->
              <label
                @click="selectedAction = 'full_refund'"
                :class="{
                  'border-orange-500 bg-orange-500/5': selectedAction === 'full_refund',
                  'border-border-strong hover:bg-surface-base': selectedAction !== 'full_refund',
                }"
                class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="action"
                  value="full_refund"
                  v-model="selectedAction"
                  data-testid="radio-full_refund"
                  class="mt-1 accent-orange-500"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-text-main">🟢 Full Refund to Customer Wallet</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {{ formatCurrency(cashPaid) }} + {{ coinsUsed }} coins
                    </span>
                  </div>
                  <p class="text-xs text-text-muted mt-1">
                    Refunds 100% of customer payment into their Jara wallet. Escrow hold is not remitted to vendor.
                  </p>
                  <div v-if="selectedAction === 'full_refund'" class="mt-2.5 pt-2 border-t border-border-subtle">
                    <label class="flex items-center gap-2 text-xs font-bold text-red-400 cursor-pointer" @click.stop>
                      <input
                        type="checkbox"
                        v-model="applyVendorStrike"
                        data-testid="apply-strike-checkbox"
                        class="rounded accent-red-500"
                      />
                      <span>Apply Vendor Strike (+1 penalty strike to store profile)</span>
                    </label>
                  </div>
                </div>
              </label>

              <!-- Partial Refund -->
              <label
                @click="selectedAction = 'partial_refund'"
                :class="{
                  'border-yellow-500 bg-yellow-500/5': selectedAction === 'partial_refund',
                  'border-border-strong hover:bg-surface-base': selectedAction !== 'partial_refund',
                }"
                class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="action"
                  value="partial_refund"
                  v-model="selectedAction"
                  data-testid="radio-partial_refund"
                  class="mt-1 accent-yellow-500"
                />
                <div class="flex-1">
                  <div class="font-bold text-sm text-text-main">🟡 Custom Partial Refund</div>
                  <p class="text-xs text-text-muted mt-0.5">
                    Split the disputed escrow cash between the customer and vendor.
                  </p>

                  <div v-if="selectedAction === 'partial_refund'" class="mt-3 space-y-3 pt-2 border-t border-border-subtle">
                    <div>
                      <label class="text-xs font-bold text-text-muted uppercase">Refund Amount (NGN):</label>
                      <div class="relative mt-1">
                        <span class="absolute left-3 top-2 text-text-muted font-bold text-xs">₦</span>
                        <input
                          type="number"
                          v-model="partialRefundAmount"
                          data-testid="partial-refund-amount-input"
                          :max="cashPaid"
                          min="1"
                          placeholder="e.g. 1500"
                          class="w-full bg-surface-base border border-border-strong rounded-lg pl-8 pr-3 py-1.5 text-sm text-text-main focus:outline-none focus:border-yellow-500"
                        />
                      </div>
                      <span class="text-[10px] text-text-muted mt-1 block">
                        Maximum eligible cash refund: {{ formatCurrency(cashPaid) }}
                      </span>
                    </div>

                    <!-- Calculated split -->
                    <div class="bg-surface-base border border-border-strong rounded-lg p-3 text-xs grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div class="text-[10px] text-text-muted">Customer Refund</div>
                        <div class="font-extrabold text-emerald-500 mt-0.5">
                          {{ formatCurrency(Number(partialRefundAmount) || 0) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-[10px] text-text-muted">Vendor Remainder (80%)</div>
                        <div class="font-extrabold text-text-main mt-0.5">
                          {{ formatCurrency(partialVendorRemainder) }}
                        </div>
                      </div>
                      <div>
                        <div class="text-[10px] text-text-muted">Platform Fee (20%)</div>
                        <div class="font-extrabold text-text-sub mt-0.5">
                          {{ formatCurrency(partialPlatformFee) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              <!-- Dismiss Claim -->
              <label
                @click="selectedAction = 'dismiss'"
                :class="{
                  'border-neutral-500 bg-neutral-500/5': selectedAction === 'dismiss',
                  'border-border-strong hover:bg-surface-base': selectedAction !== 'dismiss',
                }"
                class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
              >
                <input
                  type="radio"
                  name="action"
                  value="dismiss"
                  v-model="selectedAction"
                  data-testid="radio-dismiss"
                  class="mt-1 accent-neutral-500"
                />
                <div class="flex-1">
                  <div class="font-bold text-sm text-text-main">🔴 Dismiss Dispute (Release Escrow to Vendor)</div>
                  <p class="text-xs text-text-muted mt-0.5">
                    Reject claim. Escrow payout proceeds directly to vendor without customer refund.
                  </p>
                </div>
              </label>
            </div>

            <!-- Admin Notes -->
            <div class="pt-2">
              <label class="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                Admin Adjudication Notes (Mandatory, min 5 chars)
              </label>
              <textarea
                v-model="adminNotes"
                data-testid="admin-notes-input"
                rows="3"
                placeholder="State the objective findings, evidence review, and justification for this ruling..."
                class="w-full bg-surface-base border border-border-strong rounded-xl p-3 text-sm text-text-main focus:outline-none focus:border-orange-500 transition-all resize-none"
              ></textarea>
              <div class="flex items-center justify-between text-[11px] text-text-muted mt-1">
                <span>Rationale will be recorded in audit log and sent to customer/vendor notifications.</span>
                <span :class="adminNotes.trim().length >= 5 ? 'text-emerald-500' : 'text-text-muted'">
                  {{ adminNotes.trim().length }}/5 min
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="px-6 py-4 border-t border-border-subtle bg-surface-raised flex items-center justify-end gap-3">
          <button
            @click="handleClose"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-text-sub hover:text-text-main hover:bg-surface-base border border-border-strong transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="!isValid || isSubmitting"
            data-testid="execute-resolution-btn"
            class="px-5 py-2 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="animate-spin text-sm">⏳</span>
            <span>Execute Adjudication</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div
      v-if="activeLightboxPhoto"
      data-testid="photo-lightbox"
      @click.self="activeLightboxPhoto = null"
      class="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-pointer"
    >
      <div class="w-full max-w-4xl flex items-center justify-between text-white pb-3">
        <span class="text-sm font-bold">Evidence Inspection View</span>
        <button
          @click="activeLightboxPhoto = null"
          data-testid="close-lightbox-btn"
          class="text-xl font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg cursor-pointer transition-all"
        >
          ✕ Close
        </button>
      </div>
      <div class="max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-white/20 shadow-2xl">
        <img
          :src="activeLightboxPhoto"
          alt="Full Evidence Lightbox"
          class="max-h-[80vh] w-auto object-contain"
        />
      </div>
    </div>
  </div>
</template>
