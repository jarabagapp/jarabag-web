<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  PhShoppingBag,
  PhStorefront,
  PhMapPin,
  PhClock,
  PhShieldCheck,
  PhDeviceMobile,
  PhDownloadSimple,
  PhSun,
  PhMoon,
  PhWarningCircle,
} from '@phosphor-icons/vue'
import { apiClient } from '@/services/api'

interface BagVendor {
  name?: string
  address?: string
}

interface BagDeal {
  id: string
  title: string
  description?: string
  category?: string
  imageUrl?: string
  originalPrice: number
  discountedPrice: number
  quantity: number
  quantityRemaining?: number
  pickupWindowStart?: string
  pickupWindowEnd?: string
  status?: string
  initialDiscountedPrice?: number
  priceDroppedAt?: string
  isBatchCrowdfunded?: boolean
  minOrdersToCook?: number
  batchConfirmedAt?: string
  vendor?: BagVendor
}

const route = useRoute()
const isDark = ref(false)
const isLoading = ref(true)
const error = ref(false)
const bag = ref<BagDeal | null>(null)
const showDownloadAlert = ref(false)
const downloadStoreName = ref('')

const bagId = computed(() => String(route.params.id || ''))

const discountPercent = computed(() => {
  if (!bag.value) return 0
  const { originalPrice, discountedPrice } = bag.value
  if (originalPrice > discountedPrice && originalPrice > 0) {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
  }
  return 0
})

const remainingCount = computed(() => {
  if (!bag.value) return 0
  return bag.value.quantityRemaining ?? bag.value.quantity ?? 0
})

const vendorName = computed(() => {
  return bag.value?.vendor?.name || 'JaraBag Verified Kitchen'
})

const vendorAddress = computed(() => {
  return bag.value?.vendor?.address || 'Lagos, Nigeria'
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

const formatPickupTime = (isoString?: string) => {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ''
  }
}

const pickupWindowFormatted = computed(() => {
  if (!bag.value) return 'Today • Flexible Pickup'
  const start = formatPickupTime(bag.value.pickupWindowStart)
  const end = formatPickupTime(bag.value.pickupWindowEnd)
  if (start && end) {
    return `${start} – ${end}`
  }
  return 'Today • Flexible Pickup'
})

const hasPriceDropped = computed(() => Boolean(bag.value?.priceDroppedAt))

const flashDropLabel = computed(() => {
  if (!bag.value) return ''
  if (
    bag.value.initialDiscountedPrice &&
    bag.value.initialDiscountedPrice > bag.value.discountedPrice
  ) {
    return `⚡ Final-Hour Drop (was ${formatCurrency(bag.value.initialDiscountedPrice)})`
  }
  return '⚡ Final-Hour Price Drop!'
})

const hasBatchGoal = computed(() =>
  Boolean(bag.value?.isBatchCrowdfunded && (bag.value?.minOrdersToCook ?? 0) > 0)
)

const ordersBooked = computed(() => {
  if (!bag.value) return 0
  const total = bag.value.quantity ?? bag.value.quantityRemaining ?? 0
  const rem = bag.value.quantityRemaining ?? bag.value.quantity ?? 0
  return Math.max(0, total - rem)
})

const minOrdersGoal = computed(() => Math.max(1, bag.value?.minOrdersToCook ?? 1))

const isBatchConfirmed = computed(() =>
  Boolean(bag.value?.batchConfirmedAt) ||
  (hasBatchGoal.value && ordersBooked.value >= minOrdersGoal.value)
)

const batchStatusLabel = computed(() => {
  if (isBatchConfirmed.value) {
    return '🎉 Batch Goal Reached — Cooking Confirmed!'
  }
  return `🍲 Pre-Order Batch: ${ordersBooked.value}/${minOrdersGoal.value} needed to cook (100% refund if unmet)`
})

const toggleMode = () => {
  isDark.value = !isDark.value
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('jarabag_theme', isDark.value ? 'dark' : 'light')
  }
}

let downloadToastTimer: ReturnType<typeof setTimeout> | null = null

const triggerDownload = (store: 'apple' | 'google') => {
  downloadStoreName.value = store === 'apple' ? 'App Store' : 'Google Play'
  showDownloadAlert.value = true
  if (downloadToastTimer) clearTimeout(downloadToastTimer)
  downloadToastTimer = setTimeout(() => {
    showDownloadAlert.value = false
    downloadToastTimer = null
  }, 4000)
}

