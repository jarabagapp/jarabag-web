<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import { useAdminSettings, useUpdateAdminSettings } from '../composables/useAdminQuery'

const { data: settings, isLoading: loading, error: fetchError } = useAdminSettings()
const updateSettingsMutation = useUpdateAdminSettings()

const form = reactive({
  standardCashbackRate: 2.5,
  vipCashbackRate: 5.0,
  maxStandardOrderCashback: 250,
  maxVipOrderCashback: 1000,
})

const maxListingDuration = ref(24)
const description = ref('')
const inconvenienceAmount = ref(200)
const commissionPercentage = ref(5)
const maxCommissionAmount = ref(0)
const noShowFirstConsumerRefundPercentage = ref(50)
const noShowFirstVendorSharePercentage = ref(40)
const noShowFirstPlatformSharePercentage = ref(10)
const noShowRepeatConsumerRefundPercentage = ref(5)
const noShowRepeatVendorSharePercentage = ref(70)
const noShowRepeatPlatformSharePercentage = ref(25)
const lateCancelConsumerRefundPercentage = ref(50)
const lateCancelVendorSharePercentage = ref(40)
const lateCancelPlatformSharePercentage = ref(10)

const notifyUsers = ref(false)
const minVendorListingBalance = ref(2000)

const localError = ref('')
const success = ref('')
const saving = ref(false)

const error = computed(() => {
  if (localError.value) return localError.value
  if (fetchError.value) return (fetchError.value as any).message || 'Failed to fetch settings'
  return ''
})

// Watch settings value to populate local state
watch(settings, (val) => {
  if (val) {
    maxListingDuration.value = val.maxListingDurationHours || val.maxListingDuration || 24
    description.value = val.description || ''
    inconvenienceAmount.value = val.inconvenienceAmount !== undefined ? val.inconvenienceAmount : 200
    commissionPercentage.value = val.commissionPercentage !== undefined ? val.commissionPercentage : 5
    maxCommissionAmount.value = val.maxCommissionAmount !== undefined ? val.maxCommissionAmount : 0
    noShowFirstConsumerRefundPercentage.value = val.noShowFirstConsumerRefundPercentage !== undefined ? val.noShowFirstConsumerRefundPercentage : 50
    noShowFirstVendorSharePercentage.value = val.noShowFirstVendorSharePercentage !== undefined ? val.noShowFirstVendorSharePercentage : 40
    noShowFirstPlatformSharePercentage.value = val.noShowFirstPlatformSharePercentage !== undefined ? val.noShowFirstPlatformSharePercentage : 10
    noShowRepeatConsumerRefundPercentage.value = val.noShowRepeatConsumerRefundPercentage !== undefined ? val.noShowRepeatConsumerRefundPercentage : 5
    noShowRepeatVendorSharePercentage.value = val.noShowRepeatVendorSharePercentage !== undefined ? val.noShowRepeatVendorSharePercentage : 70
    noShowRepeatPlatformSharePercentage.value = val.noShowRepeatPlatformSharePercentage !== undefined ? val.noShowRepeatPlatformSharePercentage : 25
    lateCancelConsumerRefundPercentage.value = val.lateCancelConsumerRefundPercentage !== undefined ? val.lateCancelConsumerRefundPercentage : 50
    lateCancelVendorSharePercentage.value = val.lateCancelVendorSharePercentage !== undefined ? val.lateCancelVendorSharePercentage : 40
    lateCancelPlatformSharePercentage.value = val.lateCancelPlatformSharePercentage !== undefined ? val.lateCancelPlatformSharePercentage : 10
    minVendorListingBalance.value = val.minVendorListingBalance !== undefined ? val.minVendorListingBalance : 2000

    form.standardCashbackRate = val.standardCashbackRate ?? 2.5
    form.vipCashbackRate = val.vipCashbackRate ?? 5.0
    form.maxStandardOrderCashback = val.maxStandardOrderCashback ?? 250
    form.maxVipOrderCashback = val.maxVipOrderCashback ?? 1000
  }
}, { immediate: true })

