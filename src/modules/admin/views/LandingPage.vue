<script setup lang="ts">
import type { Component } from 'vue'
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  PhShoppingBag,
  PhBroadcast,
  PhStorefront,
  PhMapPin,
  PhLightning,
  PhShieldCheck,
  PhLockKey,
  PhQrCode,
  PhCheckCircle,
  PhSparkle,
  PhWallet,
  PhCoins,
  PhBank,
  PhLeaf,
  PhUsersThree,
  PhGlobe,
  PhCookingPot,
  PhBread,
  PhClock,
  PhDeviceMobile,
  PhConfetti,
  PhMagnifyingGlass,
  PhPackage,
  PhSun,
  PhMoon,
  PhGraduationCap,
  PhTimer
} from '@phosphor-icons/vue'

gsap.registerPlugin(ScrollTrigger)

const isDark = ref(false)
const showDownloadAlert = ref(false)
const downloadStoreName = ref('')
let statsObserver: IntersectionObserver | null = null
const handleRefresh = () => {
  ScrollTrigger.refresh()
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val)
}

const toggleMode = (event?: MouseEvent) => {
  const overlay = document.querySelector('.theme-wipe-overlay') as HTMLElement | null
  const x = event ? event.clientX : window.innerWidth / 2
  const y = event ? event.clientY : window.innerHeight / 2

  if (!overlay || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isDark.value = !isDark.value
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    if (typeof window !== 'undefined') {
      localStorage.setItem('jarabag_theme', isDark.value ? 'dark' : 'light')
    }
    return
  }

  const nextIsDark = !isDark.value
  overlay.style.backgroundColor = nextIsDark ? '#090807' : '#FAF8F6'
  overlay.style.display = 'block'
  overlay.style.zIndex = '9999'

  gsap.fromTo(overlay,
    { clipPath: `circle(0px at ${x}px ${y}px)` },
    {
      clipPath: `circle(150% at ${x}px ${y}px)`,
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => {
        isDark.value = nextIsDark
        document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
        if (typeof window !== 'undefined') {
          localStorage.setItem('jarabag_theme', isDark.value ? 'dark' : 'light')
        }
        gsap.set(overlay, { display: 'none', clipPath: `circle(0px at 0px 0px)` })
      }
    }
  )
}

const triggerDownload = (store: string) => {
  downloadStoreName.value = store === 'apple' ? 'App Store' : 'Google Play'
  showDownloadAlert.value = true
  setTimeout(() => {
    showDownloadAlert.value = false
  }, 4000)
}

const scrollToSection = (targetId: string, event?: Event) => {
  if (event) event.preventDefault()
  const targetEl = document.getElementById(targetId)
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Interactive Simulator State
const activeStep = ref(1) // 1: Discover, 2: Reserve, 3: Claim, 4: Success
const walletBalance = ref(4500)
const merchantEarnings = ref(12000)
const otpDigits = ['4', '8', '2', '1']

// Confetti burst for final step
const spawnConfetti = () => {
  const container = document.querySelector('.confetti-container')
  if (!container) return

  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div')
    el.className = 'absolute w-2.5 h-2.5 rounded-sm pointer-events-none z-50'
    const colors = ['#E8621A', '#10B981', '#3B82F6', '#FBBF24', '#EC4899']
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || '#E8621A'

    const startX = 150 // center of 300px phone mockup
    const startY = 160

    container.appendChild(el)

    const angle = Math.random() * Math.PI * 2
    const distance = 40 + Math.random() * 100
    const endX = startX + Math.cos(angle) * distance
    const endY = startY + Math.sin(angle) * distance + (40 + Math.random() * 70)

    gsap.set(el, { x: startX, y: startY, scale: Math.random() * 0.8 + 0.4, rotation: Math.random() * 360 })

    gsap.to(el, {
      x: endX,
      y: endY,
      rotation: Math.random() * 720,
      opacity: 0,
      duration: 1.4 + Math.random() * 1.2,
      ease: 'power2.out',
      onComplete: () => el.remove()
    })
  }
}

const scrollTimelineToNode = (stepNumber: number) => {
  const container = document.querySelector('.lifecycle-timeline')
  if (!container) return

  const nodes = document.querySelectorAll('.lifecycle-step-node')
  const targetNode = nodes[stepNumber - 1] as HTMLElement | undefined
  if (!targetNode) return

  const containerWidth = container.clientWidth
  const nodeOffsetLeft = targetNode.offsetLeft
  const nodeWidth = targetNode.clientWidth

  const targetScrollLeft = nodeOffsetLeft - (containerWidth / 2) + (nodeWidth / 2)

  gsap.to(container, {
    scrollLeft: targetScrollLeft,
    duration: 0.5,
    ease: 'power2.out'
  })
}