const downloadPosterPng = () => {
  if (!bag.value || typeof document === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1920)
  grad.addColorStop(0, '#12110F')
  grad.addColorStop(1, '#26201B')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1920)

  // Accent header bar
  ctx.fillStyle = '#E8621A'
  ctx.fillRect(0, 0, 1080, 28)

  // Brand pill
  ctx.fillStyle = '#E8621A'
  ctx.font = 'bold 44px sans-serif'
  ctx.fillText('JARABAG FLASH FOOD DEAL', 80, 150)

  // Discount badge
  if (discountPercent.value > 0) {
    ctx.fillStyle = '#10B981'
    ctx.fillRect(80, 210, 320, 84)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(`-${discountPercent.value}% OFF`, 115, 268)
  }

  // Title
  ctx.fillStyle = '#FAF8F6'
  ctx.font = 'bold 68px sans-serif'
  ctx.fillText(bag.value.title.slice(0, 28), 80, 420)

  // Vendor & Location
  ctx.fillStyle = '#D1CBC7'
  ctx.font = '38px sans-serif'
  ctx.fillText(`${vendorName.value} • ${vendorAddress.value}`, 80, 510)

  // Price Box
  ctx.fillStyle = '#1E1A17'
  ctx.fillRect(80, 600, 920, 320)
  ctx.fillStyle = '#E8621A'
  ctx.font = 'bold 96px sans-serif'
  ctx.fillText(formatCurrency(bag.value.discountedPrice), 130, 760)

  ctx.fillStyle = '#A8A29E'
  ctx.font = '44px sans-serif'
  ctx.fillText(`Instead of ${formatCurrency(bag.value.originalPrice)}`, 130, 845)

  // Quantity & Pickup
  ctx.fillStyle = '#FBBF24'
  ctx.font = 'bold 46px sans-serif'
  ctx.fillText(`Only ${remainingCount.value} bags left!`, 80, 1040)

  ctx.fillStyle = '#FAF8F6'
  ctx.font = '40px sans-serif'
  ctx.fillText(`Pickup Window: ${pickupWindowFormatted.value}`, 80, 1120)

  if (hasPriceDropped.value) {
    ctx.fillStyle = '#10B981'
    ctx.font = 'bold 38px sans-serif'
    ctx.fillText(flashDropLabel.value, 80, 1200)
  }

  if (hasBatchGoal.value) {
    ctx.fillStyle = isBatchConfirmed.value ? '#10B981' : '#FBBF24'
    ctx.font = 'bold 34px sans-serif'
    ctx.fillText(batchStatusLabel.value, 80, 1270)
  }

  // CTA Footer
  ctx.fillStyle = '#E8621A'
  ctx.fillRect(80, 1580, 920, 180)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 46px sans-serif'
  ctx.fillText(`Claim at jarabagapp.com/bag/${bag.value.id}`, 130, 1688)

  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download = `jarabag-deal-${bag.value.id}.png`
  link.href = dataUrl
  link.click()
}

const fetchBagDeal = async () => {
  if (!bagId.value) {
    error.value = true
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = false
  try {
    const res = await apiClient.get('/bags/' + bagId.value)
    const payload = res.data?.data || res.data
    const qtyLeft = payload?.quantityRemaining ?? payload?.quantity ?? 0
    if (
      !payload ||
      !payload.id ||
      payload.status === 'expired' ||
      payload.status === 'cancelled' ||
      payload.status === 'sold_out' ||
      qtyLeft <= 0
    ) {
      bag.value = null
      error.value = true
    } else {
      bag.value = payload
      if (typeof document !== 'undefined') {
        const pct =
          payload.originalPrice > payload.discountedPrice && payload.originalPrice > 0
            ? Math.round(((payload.originalPrice - payload.discountedPrice) / payload.originalPrice) * 100)
            : 0
        document.title = pct > 0
          ? `${payload.title} (-${pct}% OFF) — JaraBag`
          : `${payload.title} — JaraBag`
      }
    }
  } catch {
    bag.value = null
    error.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jarabag_theme')
    isDark.value = saved === 'dark'
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }
  }
  await fetchBagDeal()
})

onUnmounted(() => {
  if (downloadToastTimer) {
    clearTimeout(downloadToastTimer)
    downloadToastTimer = null
  }
})
</script>