const handleSaveSettings = async () => {
  localError.value = ''
  success.value = ''

  // Validate Late Cancellation Splits
  const lateCancelSum = Number(lateCancelConsumerRefundPercentage.value) + 
                       Number(lateCancelVendorSharePercentage.value) + 
                       Number(lateCancelPlatformSharePercentage.value)
  if (lateCancelSum !== 100) {
    localError.value = `Late Cancellation Split percentages must sum to exactly 100% (currently ${lateCancelSum}%).`
    return
  }

  // Validate First No-Show Splits
  const noShowFirstSum = Number(noShowFirstConsumerRefundPercentage.value) + 
                        Number(noShowFirstVendorSharePercentage.value) + 
                        Number(noShowFirstPlatformSharePercentage.value)
  if (noShowFirstSum !== 100) {
    localError.value = `First No-Show Split percentages must sum to exactly 100% (currently ${noShowFirstSum}%).`
    return
  }

  // Validate Repeat No-Show Splits
  const noShowRepeatSum = Number(noShowRepeatConsumerRefundPercentage.value) + 
                         Number(noShowRepeatVendorSharePercentage.value) + 
                         Number(noShowRepeatPlatformSharePercentage.value)
  if (noShowRepeatSum !== 100) {
    localError.value = `Repeat No-Show Split percentages must sum to exactly 100% (currently ${noShowRepeatSum}%).`
    return
  }

  saving.value = true
  try {
    await updateSettingsMutation.mutateAsync({
      maxListingDurationHours: maxListingDuration.value,
      description: description.value,
      inconvenienceAmount: Number(inconvenienceAmount.value),
      commissionPercentage: Number(commissionPercentage.value),
      maxCommissionAmount: Number(maxCommissionAmount.value),
      noShowFirstConsumerRefundPercentage: Number(noShowFirstConsumerRefundPercentage.value),
      noShowFirstVendorSharePercentage: Number(noShowFirstVendorSharePercentage.value),
      noShowFirstPlatformSharePercentage: Number(noShowFirstPlatformSharePercentage.value),
      noShowRepeatConsumerRefundPercentage: Number(noShowRepeatConsumerRefundPercentage.value),
      noShowRepeatVendorSharePercentage: Number(noShowRepeatVendorSharePercentage.value),
      noShowRepeatPlatformSharePercentage: Number(noShowRepeatPlatformSharePercentage.value),
      lateCancelConsumerRefundPercentage: Number(lateCancelConsumerRefundPercentage.value),
      lateCancelVendorSharePercentage: Number(lateCancelVendorSharePercentage.value),
      lateCancelPlatformSharePercentage: Number(lateCancelPlatformSharePercentage.value),
      notifyUsers: notifyUsers.value,
      minVendorListingBalance: Number(minVendorListingBalance.value),
      standardCashbackRate: Number(form.standardCashbackRate),
      vipCashbackRate: Number(form.vipCashbackRate),
      maxStandardOrderCashback: Number(form.maxStandardOrderCashback),
      maxVipOrderCashback: Number(form.maxVipOrderCashback),
    })
    success.value = 'Platform settings updated successfully!'
    notifyUsers.value = false
  } catch (err: any) {
    localError.value = err.message || 'Failed to update settings'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Title Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Platform Settings</h2>
          <p class="text-text-sub text-sm mt-1">Manage platform economics, transaction fees, no-show forfeits, and guidelines.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Superadmin Access
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <!-- Form Content -->
      <div v-else class="space-y-6">
        <!-- Error / Success feedback banner -->
        <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm flex items-center gap-3">
          <span>⚠️</span>
          <span class="font-medium">{{ error }}</span>
        </div>
        <div v-if="success" class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-6 py-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <span>✅</span>
          <span>{{ success }}</span>
        </div>

        <form @submit.prevent="handleSaveSettings" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- LEFT SIDE: General & Fees (7 Cols) -->
          <div class="lg:col-span-7 space-y-8">
            
            <!-- Card 1: Platform Revenue & Fees -->
            <div class="bg-surface-raised border border-border-subtle rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 class="text-lg font-black text-text-main font-display flex items-center gap-2">
                  <span>💰</span> Platform Revenue &amp; Escrow Fees
                </h3>
                <p class="text-xs text-text-muted mt-1">Configure Jarabag's primary commission rates and operational caps.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <!-- Commission Percentage -->
                <div class="space-y-2">
                  <label for="commissionPercentage" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Platform Commission (%)
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="commissionPercentage"
                      v-model="commissionPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      class="w-full bg-surface-base border border-border-strong rounded-xl pl-4 pr-12 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                    <span class="absolute right-4 text-sm font-bold text-text-muted">%</span>
                  </div>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    The percentage fee deducted from the total order value when releasing escrow to vendors.
                  </p>
                </div>

                <!-- Max Commission Amount -->
                <div class="space-y-2">
                  <label for="maxCommissionAmount" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Max Commission Cap (₦)
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="maxCommissionAmount"
                      v-model="maxCommissionAmount"
                      type="number"
                      min="0"
                      required
                      class="w-full bg-surface-base border border-border-strong rounded-xl pl-4 pr-12 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                    <span class="absolute right-4 text-sm font-bold text-text-muted">₦</span>
                  </div>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    Deduction limit per order. Set to <strong>0</strong> to enforce standard uncapped percentage.
                  </p>
                </div>

                <!-- Inconvenience amount -->
                <div class="md:col-span-2 space-y-2">
                  <label for="inconvenienceAmount" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Vendor Cancellation Penalty (₦)
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="inconvenienceAmount"
                      v-model="inconvenienceAmount"
                      type="number"
                      min="0"
                      required
                      class="w-full bg-surface-base border border-border-strong rounded-xl pl-4 pr-12 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                    <span class="absolute right-4 text-sm font-bold text-text-muted">₦</span>
                  </div>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    Penalty charged <strong>directly to the vendor's balance</strong> (which can go negative) and paid to the consumer as inconvenience credit if the vendor fails to prepare/deliver the order.
                  </p>
                </div>
              </div>
            </div>

            <!-- Cashback & Loyalty Settings -->
            <div class="bg-surface rounded-2xl border border-border/50 p-6 space-y-4">
              <h3 class="text-lg font-bold text-text-main flex items-center gap-2">
                <span>💰</span> Cashback & Loyalty Rewards
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-text-sub mb-1">Standard Cashback Rate (%)</label>
                  <input v-model.number="form.standardCashbackRate" type="number" step="0.1" min="0" max="50" class="w-full input-field" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-sub mb-1">VIP Cashback Rate (%)</label>
                  <input v-model.number="form.vipCashbackRate" type="number" step="0.1" min="0" max="50" class="w-full input-field" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-sub mb-1">Max Standard Cashback (Coins)</label>
                  <input v-model.number="form.maxStandardOrderCashback" type="number" min="0" class="w-full input-field" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-text-sub mb-1">Max VIP Cashback (Coins)</label>
                  <input v-model.number="form.maxVipOrderCashback" type="number" min="0" class="w-full input-field" />
                </div>
              </div>
            </div>

            <!-- Card 2: General Listing Policy -->
            <div class="bg-surface-raised border border-border-subtle rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 class="text-lg font-black text-text-main font-display flex items-center gap-2">
                  <span>📋</span> Bag Listing Policy
                </h3>
                <p class="text-xs text-text-muted mt-1">Configure systemic constraints for food bags listed by food vendors.</p>
              </div>

              <div class="space-y-5 pt-2">
                <!-- Max listing duration hours -->
                <div class="space-y-2">
                  <label for="maxListingDuration" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Max Listing Visibility Window (Hours)
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="maxListingDuration"
                      v-model="maxListingDuration"
                      type="number"
                      min="1"
                      max="168"
                      required
                      class="w-full max-w-xs bg-surface-base border border-border-strong rounded-xl pl-4 pr-16 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                    <span class="absolute left-64 text-sm font-bold text-text-muted">Hours</span>
                  </div>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    Maximum hours a bag listing stays visible to consumers before getting automatically expired by our scheduler.
                  </p>
                </div>

                <!-- Min Vendor Listing Balance -->
                <div class="space-y-2">
                  <label for="minVendorListingBalance" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Minimum Vendor Wallet Balance (₦)
                  </label>
                  <div class="relative flex items-center">
                    <input
                      id="minVendorListingBalance"
                      v-model="minVendorListingBalance"
                      type="number"
                      min="0"
                      required
                      class="w-full max-w-xs bg-surface-base border border-border-strong rounded-xl pl-4 pr-16 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold"
                    />
                    <span class="absolute left-64 text-sm font-bold text-text-muted">₦</span>
                  </div>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    The minimum wallet balance a food vendor must maintain to list new bags or relist expired bags.
                  </p>
                </div>

                <!-- Description guidelines text -->
                <div class="space-y-2">
                  <label for="description" class="block text-xs font-bold uppercase tracking-wider text-text-sub">
                    Default Vendor Creation Guidelines Description
                  </label>
                  <textarea
                    id="description"
                    v-model="description"
                    rows="4"
                    required
                    placeholder="By listing surplus food, you guarantee that it has been prepared in clean premises..."
                    class="w-full bg-surface-base border border-border-strong rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm leading-relaxed"
                  ></textarea>
                  <p class="text-[10px] text-text-muted leading-relaxed">
                    Instructions/terms visible to food vendors on their dashboard when listing new bags.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT SIDE: Splits & Policies (5 Cols) -->
          <div class="lg:col-span-5 space-y-8">
            
            <!-- Card 3: Forfeit Split Policies -->
            <div class="bg-surface-raised border border-border-subtle rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h3 class="text-lg font-black text-text-main font-display flex items-center gap-2">
                  <span>🛡️</span> Forfeit &amp; Cancellation Splits
                </h3>
                <p class="text-xs text-text-muted mt-1">Specify how reservation deposits are divided. Sum must equal exactly 100%.</p>
              </div>

              <!-- Policies List -->
              <div class="space-y-6 pt-2">
                <!-- Policy 1: Late Cancellation -->
                <div class="bg-surface-base/40 border border-border-strong rounded-xl p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wide text-text-sub">Late Cancel Split</span>
                    <span
                      :class="Number(lateCancelConsumerRefundPercentage) + Number(lateCancelVendorSharePercentage) + Number(lateCancelPlatformSharePercentage) === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded border"
                    >
                      Sum: {{ Number(lateCancelConsumerRefundPercentage) + Number(lateCancelVendorSharePercentage) + Number(lateCancelPlatformSharePercentage) }}%
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Consumer</span>
                      <input v-model="lateCancelConsumerRefundPercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Vendor</span>
                      <input v-model="lateCancelVendorSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Platform</span>
                      <input v-model="lateCancelPlatformSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>

                <!-- Policy 2: First No-Show -->
                <div class="bg-surface-base/40 border border-border-strong rounded-xl p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wide text-text-sub">First No-Show Split</span>
                    <span
                      :class="Number(noShowFirstConsumerRefundPercentage) + Number(noShowFirstVendorSharePercentage) + Number(noShowFirstPlatformSharePercentage) === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded border"
                    >
                      Sum: {{ Number(noShowFirstConsumerRefundPercentage) + Number(noShowFirstVendorSharePercentage) + Number(noShowFirstPlatformSharePercentage) }}%
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Consumer</span>
                      <input v-model="noShowFirstConsumerRefundPercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Vendor</span>
                      <input v-model="noShowFirstVendorSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Platform</span>
                      <input v-model="noShowFirstPlatformSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>

                <!-- Policy 3: Repeat No-Show -->
                <div class="bg-surface-base/40 border border-border-strong rounded-xl p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wide text-text-sub">Subsequent No-Show Split</span>
                    <span
                      :class="Number(noShowRepeatConsumerRefundPercentage) + Number(noShowRepeatVendorSharePercentage) + Number(noShowRepeatPlatformSharePercentage) === 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded border"
                    >
                      Sum: {{ Number(noShowRepeatConsumerRefundPercentage) + Number(noShowRepeatVendorSharePercentage) + Number(noShowRepeatPlatformSharePercentage) }}%
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Consumer</span>
                      <input v-model="noShowRepeatConsumerRefundPercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Vendor</span>
                      <input v-model="noShowRepeatVendorSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                    <div class="space-y-1">
                      <span class="text-[9px] font-bold text-text-muted uppercase block">Platform</span>
                      <input v-model="noShowRepeatPlatformSharePercentage" type="number" min="0" max="100" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-1.5 text-center text-text-main font-semibold text-xs focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button Bar -->
            <div class="space-y-4 pt-4">
              <!-- Notify Users Checkbox -->
              <div class="flex items-start gap-3 bg-surface-base/40 border border-border-strong rounded-xl p-4 transition-colors hover:border-orange-500/30">
                <input
                  id="notifyUsers"
                  v-model="notifyUsers"
                  type="checkbox"
                  class="mt-1 h-4 w-4 border-border-strong rounded text-orange-600 focus:ring-orange-500 bg-surface-base accent-orange-600 cursor-pointer"
                />
                <div class="space-y-1">
                  <label for="notifyUsers" class="block text-xs font-bold uppercase tracking-wider text-text-sub cursor-pointer select-none">
                    Notify all registered users via email
                  </label>
                  <p class="text-[10px] text-text-muted leading-relaxed select-none">
                    When checked, saving these changes will automatically email all registered consumers and vendors to notify them of the updated policies.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                :disabled="saving"
                class="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all text-sm cursor-pointer"
              >
                {{ saving ? 'Saving configurations...' : '💾 Apply Global Settings' }}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>