// Interactive transitions
const runStepTransition = (targetStep: number) => {
  scrollTimelineToNode(targetStep)

  gsap.to('.sim-screen', {
    opacity: 0,
    scale: 0.97,
    duration: 0.15,
    onComplete: () => {
      activeStep.value = targetStep

      gsap.to('.sim-screen', {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out',
      })

      nextTick(() => {
        if (targetStep === 2) {
          gsap.to(walletBalance, {
            duration: 0.8,
            value: 3000,
            roundProps: 'value',
            ease: 'power2.out',
          })

          gsap.fromTo('.lock-graphic',
            { scale: 0.6, rotation: -90, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
          )
        }

        if (targetStep === 3) {
          otpDigits.forEach((digit, idx) => {
            const col = document.getElementById(`otp-col-${idx}`)
            if (col) {
              const targetY = -parseInt(digit) * 48
              gsap.fromTo(col,
                { y: 0 },
                {
                  y: targetY,
                  duration: 1.0 + idx * 0.1,
                  ease: 'power3.out',
                }
              )
            }
          })
        }

        if (targetStep === 4) {
          spawnConfetti()
          gsap.to(merchantEarnings, {
            duration: 1.0,
            value: 13425,
            roundProps: 'value',
            ease: 'power3.out',
          })
          gsap.fromTo('.success-check',
            { scale: 0, rotate: -45 },
            { scale: 1, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }
          )
        }
      })
    },
  })
}

const handleResetSimulator = () => {
  walletBalance.value = 4500
  merchantEarnings.value = 12000
  runStepTransition(1)
}

// Vendor Fast Broadcast Showcase State
interface BroadcastPreset {
  id: string
  name: string
  iconComponent: Component
  storeName: string
  location: string
  itemTitle: string
  originalPrice: number
  discountPrice: number
  discountPercent: number
  quantity: number
  soldMinutes: number
  radiusKm: number
  audienceCount: number
  notificationTitle: string
  notificationBody: string
  badgeText: string
}

const broadcastPresets: BroadcastPreset[] = [
  {
    id: 'home-cook',
    name: 'Home Cook Special',
    iconComponent: PhCookingPot,
    storeName: "Mama Ada's Kitchen",
    location: 'Yaba / Sabo, Lagos',
    itemTitle: 'Homemade Jollof Rice & Fried Plantain',
    originalPrice: 5000,
    discountPrice: 3500,
    discountPercent: 30,
    quantity: 12,
    soldMinutes: 8,
    radiusKm: 2.0,
    audienceCount: 280,
    notificationTitle: "Mama Ada's Kitchen — Fresh Jollof!",
    notificationBody: '12 plates of homemade Jollof & Fried Plantain at 30% off. Ready for pickup in Sabo!',
    badgeText: 'Home Cook'
  },
  {
    id: 'student-chef',
    name: 'Campus Quick Bite',
    iconComponent: PhBread,
    storeName: 'Chef Tunde (Student)',
    location: 'UNILAG Campus, Lagos',
    itemTitle: 'Indomie & Egg Combo Packs',
    originalPrice: 3000,
    discountPrice: 1800,
    discountPercent: 40,
    quantity: 20,
    soldMinutes: 6,
    radiusKm: 1.5,
    audienceCount: 340,
    notificationTitle: 'Campus Deal: Chef Tunde',
    notificationBody: '20 Indomie & Egg combo packs at 40% off on UNILAG campus. Grab one before class!',
    badgeText: 'Student Chef'
  },
  {
    id: 'restaurant-flash',
    name: 'Restaurant Flash Deal',
    iconComponent: PhStorefront,
    storeName: 'Buka Prime Kitchen',
    location: 'Victoria Island, Lagos',
    itemTitle: 'Smoky Jollof + Grilled Asun Mega Box',
    originalPrice: 12000,
    discountPrice: 6960,
    discountPercent: 42,
    quantity: 25,
    soldMinutes: 14,
    radiusKm: 3.5,
    audienceCount: 520,
    notificationTitle: 'Flash Deal: Buka Prime Kitchen',
    notificationBody: '25 mega boxes of Smoky Jollof & Grilled Asun at 42% off in VI. Grab yours!',
    badgeText: 'Flash Deal'
  }
]

const activePresetIndex = ref(0)
const isBroadcasting = ref(false)
const broadcastStockLeft = ref(broadcastPresets[0]?.quantity ?? 12)
const isBroadcastSoldOut = ref(false)
let broadcastTimer: ReturnType<typeof setInterval> | null = null

const activePreset = computed<BroadcastPreset>(() => {
  return broadcastPresets[activePresetIndex.value] ?? broadcastPresets[0]!
})

const selectBroadcastPreset = (idx: number) => {
  if (broadcastTimer) {
    clearInterval(broadcastTimer)
    broadcastTimer = null
  }
  activePresetIndex.value = idx
  isBroadcasting.value = false
  isBroadcastSoldOut.value = false
  const target = broadcastPresets[idx]
  if (target) {
    broadcastStockLeft.value = target.quantity
  }
}

const triggerBroadcastDemo = () => {
  if (broadcastTimer) {
    clearInterval(broadcastTimer)
    broadcastTimer = null
  }
  const preset = broadcastPresets[activePresetIndex.value] ?? broadcastPresets[0]
  if (!preset) return
  broadcastStockLeft.value = preset.quantity
  isBroadcastSoldOut.value = false
  isBroadcasting.value = true

  const totalSteps = preset.quantity
  let currentStock = preset.quantity
  const intervalMs = Math.max(70, Math.floor(1800 / totalSteps))

  broadcastTimer = setInterval(() => {
    currentStock -= 1
    if (currentStock <= 0) {
      broadcastStockLeft.value = 0
      isBroadcastSoldOut.value = true
      isBroadcasting.value = false
      if (broadcastTimer) {
        clearInterval(broadcastTimer)
        broadcastTimer = null
      }
    } else {
      broadcastStockLeft.value = currentStock
    }
  }, intervalMs)
}

// Background Floating Parallax Config
interface FloatingElement {
  id: number
  x: string
  y: string
  size: number
  rotation: number
  delay: number
  speed: number
  component?: Component
  label?: string
  type: 'icon' | 'coin'
}

const floatingElements = ref<FloatingElement[]>([
  { id: 1, x: '8%', y: '18%', size: 44, rotation: 12, delay: 0, speed: 5, component: PhCookingPot, type: 'icon' },
  { id: 2, x: '88%', y: '14%', size: 52, rotation: -18, delay: 0.8, speed: 6, component: PhBread, type: 'icon' },
  { id: 3, x: '82%', y: '78%', size: 38, rotation: 15, delay: 0.4, speed: 4.5, label: '₦', type: 'coin' },
  { id: 4, x: '10%', y: '82%', size: 48, rotation: -10, delay: 1.2, speed: 5.5, component: PhLeaf, type: 'icon' },
  { id: 5, x: '78%', y: '48%', size: 32, rotation: 22, delay: 1.6, speed: 4, component: PhSparkle, type: 'icon' },
])

let ticking = false
const handleMouseMove = (event: MouseEvent) => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = (event.clientX - cx) / cx
      const dy = (event.clientY - cy) / cy

      floatingElements.value.forEach((el) => {
        const factor = (el.size / 44) * 20
        gsap.to(`#float-el-${el.id}`, {
          x: dx * factor,
          y: dy * factor,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      })
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jarabag_theme')
    if (saved === 'dark') {
      isDark.value = true
    } else {
      isDark.value = false
    }
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true })

  // Animate Hero Text
  if (document.querySelector('.hero-word')) {
    gsap.from('.hero-word', {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out'
    })
  }

  if (document.querySelector('.hero-fade-in')) {
    gsap.from('.hero-fade-in', {
      opacity: 0,
      y: 18,
      duration: 0.8,
      delay: 0.3,
      stagger: 0.15,
      ease: 'power3.out'
    })
  }

  // Float elements
  floatingElements.value.forEach((el) => {
    if (document.querySelector(`#float-el-${el.id}`)) {
      gsap.to(`#float-el-${el.id}`, {
        y: '+=20',
        rotation: '+=15',
        duration: el.speed,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: el.delay
      })
    }
  })

  // Count-up Stats
  const statItems = [
    { target: '#stat-meals', value: 15420, suffix: '+', formatted: '15,420+' },
    { target: '#stat-savings', value: 24500000, prefix: '₦', suffix: '', formatted: '₦24,500,000' },
    { target: '#stat-sellers', value: 150, suffix: '+', formatted: '150+' },
    { target: '#stat-speed', value: 12, prefix: '~', suffix: ' Mins', formatted: '~12 Mins' }
  ]

  const animateStats = () => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      statItems.forEach((item) => {
        const el = document.querySelector(item.target)
        if (el) el.textContent = item.formatted
      })
      return
    }

    statItems.forEach((item) => {
      const el = document.querySelector(item.target)
      if (el) {
        const valContainer = { val: 0 }
        gsap.to(valContainer, {
          val: item.value,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            let output = Math.round(valContainer.val).toLocaleString()
            if (item.prefix) output = item.prefix + output
            if (item.suffix) output = output + item.suffix
            el.textContent = output
          },
          onComplete: () => {
            el.textContent = item.formatted
          }
        })
      }
    })
  }

  const statsSection = document.querySelector('#impact-stats')
  if (statsSection) {
    if ('IntersectionObserver' in window) {
      statsObserver = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          animateStats()
          statsObserver?.disconnect()
          statsObserver = null
        }
      }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' })
      statsObserver.observe(statsSection)
    } else {
      animateStats()
    }
  }

  window.addEventListener('load', handleRefresh)

  nextTick(() => {
    setTimeout(handleRefresh, 200)
  })
})