<template>
  <div
    :class="isDark ? 'bg-[#090807] text-[#FAF8F6]' : 'bg-[#FAF8F6] text-[#26201B]'"
    class="min-h-screen font-sans selection:bg-[#E8621A] selection:text-white transition-colors duration-500 pb-20"
  >
    <!-- Toast Notification -->
    <transition name="toast-alert">
      <div
        v-if="showDownloadAlert"
        role="status"
        aria-live="polite"
        :class="isDark ? 'bg-[#12110F] border-[#262321] text-[#FAF8F6] shadow-2xl' : 'bg-white border-[#E7E3DF] text-[#1E1A17] shadow-lg'"
        class="fixed bottom-6 right-6 z-[9999] border px-5 py-4 rounded-2xl flex items-center gap-3.5 max-w-sm transition-all"
      >
        <div class="w-10 h-10 bg-[#E8621A]/10 text-[#E8621A] rounded-xl flex items-center justify-center text-xl font-bold" aria-hidden="true">
          <PhDeviceMobile weight="duotone" class="w-5 h-5" />
        </div>
        <div>
          <p class="font-bold text-sm">App coming soon to {{ downloadStoreName }}</p>
          <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-0.5 leading-relaxed">
            We are polishing the experience before our official store launch!
          </p>
        </div>
      </div>
    </transition>

    <!-- Header -->
    <header
      role="banner"
      :class="isDark ? 'border-b border-[#1A1816] bg-[#090807]/90' : 'border-b border-[#E7E3DF] bg-[#FAF8F6]/90'"
      class="backdrop-blur-md sticky top-0 z-40 transition-colors duration-500"
    >
      <div class="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center select-none" aria-label="Jarabag Home">
          <img
            src="/jarabag-full-logo.svg"
            alt="Jarabag Logo"
            width="168"
            height="44"
            class="h-8 md:h-10 w-auto object-contain drop-shadow-sm"
          />
        </router-link>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="toggleMode"
            :class="isDark ? 'border-[#262321] hover:bg-[#1C1A18] text-[#FAF8F6]' : 'border-[#E7E3DF] hover:bg-[#EAE6E1] text-[#26201B]'"
            class="p-2.5 border rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center w-10 h-10"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <PhSun v-if="isDark" weight="duotone" class="w-5 h-5 text-amber-400" aria-hidden="true" />
            <PhMoon v-else weight="duotone" class="w-5 h-5 text-[#26201B]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" role="main" class="max-w-3xl mx-auto px-6 pt-10">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
        class="border rounded-3xl p-10 text-center shadow-lg"
      >
        <div class="w-14 h-14 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <PhShoppingBag weight="duotone" class="w-7 h-7" />
        </div>
        <p class="font-bold text-base">Loading live food deal...</p>
      </div>

      <!-- Error / Unavailable Fallback State -->
      <div
        v-else-if="error || !bag"
        :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
        class="border rounded-3xl p-8 sm:p-10 text-center shadow-xl"
      >
        <div class="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PhWarningCircle weight="duotone" class="w-8 h-8" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold mb-2">
          Deal Unavailable or Sold Out
        </h1>
        <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          This food bag has already been claimed or the pickup window has ended. Download the JaraBag app to get instant alerts when nearby kitchens drop fresh deals!
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            data-testid="download-app-store-btn"
            @click="triggerDownload('apple')"
            :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
            class="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold shadow-lg cursor-pointer"
          >
            <span>Download on App Store</span>
          </button>
          <button
            type="button"
            data-testid="download-google-play-btn"
            @click="triggerDownload('google')"
            :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
            class="flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold shadow-lg cursor-pointer"
          >
            <span>Get it on Google Play</span>
          </button>
        </div>
      </div>

      <!-- Live Deal Card -->
      <div v-else class="space-y-8">
        <article
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-3xl overflow-hidden shadow-2xl transition-colors"
        >
          <!-- Hero Banner / Image Area -->
          <div class="relative h-56 sm:h-64 bg-gradient-to-br from-[#26201B] via-[#1E1A17] to-[#E8621A]/40 flex items-end p-6">
            <img
              v-if="bag.imageUrl"
              :src="bag.imageUrl"
              :alt="bag.title"
              class="absolute inset-0 w-full h-full object-cover opacity-75"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            <!-- Top Badges -->
            <div class="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
              <span
                v-if="discountPercent > 0"
                class="px-3.5 py-1.5 rounded-full bg-[#10B981] text-white text-xs font-extrabold tracking-wide uppercase shadow-md"
              >
                -{{ discountPercent }}% OFF
              </span>
              <span
                class="px-3.5 py-1.5 rounded-full bg-[#E8621A] text-white text-xs font-extrabold tracking-wide shadow-md"
              >
                Only {{ remainingCount }} bags left
              </span>
            </div>

            <!-- Vendor Overlay -->
            <div class="relative z-10 text-white">
              <div class="flex items-center gap-2 text-xs font-bold text-[#FFA666] uppercase tracking-wider mb-1">
                <PhStorefront weight="duotone" class="w-4 h-4" />
                <span>{{ vendorName }}</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-extrabold leading-tight">
                {{ bag.title }}
              </h1>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-6 sm:p-8 space-y-6">
            <!-- Description & Location -->
            <div class="space-y-3">
              <p
                v-if="bag.description"
                :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'"
                class="text-sm sm:text-base leading-relaxed"
              >
                {{ bag.description }}
              </p>

              <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium" :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                <span class="inline-flex items-center gap-1.5">
                  <PhMapPin weight="duotone" class="w-4 h-4 text-[#E8621A]" />
                  {{ vendorAddress }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <PhClock weight="duotone" class="w-4 h-4 text-[#E8621A]" />
                  Pickup: {{ pickupWindowFormatted }}
                </span>
              </div>
            </div>

            <!-- P3 Flash Price Drop & P4 Pre-Order Batch Badges -->
            <div
              v-if="hasPriceDropped || hasBatchGoal"
              class="flex flex-col gap-2.5"
            >
              <div
                v-if="hasPriceDropped"
                data-testid="web-flash-drop-badge"
                class="px-4 py-2.5 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-xs sm:text-sm font-extrabold"
              >
                {{ flashDropLabel }}
              </div>
              <div
                v-if="hasBatchGoal"
                data-testid="web-batch-crowdfund-badge"
                :class="
                  isBatchConfirmed
                    ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                "
                class="px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-extrabold"
              >
                {{ batchStatusLabel }}
              </div>
            </div>

            <!-- Price Callout -->
            <div
              :class="isDark ? 'bg-[#181614] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
              class="p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-[#E8621A]">JaraBag Deal Price</p>
                <div class="flex items-baseline gap-3 mt-1">
                  <span class="text-3xl font-extrabold text-[#E8621A]">
                    {{ formatCurrency(bag.discountedPrice) }}
                  </span>
                  <span
                    v-if="bag.originalPrice > bag.discountedPrice"
                    :class="isDark ? 'text-[#A8A29E]' : 'text-[#544E49]'"
                    class="text-base line-through font-semibold"
                  >
                    {{ formatCurrency(bag.originalPrice) }}
                  </span>
                </div>
              </div>

              <div class="text-right">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] text-xs font-bold">
                  <PhShieldCheck weight="duotone" class="w-4 h-4" />
                  Verified Pickup
                </span>
              </div>
            </div>

            <!-- Verified Pickup Info -->
            <div
              :class="isDark ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#D1FAE5]' : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'"
              class="p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed"
            >
              <PhShieldCheck weight="duotone" class="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              <p>
                <strong>Verified Order &amp; Pickup:</strong> Reserve your meal instantly and present your 4-digit pickup code at the store to verify collection and complete automatic vendor settlement.
              </p>
            </div>

            <!-- Primary & Secondary CTAs -->
            <div class="flex flex-col sm:flex-row gap-3.5 pt-2">
              <a
                :href="'jarabagmobile://bag/' + bag.id"
                data-testid="open-in-app-btn"
                class="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-[#E8621A] hover:bg-[#CF5112] text-white font-extrabold text-sm sm:text-base shadow-lg transition-all text-center"
              >
                <PhDeviceMobile weight="duotone" class="w-5 h-5" />
                <span>Open in JaraBag App to Reserve</span>
              </a>

              <button
                type="button"
                data-testid="download-poster-btn"
                @click="downloadPosterPng"
                :class="isDark ? 'border-[#262321] bg-[#181614] hover:bg-[#221F1D] text-[#FAF8F6]' : 'border-[#E7E3DF] bg-[#FAF8F6] hover:bg-[#EAE6E1] text-[#1E1A17]'"
                class="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <PhDownloadSimple weight="duotone" class="w-5 h-5 text-[#E8621A]" />
                <span>Download Status Poster (PNG)</span>
              </button>
            </div>
          </div>
        </article>

        <!-- App Download Conversion Banner -->
        <section
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-3xl p-6 sm:p-8 text-center shadow-lg"
          aria-label="Download JaraBag Mobile App"
        >
          <h2 class="text-lg sm:text-xl font-extrabold mb-2">
            Don't have the JaraBag app yet?
          </h2>
          <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm max-w-md mx-auto mb-6">
            Download now to claim this deal before it sells out! Reserve discounted food from verified kitchens near you in seconds.
          </p>

          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              data-testid="download-app-store-btn"
              @click="triggerDownload('apple')"
              :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
              class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-md cursor-pointer"
            >
              <div class="text-left leading-tight">
                <p class="text-[9px] opacity-80 font-normal uppercase">Download on the</p>
                <p class="text-xs font-black mt-0.5">App Store</p>
              </div>
            </button>

            <button
              type="button"
              data-testid="download-google-play-btn"
              @click="triggerDownload('google')"
              :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
              class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-md cursor-pointer"
            >
              <div class="text-left leading-tight">
                <p class="text-[9px] opacity-80 font-normal uppercase">Get it on</p>
                <p class="text-xs font-black mt-0.5">Google Play</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