onUnmounted(() => {
  if (broadcastTimer) {
    clearInterval(broadcastTimer)
    broadcastTimer = null
  }
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('load', handleRefresh)
  if (statsObserver) {
    statsObserver.disconnect()
    statsObserver = null
  }
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<template>
  <div
    :class="isDark ? 'bg-[#090807] text-[#FAF8F6]' : 'bg-[#FAF8F6] text-[#26201B]'"
    class="min-h-screen font-sans selection:bg-[#E8621A] selection:text-white transition-colors duration-500 overflow-x-hidden relative"
  >
    <!-- Skip Link for Keyboard Accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#E8621A] focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>

    <!-- Background Technical Grid -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden select-none z-0" aria-hidden="true">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="technical-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" :stroke="isDark ? '#302B27' : '#E2DAD0'" stroke-width="1.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#technical-grid)" />
      </svg>
    </div>

    <!-- Parallax Decorative Elements in Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-10" aria-hidden="true">
      <div
        v-for="el in floatingElements"
        :key="el.id"
        :id="`float-el-${el.id}`"
        :style="{ left: el.x, top: el.y, width: el.size + 'px', height: el.size + 'px' }"
        :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-white border-[#E7E3DF] text-[#1E1A17] shadow-md'"
        class="absolute border rounded-xl flex items-center justify-center font-bold text-lg pointer-events-none select-none transition-all duration-300"
      >
        <component
          :is="el.component"
          v-if="el.type === 'icon'"
          weight="duotone"
          class="w-6 h-6 text-[#E8621A]"
          aria-hidden="true"
        />
        <span v-else class="text-[#E8621A] font-extrabold text-base">{{ el.label }}</span>
      </div>
    </div>

    <!-- Theme Wipe Overlay -->
    <div class="theme-wipe-overlay fixed inset-0 pointer-events-none z-50 hidden" style="clip-path: circle(0px at 0px 0px);" aria-hidden="true"></div>

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

    <!-- Header Landmark -->
    <header
      role="banner"
      :class="isDark ? 'border-b border-[#1A1816] bg-[#090807]/90' : 'border-b border-[#E7E3DF] bg-[#FAF8F6]/90'"
      class="backdrop-blur-md sticky top-0 z-40 transition-colors duration-500"
    >
      <div class="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center select-none" aria-label="Jarabag Home">
          <img
            src="/jarabag-full-logo.svg"
            alt="Jarabag Logo"
            width="168"
            height="44"
            class="h-8 md:h-11 w-auto object-contain drop-shadow-sm"
          />
        </router-link>

        <div class="flex items-center gap-4">
          <button
            type="button"
            @click="toggleMode"
            :class="isDark ? 'border-[#262321] hover:bg-[#1C1A18] text-[#FAF8F6]' : 'border-[#E7E3DF] hover:bg-[#EAE6E1] text-[#26201B]'"
            class="p-2.5 border rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px]"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDark"
          >
            <PhSun v-if="isDark" weight="duotone" class="w-5 h-5 text-amber-400" aria-hidden="true" />
            <PhMoon v-else weight="duotone" class="w-5 h-5 text-[#26201B]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Landmark -->
    <main id="main-content" role="main">
      <!-- Hero Section -->
      <section class="relative pt-16 pb-24 md:pt-28 md:pb-36 max-w-5xl mx-auto px-6 z-20" aria-labelledby="hero-title">
        <div class="grid md:grid-cols-12 gap-12 items-center">
          <!-- Hero Text -->
          <div class="md:col-span-7 flex flex-col items-start text-left">
            <div
              :class="isDark ? 'bg-[#E8621A]/15 border-[#E8621A]/30 text-[#FFA666]' : 'bg-[#FFF7ED] border-[#FDBA74] text-[#9A3412]'"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-bold tracking-widest uppercase mb-6 hero-fade-in"
            >
              <PhLightning weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
              <span>Cheap Eats, Fast Sales</span>
            </div>

            <h1 id="hero-title" class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 overflow-hidden">
              <span class="inline-block hero-word mr-3">Sell</span>
              <span class="inline-block hero-word mr-3">out</span>
              <span class="inline-block hero-word mr-3 text-[#E8621A]">cheap</span>
              <span class="inline-block hero-word text-[#E8621A]">food</span>
              <br />
              <span class="inline-block hero-word mr-3">near</span>
              <span class="inline-block hero-word mr-3">you</span>
              <span class="inline-block hero-word text-[#E8621A]">fast.</span>
            </h1>

            <p
              :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'"
              class="text-base sm:text-lg leading-relaxed mb-8 max-w-lg hero-fade-in transition-colors"
            >
              Discover discounted meals from local sellers — or list your own and sell out in minutes. No ads needed.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto hero-fade-in">
              <button
                type="button"
                @click="triggerDownload('apple')"
                aria-label="Download Jarabag on Apple App Store"
                :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
                class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer min-h-[48px]"
              >
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                </svg>
                <div class="text-left leading-tight">
                  <p class="text-[9px] opacity-80 font-normal tracking-wide uppercase">Download on the</p>
                  <p class="text-xs font-black mt-0.5">App Store</p>
                </div>
              </button>

              <button
                type="button"
                @click="triggerDownload('google')"
                aria-label="Get Jarabag on Google Play Store"
                :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
                class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer min-h-[48px]"
              >
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5,3.14L15.31,13.43L5,23.71C4.42,23.14 4.09,22.28 4.09,21.14V5.71C4.09,4.57 4.42,3.71 5,3.14M20.25,12.56L16.73,14.56L16.03,13.86L20.25,12.56M17.44,11.89L21.43,9.89C22.18,9.5 22.18,8.5 21.43,8.11L17.44,6.11C16.89,5.83 16.27,6.17 16.27,6.78V11.22C16.27,11.83 16.89,12.17 17.44,11.89M5.71,2.43L15.31,12L5.71,21.57C6.28,22.14 7.14,22.47 8.29,22.47C9.14,22.47 10.09,22.09 11.23,21.43L19.29,16.86L15.31,12L11.23,7.14L19.29,2.57L11.23,2C10.09,1.33 9.14,1 8.29,1C7.14,1 6.28,1.33 5.71,1.9M8.29,1.9H8.3C8.42,1.9 8.54,1.93 8.66,2L14.6,5.34L7.66,12.28L6.43,11.05C6.07,10.69 5.86,10.14 5.86,9.57C5.86,9 6.07,8.45 6.43,8.09L8.29,1.9Z" />
                </svg>
                <div class="text-left leading-tight">
                  <p class="text-[9px] opacity-80 font-normal tracking-wide uppercase">Get it on</p>
                  <p class="text-xs font-black mt-0.5">Google Play</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Interactive Simulator Trigger Badge -->
          <div class="md:col-span-5 flex justify-center hero-fade-in">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-7 border rounded-3xl flex flex-col justify-center items-center text-center shadow-2xl w-full max-w-sm hover:scale-[1.02] transition-transform duration-300"
            >
              <div class="w-16 h-16 bg-[#E8621A]/10 rounded-2xl flex items-center justify-center select-none" aria-hidden="true">
                <PhSparkle weight="duotone" class="w-8 h-8 text-[#E8621A]" />
              </div>
              <h2 class="text-base font-extrabold mt-4">See How It Works</h2>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-2.5 leading-relaxed px-2">
                Pre-order discounted meals in seconds and verify collection with your 4-digit pickup code. Try it below!
              </p>
              <a
                href="#simulator"
                @click="scrollToSection('simulator', $event)"
                class="mt-6 px-6 py-3 bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-block select-none cursor-pointer"
              >
                Try It Out
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Who Sells on Jarabag? Section -->
      <section
        id="who-sells"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]' : 'border-t border-[#E7E3DF] bg-white'"
        class="py-20 relative z-20"
        aria-labelledby="who-sells-heading"
      >
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center max-w-lg mx-auto mb-12">
            <h2 id="who-sells-heading" class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-3">Who sells on Jarabag?</h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">Anyone with food to sell — at any scale.</p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#E8621A]/40'"
              class="p-5 sm:p-6 border rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <div class="w-12 h-12 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <PhCookingPot weight="duotone" class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-sm mb-1">Home Cooks</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs leading-relaxed">Sell homemade meals to your neighborhood</p>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#3B82F6]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#3B82F6]/40'"
              class="p-5 sm:p-6 border rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <div class="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-2xl flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <PhGraduationCap weight="duotone" class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-sm mb-1">Student Chefs</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs leading-relaxed">Make money cooking for your campus</p>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#10B981]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#10B981]/40'"
              class="p-5 sm:p-6 border rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <div class="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <PhStorefront weight="duotone" class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-sm mb-1">Restaurants & Bukas</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs leading-relaxed">Clear trays fast during slow hours</p>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#F59E0B]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#F59E0B]/40'"
              class="p-5 sm:p-6 border rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 shadow-sm"
            >
              <div class="w-12 h-12 bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <PhBread weight="duotone" class="w-6 h-6" />
              </div>
              <h3 class="font-extrabold text-sm mb-1">Bakeries & Big Kitchens</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs leading-relaxed">Move fresh batches before they go stale</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive Simulator Section -->
      <section
        id="simulator"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/90 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/90 backdrop-blur-sm'"
        class="py-24 relative z-20"
        aria-labelledby="simulator-heading"
      >
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center max-w-lg mx-auto mb-20">
            <h2 id="simulator-heading" class="text-3xl font-extrabold tracking-tight font-display mb-3 text-[#E8621A]">
              Fast, verified pickup
            </h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">
              Reserve your meal ahead and verify collection with your 4-digit pickup code. Simple.
            </p>
          </div>

          <div class="grid lg:grid-cols-12 gap-12 items-center">
            <!-- Smartphone Mockup -->
            <div class="lg:col-span-6 flex justify-center relative">
              <div class="confetti-container absolute inset-0 pointer-events-none z-50 overflow-hidden max-w-[304px] h-[584px] mx-auto rounded-[40px]" aria-hidden="true"></div>

              <div
                :class="isDark ? 'border-[#262321] bg-[#090807] shadow-orange-950/10' : 'border-[#E7E3DF] bg-[#FAF8F6] shadow-neutral-200'"
                class="relative w-[304px] h-[584px] border-4 rounded-[40px] shadow-2xl overflow-hidden transition-colors duration-500"
              >
                <!-- Notch -->
                <div :class="isDark ? 'bg-[#1C1A18]' : 'bg-[#EAE6E1]'" class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 rounded-b-xl z-40" aria-hidden="true"></div>

                <!-- Screen -->
                <div
                  :class="isDark ? 'bg-[#0E0D0C] text-[#FAF8F6]' : 'bg-white text-[#1E1A17]'"
                  class="sim-screen p-5 pt-8 h-full flex flex-col justify-between transition-colors relative"
                >
                  <!-- Reservation notification banner -->
                  <div v-if="activeStep === 2" class="push-notif absolute top-9 left-4 right-4 bg-[#E8621A] p-3 rounded-2xl shadow-xl z-30 flex items-center gap-3">
                    <PhSparkle weight="duotone" class="w-5 h-5 text-white shrink-0" aria-hidden="true" />
                    <div class="text-left text-white leading-tight">
                      <p class="text-[9px] font-bold uppercase tracking-wider opacity-90">Instant Reservation</p>
                      <p class="text-[11px] font-extrabold mt-0.5">Order Reservation Confirmed!</p>
                    </div>
                  </div>

                  <!-- SCREEN 1: BROWSE MAP -->
                  <div v-if="activeStep === 1" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Food Map</span>
                        <span class="text-[11px] font-mono font-bold text-[#E8621A]">{{ formatCurrency(walletBalance) }}</span>
                      </div>

                      <div
                        :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-[#FAF8F6]/80 border-[#E7E3DF]'"
                        class="h-60 rounded-2xl border relative overflow-hidden flex items-center justify-center select-none"
                      >
                        <div class="absolute inset-0 opacity-15" aria-hidden="true">
                          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" stroke-width="2" />
                            <line x1="80" y1="0" x2="80" y2="300" stroke="currentColor" stroke-width="2" />
                            <line x1="180" y1="0" x2="180" y2="300" stroke="currentColor" stroke-width="1.5" />
                            <circle cx="180" cy="80" r="4" fill="currentColor" />
                            <path d="M-20,180 Q100,100 320,180" fill="none" stroke="currentColor" stroke-width="2" />
                          </svg>
                        </div>

                        <!-- Radar Pulse Pin -->
                        <button
                          type="button"
                          @click="runStepTransition(2)"
                          aria-label="Select Mama Titi Kitchen food box listing on map"
                          class="absolute top-24 left-36 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        >
                          <span class="absolute inline-flex h-10 w-10 rounded-full bg-[#E8621A]/30 animate-ping" aria-hidden="true"></span>
                          <span class="absolute inline-flex h-6 w-6 rounded-full bg-[#E8621A]/50 animate-pulse" aria-hidden="true"></span>
                          <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#E8621A] border-2 border-white shadow-lg" aria-hidden="true"></span>
                        </button>
                      </div>

                      <div class="mt-5 text-left">
                        <h3 class="font-extrabold text-sm flex items-center gap-1.5">
                          <PhMapPin weight="duotone" class="w-3.5 h-3.5 inline text-[#E8621A] shrink-0" aria-hidden="true" />
                          <span>Mama Titi Kitchen (Deal)</span>
                        </h3>
                        <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[10px] mt-1.5 leading-relaxed">
                          Tap the orange pin on the map to see the deal!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(2)"
                      class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5"
                    >
                      <span>View Deal</span>
                    </button>
                  </div>

                  <!-- SCREEN 2: INSTANT RESERVATION -->
                  <div v-else-if="activeStep === 2" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Order Reserved</span>
                        <span class="text-[11px] font-mono font-bold text-red-500">{{ formatCurrency(walletBalance) }}</span>
                      </div>

                      <div class="space-y-4">
                        <div class="h-32 bg-[#E8621A]/5 rounded-2xl flex items-center justify-center border border-[#E8621A]/20 relative overflow-hidden" aria-hidden="true">
                          <PhLockKey weight="duotone" class="lock-graphic w-14 h-14 text-[#E8621A]" />
                        </div>

                        <div class="text-left">
                          <h3 class="font-extrabold text-sm">Party Jollof & Charcoal Chicken</h3>
                          <p class="text-xs font-bold text-[#E8621A] mt-1.5 flex items-center gap-1">
                            <PhShieldCheck weight="duotone" class="w-3.5 h-3.5 inline text-emerald-500 shrink-0" aria-hidden="true" />
                            <span>₦1,500 paid — Meal reserved for pickup</span>
                          </p>
                          <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[10.5px] mt-2 leading-relaxed">
                            Your meal portion is reserved. Present your 4-digit pickup code at the store to collect your order and complete instant vendor settlement.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(3)"
                      class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      View Pickup Code
                    </button>
                  </div>

                  <!-- SCREEN 3: SECURE CLAIM OTP -->
                  <div v-else-if="activeStep === 3" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Pickup Code</span>
                        <span class="text-[11px] font-mono font-bold">{{ formatCurrency(walletBalance) }}</span>
                      </div>

                      <div class="space-y-5 text-center">
                        <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-[10.5px] leading-relaxed flex items-center justify-center gap-1">
                          <PhClock weight="duotone" class="w-3.5 h-3.5 inline text-amber-500 shrink-0" aria-hidden="true" />
                          <span>Show this code to the seller when you pick up your food.</span>
                        </p>

                        <div class="py-5 bg-[#E8621A]/10 border border-[#E8621A]/25 rounded-2xl relative overflow-hidden flex items-center justify-center gap-2">
                          <div v-for="(col, colIndex) in 4" :key="colIndex" class="w-10 h-12 overflow-hidden relative border border-[#E8621A]/20 bg-[#0E0D0C] rounded-lg flex items-center justify-center">
                            <div :id="`otp-col-${colIndex}`" class="absolute top-0 flex flex-col items-center">
                              <span v-for="digit in 10" :key="digit" class="h-12 flex items-center justify-center text-xl font-mono font-black text-[#E8621A]">
                                {{ digit - 1 }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="text-left text-[10px] space-y-2 border-t border-[#262321]/30 pt-4">
                          <h3 class="font-extrabold uppercase tracking-wider text-[#E8621A] text-[10px] flex items-center gap-1">
                            <PhShieldCheck weight="duotone" class="w-3.5 h-3.5 inline text-emerald-500 shrink-0" aria-hidden="true" />
                            <span>Pickup Steps</span>
                          </h3>
                          <p>1. Go to Mama Titi's at pickup time.</p>
                          <p>2. Show the 4-digit code to the seller.</p>
                          <p>3. Collect your food — done!</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(4)"
                      class="w-full bg-[#181614] hover:bg-[#252220] border border-[#262321] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      Confirm Pickup
                    </button>
                  </div>

                  <!-- SCREEN 4: SUCCESS -->
                  <div v-else-if="activeStep === 4" class="flex-1 flex flex-col justify-between">
                    <div class="text-center py-6 space-y-4">
                      <div class="success-check w-14 h-14 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
                        <PhCheckCircle weight="duotone" class="w-8 h-8 text-[#10B981]" />
                      </div>
                      <div>
                        <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm">Pickup Confirmed!</h3>
                        <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-[10.5px] mt-2 px-3 leading-relaxed">
                          Order fulfilled! ₦1,425 automatically settled to the seller (5% platform fee deducted).
                        </p>
                      </div>
                    </div>

                    <div
                      :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
                      class="p-4 rounded-xl border text-left"
                    >
                      <p class="text-[9px] uppercase tracking-wider font-extrabold opacity-70 flex items-center gap-1">
                        <PhWallet weight="duotone" class="w-3.5 h-3.5 inline text-[#E8621A] shrink-0" aria-hidden="true" />
                        <span>Seller Earnings</span>
                      </p>
                      <p class="text-xl font-mono font-black text-[#10B981] mt-1">{{ formatCurrency(merchantEarnings) }}</p>
                    </div>

                    <button
                      type="button"
                      @click="handleResetSimulator"
                      class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      Reset & Run Again
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Steps Sidebar -->
            <div class="lg:col-span-6 space-y-5 text-left">
              <h3 class="text-2xl font-bold font-display leading-tight">How ordering &amp; settlement work</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base leading-relaxed mb-6">
                Seamless pre-ordering for buyers and automatic, immediate settlement for sellers upon pickup code verification.
              </p>

              <div class="space-y-3.5">
                <div
                  role="button"
                  tabindex="0"
                  @click="runStepTransition(1)"
                  @keydown.enter="runStepTransition(1)"
                  @keydown.space.prevent="runStepTransition(1)"
                  :aria-current="activeStep === 1 ? 'step' : undefined"
                  :class="activeStep === 1 ? 'border-[#E8621A] bg-[#E8621A]/10 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                  class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <PhMagnifyingGlass weight="duotone" class="w-5 h-5 shrink-0 text-[#E8621A]" aria-hidden="true" />
                      <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Find a deal</p>
                    </div>
                    <PhLightning v-if="activeStep === 1" weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Browse food deals on the map near you.
                  </p>
                </div>

                <div
                  role="button"
                  tabindex="0"
                  @click="runStepTransition(2)"
                  @keydown.enter="runStepTransition(2)"
                  @keydown.space.prevent="runStepTransition(2)"
                  :aria-current="activeStep === 2 ? 'step' : undefined"
                  :class="activeStep === 2 ? 'border-[#E8621A] bg-[#E8621A]/10 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                  class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <PhLockKey weight="duotone" class="w-5 h-5 shrink-0 text-[#E8621A]" aria-hidden="true" />
                      <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Pay &amp; reserve</p>
                    </div>
                    <PhLightning v-if="activeStep === 2" weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Pay online to instantly reserve your meal portion for the stipulated pickup window.
                  </p>
                </div>

                <div
                  role="button"
                  tabindex="0"
                  @click="runStepTransition(3)"
                  @keydown.enter="runStepTransition(3)"
                  @keydown.space.prevent="runStepTransition(3)"
                  :aria-current="activeStep === 3 ? 'step' : undefined"
                  :class="activeStep === 3 ? 'border-[#E8621A] bg-[#E8621A]/10 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                  class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <PhQrCode weight="duotone" class="w-5 h-5 shrink-0 text-[#E8621A]" aria-hidden="true" />
                      <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Get your code</p>
                    </div>
                    <PhLightning v-if="activeStep === 3" weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    A unique 4-digit pickup code appears on your phone. Show it at the store to collect your food.
                  </p>
                </div>

                <div
                  role="button"
                  tabindex="0"
                  @click="runStepTransition(4)"
                  @keydown.enter="runStepTransition(4)"
                  @keydown.space.prevent="runStepTransition(4)"
                  :aria-current="activeStep === 4 ? 'step' : undefined"
                  :class="activeStep === 4 ? 'border-[#E8621A] bg-[#E8621A]/10 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                  class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <PhConfetti weight="duotone" class="w-5 h-5 shrink-0 text-[#E8621A]" aria-hidden="true" />
                      <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Pick up &amp; automatic settlement</p>
                    </div>
                    <PhLightning v-if="activeStep === 4" weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Seller verifies your code, earnings are automatically settled immediately, and you enjoy your meal!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Instant Sales Velocity & Geo-Broadcast Section -->
      <section
        id="broadcast-showcase"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/95 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/95 backdrop-blur-sm'"
        class="py-20 md:py-24 relative z-20 transition-colors duration-500"
        aria-labelledby="broadcast-heading"
      >
        <div class="max-w-5xl mx-auto px-6">
          <!-- Section Header -->
          <div class="text-center max-w-2xl mx-auto mb-14">
            <div
              :class="isDark ? 'bg-[#E8621A]/15 border-[#E8621A]/30 text-[#FFA666]' : 'bg-[#FFF7ED] border-[#FDBA74] text-[#9A3412]'"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            >
              <PhBroadcast weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
              <span>1-Tap Instant Broadcast</span>
            </div>
            <h2
              id="broadcast-heading"
              class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display mb-3"
            >
              List it. Broadcast it. Sell out.
            </h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base leading-relaxed">
              Got food ready to sell? Send a 1-tap broadcast to hungry people nearby and watch them buy in minutes. No ads, no social media — just fast sales.
            </p>
          </div>

          <!-- 2-Column Showcase Grid -->
          <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <!-- Left Column: Interactive Scenario Switcher & Live Preview -->
            <div class="lg:col-span-7 space-y-5">
              <!-- Scenario Tab Switcher -->
              <div
                role="tablist"
                aria-label="Broadcast Scenario Selection"
                :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
                class="p-1.5 border rounded-2xl flex flex-wrap sm:flex-nowrap gap-1.5 shadow-sm"
              >
                <button
                  v-for="(preset, idx) in broadcastPresets"
                  :key="preset.id"
                  type="button"
                  role="tab"
                  :id="`broadcast-tab-${preset.id}`"
                  :aria-controls="`broadcast-panel-${preset.id}`"
                  :aria-selected="activePresetIndex === idx"
                  @click="selectBroadcastPreset(idx)"
                  :class="[
                    activePresetIndex === idx
                      ? 'bg-[#E8621A] text-white shadow-md font-bold'
                      : (isDark ? 'text-[#D1CBC7] hover:text-white hover:bg-[#1C1A18]' : 'text-[#544E49] hover:text-[#1E1A17] hover:bg-[#F5F2EE]')
                  ]"
                  class="flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none text-center"
                >
                  <component :is="preset.iconComponent" weight="duotone" class="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span class="truncate">{{ preset.name }}</span>
                </button>
              </div>

              <!-- Live Preview Card -->
              <div
                :id="`broadcast-panel-${activePreset.id}`"
                role="tabpanel"
                :aria-labelledby="`broadcast-tab-${activePreset.id}`"
                :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
                class="border rounded-3xl p-5 sm:p-7 shadow-xl space-y-5 transition-all duration-300"
              >
                <!-- Card Header -->
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
                  :class="isDark ? 'border-[#262321]' : 'border-[#E7E3DF]'"
                >
                  <div class="space-y-0.5 text-left">
                    <div class="flex items-center gap-2">
                      <PhStorefront weight="duotone" class="w-5 h-5 text-[#E8621A]" aria-hidden="true" />
                      <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-base sm:text-lg">
                        {{ activePreset.storeName }}
                      </h3>
                    </div>
                    <p :class="isDark ? 'text-[#A8A29E]' : 'text-[#756C64]'" class="text-xs flex items-center gap-1.5">
                      <PhMapPin weight="duotone" class="w-3.5 h-3.5 inline text-[#E8621A]" aria-hidden="true" />
                      <span>{{ activePreset.location }}</span>
                    </p>
                  </div>

                  <!-- Radius Pill -->
                  <div
                    :class="isDark ? 'bg-[#181614] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
                    class="border rounded-xl px-3 py-1.5 flex items-center gap-2.5 self-start sm:self-auto"
                  >
                    <div class="relative flex h-2.5 w-2.5 items-center justify-center">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8621A] opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-[#E8621A]"></span>
                    </div>
                    <div class="text-left">
                      <span class="text-[11px] font-bold text-[#E8621A]">
                        {{ activePreset.radiusKm }} km Radius
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Product Deal Preview -->
                <div
                  :class="isDark ? 'bg-[#0E0D0C] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
                  class="border rounded-2xl p-4 sm:p-5 space-y-3.5 text-left"
                >
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span
                        :class="isDark ? 'bg-[#E8621A]/15 text-[#FFA666] border-[#E8621A]/30' : 'bg-[#FFF7ED] text-[#9A3412] border-[#FDBA74]'"
                        class="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 border rounded-full mb-1"
                      >
                        {{ activePreset.badgeText }}
                      </span>
                      <h4 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base">
                        {{ activePreset.itemTitle }}
                      </h4>
                    </div>

                    <!-- Dynamic Stock Pill -->
                    <div class="shrink-0">
                      <span
                        v-if="isBroadcastSoldOut"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 border border-rose-500/30 text-rose-500"
                      >
                        <PhSparkle weight="duotone" class="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                        <span>100% Sold Out</span>
                      </span>
                      <span
                        v-else
                        :class="isDark ? 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"
                      >
                        <span class="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" aria-hidden="true"></span>
                        <span>{{ broadcastStockLeft }} / {{ activePreset.quantity }} Available</span>
                      </span>
                    </div>
                  </div>

                  <!-- Formatted Currency & Sellout Speed -->
                  <div class="flex items-center justify-between pt-2 border-t" :class="isDark ? 'border-[#1C1A18]' : 'border-[#E7E3DF]'">
                    <div class="flex items-baseline gap-2.5">
                      <span class="text-xl sm:text-2xl font-black font-mono text-[#E8621A]">
                        {{ formatCurrency(activePreset.discountPrice) }}
                      </span>
                      <span :class="isDark ? 'text-[#8A827C]' : 'text-[#756C64]'" class="text-xs font-mono line-through">
                        {{ formatCurrency(activePreset.originalPrice) }}
                      </span>
                      <span class="text-xs font-black text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md">
                        -{{ activePreset.discountPercent }}%
                      </span>
                    </div>

                    <div :class="isDark ? 'text-[#A8A29E]' : 'text-[#756C64]'" class="text-xs font-medium text-right flex items-center gap-1">
                      <PhLightning weight="duotone" class="w-3.5 h-3.5 inline text-[#E8621A]" aria-hidden="true" />
                      <span>Clears in <strong class="text-[#E8621A]">{{ activePreset.soldMinutes }} mins</strong></span>
                    </div>
                  </div>
                </div>

                <!-- Phone Push Alert Preview -->
                <div class="space-y-2 text-left">
                  <div class="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider" :class="isDark ? 'text-[#A8A29E]' : 'text-[#756C64]'">
                    <span class="flex items-center gap-1">
                      <PhDeviceMobile weight="duotone" class="w-4 h-4 text-[#3B82F6]" aria-hidden="true" />
                      <span>What nearby buyers see:</span>
                    </span>
                    <span class="text-[#10B981]">Instant Notification</span>
                  </div>

                  <div
                    :class="isDark ? 'bg-[#181614] border-[#2E2A27] text-white shadow-xl' : 'bg-white border-[#E2DAD0] text-[#1E1A17] shadow-md'"
                    class="border rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
                  >
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#E8621A]"></div>

                    <div class="w-9 h-9 rounded-xl bg-[#E8621A] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-md">
                      <PhShoppingBag weight="duotone" class="w-5 h-5 text-white" aria-hidden="true" />
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-[10px] font-extrabold uppercase tracking-widest text-[#E8621A]">Jarabag • Just now</span>
                        <span :class="isDark ? 'text-[#8A827C]' : 'text-[#756C64]'" class="text-[10px]">within {{ activePreset.radiusKm }}km</span>
                      </div>
                      <p class="font-bold text-xs sm:text-sm mt-0.5 truncate" :class="isDark ? 'text-white' : 'text-[#1E1A17]'">
                        {{ activePreset.notificationTitle }}
                      </p>
                      <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-0.5 leading-snug">
                        {{ activePreset.notificationBody }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Footer: Local Buyers Count & Trigger Blast Button -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t" :class="isDark ? 'border-[#262321]' : 'border-[#E7E3DF]'">
                  <div class="text-left">
                    <p class="text-xs font-bold" :class="isDark ? 'text-white' : 'text-[#1E1A17]'">
                      {{ activePreset.audienceCount }} nearby buyers notified
                    </p>
                    <p :class="isDark ? 'text-[#A8A29E]' : 'text-[#756C64]'" class="text-[11px]">
                      Average sellout time: <strong class="text-[#E8621A]">{{ activePreset.soldMinutes }} minutes</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    @click="triggerBroadcastDemo"
                    :disabled="isBroadcasting"
                    :class="[
                      isBroadcasting
                        ? 'opacity-70 cursor-not-allowed bg-[#E8621A]'
                        : 'bg-[#E8621A] hover:bg-[#CF5112] active:scale-98 cursor-pointer'
                    ]"
                    class="px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all select-none min-h-[42px]"
                  >
                    <span v-if="isBroadcasting" class="animate-spin text-sm" aria-hidden="true">⟳</span>
                    <span v-else class="text-sm" aria-hidden="true">↻</span>
                    <span>{{ isBroadcasting ? 'Broadcasting Batch...' : 'Replay Blast' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Column: 3 Clear Benefits & App Download Card -->
            <div class="lg:col-span-5 space-y-5 text-left">
              <!-- Benefit 1 -->
              <div
                :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
                class="p-5 border rounded-2xl space-y-2 shadow-sm transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#E8621A]/10 text-[#E8621A] flex items-center justify-center text-lg font-bold" aria-hidden="true">
                    <PhLightning weight="duotone" class="w-5 h-5 text-[#E8621A]" />
                  </div>
                  <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm sm:text-base">
                    Instant Sales, No Ads
                  </h3>
                </div>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Broadcast to nearby buyers and sell out fast — no ad spend, no social media posting needed.
                </p>
              </div>

              <!-- Benefit 2 -->
              <div
                :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
                class="p-5 border rounded-2xl space-y-2 shadow-sm transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center text-lg font-bold" aria-hidden="true">
                    <PhDeviceMobile weight="duotone" class="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm sm:text-base">
                    Straight to Their Phone
                  </h3>
                </div>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Push notifications go directly to nearby buyers' phones — no algorithms, no crowded feeds.
                </p>
              </div>

              <!-- Benefit 3 -->
              <div
                :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
                class="p-5 border rounded-2xl space-y-2 shadow-sm transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-lg font-bold" aria-hidden="true">
                    <PhShieldCheck weight="duotone" class="w-5 h-5 text-[#10B981]" />
                  </div>
                  <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm sm:text-base">
                    Pre-paid, No No-shows
                  </h3>
                </div>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Every order is pre-paid. No wasted food, no unpaid pickups.
                </p>
              </div>

              <!-- Clean App Download Card -->
              <div
                :class="isDark ? 'bg-gradient-to-br from-[#1C1A18] to-[#12110F] border-[#E8621A]/40 shadow-orange-950/20' : 'bg-gradient-to-br from-[#FFF7ED] to-[#FFF] border-[#FDBA74] shadow-orange-100'"
                class="p-6 border-2 rounded-3xl shadow-xl space-y-4 relative overflow-hidden"
              >
                <div class="space-y-1.5">
                  <span
                    class="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#E8621A] text-white"
                  >
                    Sell Fast • Save More
                  </span>
                  <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-base sm:text-lg font-extrabold font-display leading-tight">
                    Ready to sell fast or find cheap food?
                  </h3>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                    Get the Jarabag app to start selling or discover discounted meals nearby.
                  </p>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    @click="triggerDownload('google')"
                    aria-label="Download Jarabag on Google Play"
                    class="flex-1 inline-flex items-center justify-center gap-2 bg-[#E8621A] hover:bg-[#CF5112] text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-orange-600/30 transition-all select-none cursor-pointer min-h-[44px]"
                  >
                    <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5,3.14L15.31,13.43L5,23.71C4.42,23.14 4.09,22.28 4.09,21.14V5.71C4.09,4.57 4.42,3.71 5,3.14M20.25,12.56L16.73,14.56L16.03,13.86L20.25,12.56M17.44,11.89L21.43,9.89C22.18,9.5 22.18,8.5 21.43,8.11L17.44,6.11C16.89,5.83 16.27,6.17 16.27,6.78V11.22C16.27,11.83 16.89,12.17 17.44,11.89M5.71,2.43L15.31,12L5.71,21.57C6.28,22.14 7.14,22.47 8.29,22.47C9.14,22.47 10.09,22.09 11.23,21.43L19.29,16.86L15.31,12L11.23,7.14L19.29,2.57L11.23,2C10.09,1.33 9.14,1 8.29,1C7.14,1 6.28,1.33 5.71,1.9M8.29,1.9H8.3C8.42,1.9 8.54,1.93 8.66,2L14.6,5.34L7.66,12.28L6.43,11.05C6.07,10.69 5.86,10.14 5.86,9.57C5.86,9 6.07,8.45 6.43,8.09L8.29,1.9Z" />
                    </svg>
                    <span>Google Play</span>
                  </button>
                  <button
                    type="button"
                    @click="triggerDownload('apple')"
                    aria-label="Download Jarabag on App Store"
                    :class="isDark ? 'bg-[#262321] text-white hover:bg-[#332E2A]' : 'bg-[#1E1A17] text-white hover:bg-black'"
                    class="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all select-none cursor-pointer min-h-[44px]"
                  >
                    <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                    </svg>
                    <span>App Store</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- App Features Section -->
      <section
        id="app-features"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]/50' : 'border-t border-[#E7E3DF] bg-white/50'"
        class="py-24 relative z-20 backdrop-blur-md"
        aria-labelledby="superpowers-heading"
      >
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <div
              :class="isDark ? 'bg-[#E8621A]/15 border-[#E8621A]/30 text-[#FFA666]' : 'bg-[#FFF7ED] border-[#FDBA74] text-[#9A3412]'"
              class="inline-flex items-center gap-2 px-3.5 py-1.5 border rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            >
              <PhLightning weight="duotone" class="w-4 h-4 text-[#E8621A]" aria-hidden="true" />
              <span>Platform Superpowers</span>
            </div>
            <h2 id="superpowers-heading" class="text-3xl md:text-4xl font-extrabold tracking-tight font-display mb-4">
              Smart tools for both sides of the counter.
            </h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">
              We built powerful features into the Jarabag app that make buying and selling discounted food completely effortless.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 feature-card-container">
            <!-- 1 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#E8621A]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhMapPin weight="duotone" class="w-6 h-6 text-[#E8621A]" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">Broadcast Radius Control</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Expand your alert radius from 2km to city-wide reach instantly, ensuring your food sells out fast.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#E8621A]">For Sellers</span>
            </div>

            <!-- 2 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#10B981]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#10B981]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhLockKey weight="duotone" class="w-6 h-6 text-emerald-500" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">Deal Alerts Near You</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Get notified the moment cheap food drops near you, or when walking near your favorite kitchen.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#10B981]">For Buyers</span>
            </div>

            <!-- 3 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#E8621A]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhWallet weight="duotone" class="w-6 h-6 text-[#E8621A]" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">Zero Ad Spend</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Post food in 10 seconds. We automatically ping hungry buyers in your area. No paid ads required.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#E8621A]">For Sellers</span>
            </div>

            <!-- 4 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#3B82F6]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#3B82F6]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhLightning weight="duotone" class="w-6 h-6 text-amber-500" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">One-Tap Reserving</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                See a meal you love? Tap to pre-order and reserve your portion instantly in seconds without hassle.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#3B82F6]">For Buyers</span>
            </div>

            <!-- 5 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#8B5CF6]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#8B5CF6]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhPackage weight="duotone" class="w-6 h-6 text-purple-500" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">Scheduled Listings</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Busy during peak hours? Pre-schedule your meal drops. Our system notifies nearby customers at your chosen time.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]">For Sellers</span>
            </div>

            <!-- 6 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#EF4444]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#EF4444]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">
                <PhBank weight="duotone" class="w-6 h-6 text-emerald-500" />
              </div>
              <h3 class="text-lg font-extrabold mb-2">Automatic Seller Settlement</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                No manual delays. Order earnings are automatically settled to the seller immediately upon 4-digit pickup code verification, with direct bank transfers.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-emerald-500">For Sellers</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Values Section -->
      <section
        id="features"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]'"
        class="py-24 transition-colors duration-500 relative z-20"
        aria-labelledby="principles-heading"
      >
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center max-w-lg mx-auto mb-16">
            <h2 id="principles-heading" class="text-3xl font-extrabold tracking-tight font-display mb-3 text-[#E8621A]">Why Jarabag</h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">Built for speed, safety, and everyday savings.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#10B981]/30' : 'bg-white border-[#E7E3DF] hover:border-[#10B981]/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5" aria-hidden="true">
                  <PhShieldCheck weight="duotone" class="w-6 h-6 text-emerald-500" />
                </div>
                <h3 class="text-base font-extrabold mb-2.5">Verified Pickup &amp; Settlement</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Every order generates a unique 4-digit pickup code so the right customer collects the right meal and sellers are settled automatically.
                </p>
              </div>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div class="w-12 h-12 rounded-2xl bg-[#E8621A]/10 flex items-center justify-center mb-5" aria-hidden="true">
                  <PhLightning weight="duotone" class="w-6 h-6 text-[#E8621A]" />
                </div>
                <h3 class="text-base font-extrabold mb-2.5">Sell Instantly</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  One tap broadcasts your meals to hungry nearby buyers in seconds. No ads, no social media hassles.
                </p>
              </div>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-teal-500/30' : 'bg-white border-[#E7E3DF] hover:border-teal-500/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div class="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-5" aria-hidden="true">
                  <PhLeaf weight="duotone" class="w-6 h-6 text-teal-500" />
                </div>
                <h3 class="text-base font-extrabold mb-2.5">Less Waste, More Value</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Good food gets enjoyed, not wasted. Great discounts for customers, recovered revenue for sellers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Impact Stats Section -->
      <section
        id="impact-stats"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]/90 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/90 backdrop-blur-sm'"
        class="py-20 transition-colors duration-500 relative z-20"
        aria-labelledby="stats-heading"
      >
        <h2 id="stats-heading" class="sr-only">Platform Impact Statistics</h2>
        <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center select-none">
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-xl bg-[#E8621A]/10 flex items-center justify-center mb-3" aria-hidden="true">
              <PhShoppingBag weight="duotone" class="w-5 h-5 text-[#E8621A]" />
            </div>
            <p id="stat-meals" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">15,420+</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Meals Sold</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3" aria-hidden="true">
              <PhCoins weight="duotone" class="w-5 h-5 text-emerald-500" />
            </div>
            <p id="stat-savings" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">₦24,500,000</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Customer Savings</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3" aria-hidden="true">
              <PhStorefront weight="duotone" class="w-5 h-5 text-amber-500" />
            </div>
            <p id="stat-sellers" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">150+</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Active Sellers</p>
          </div>
          <div class="flex flex-col items-center">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3" aria-hidden="true">
              <PhTimer weight="duotone" class="w-5 h-5 text-blue-500" />
            </div>
            <p id="stat-speed" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">~12 Mins</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Avg. Sellout Time</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer Landmark -->
    <footer
      role="contentinfo"
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/90 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/90 backdrop-blur-sm'"
      class="py-12 text-sm transition-colors relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <router-link to="/" class="flex items-center select-none" aria-label="Jarabag Home">
          <img
            src="/jarabag-full-logo.svg"
            alt="Jarabag Logo"
            width="140"
            height="36"
            class="h-7 md:h-9 w-auto object-contain"
          />
        </router-link>

        <nav aria-label="Footer Navigation" class="flex gap-6 font-semibold">
          <router-link
            to="/privacy"
            :class="isDark ? 'text-[#D1CBC7] hover:text-white' : 'text-[#544E49] hover:text-[#110E0D]'"
            class="transition-colors"
          >
            Privacy Policy
          </router-link>
          <router-link
            to="/terms"
            :class="isDark ? 'text-[#D1CBC7] hover:text-white' : 'text-[#544E49] hover:text-[#110E0D]'"
            class="transition-colors"
          >
            Terms of Service
          </router-link>
        </nav>

        <p :class="isDark ? 'text-[#A8A29E]' : 'text-[#544E49]'" class="text-xs">
          &copy; 2026 Jarabag Technologies Limited. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.toast-alert-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-alert-leave-active {
  animation: toast-out 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
  from {
    transform: translateY(1.2rem) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
@keyframes toast-out {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(1.2rem) scale(0.96);
    opacity: 0;
  }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
