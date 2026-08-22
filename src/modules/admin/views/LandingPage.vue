<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const isDark = ref(false)
const showDownloadAlert = ref(false)
const downloadStoreName = ref('')

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

// Background Floating Parallax Config
const floatingElements = ref([
  { id: 1, x: '8%', y: '18%', size: 44, rotation: 12, delay: 0, speed: 5, label: '🍲', type: 'emoji' },
  { id: 2, x: '88%', y: '14%', size: 52, rotation: -18, delay: 0.8, speed: 6, label: '🌱', type: 'emoji' },
  { id: 3, x: '82%', y: '78%', size: 38, rotation: 15, delay: 0.4, speed: 4.5, label: '₦', type: 'coin' },
  { id: 4, x: '10%', y: '82%', size: 48, rotation: -10, delay: 1.2, speed: 5.5, label: '🌍', type: 'emoji' },
  { id: 5, x: '78%', y: '48%', size: 32, rotation: 22, delay: 1.6, speed: 4, label: '🍊', type: 'emoji' },
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

  // ScrollTrigger for Timeline Path
  if (document.querySelector('#timeline-path') && document.querySelector('.lifecycle-timeline')) {
    gsap.fromTo('#timeline-path',
      { strokeDashoffset: 800 },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '.lifecycle-timeline',
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 1,
        }
      }
    )
  }

  // Count-up Stats
  const statItems = [
    { target: '#stat-bags', value: 15420, suffix: '+' },
    { target: '#stat-savings', value: 24500000, prefix: '₦', suffix: '' },
    { target: '#stat-co2', value: 18, suffix: ' Tons' },
    { target: '#stat-bukas', value: 150, suffix: '+' }
  ]

  statItems.forEach((item) => {
    const el = document.querySelector(item.target)
    if (el) {
      const valContainer = { val: 0 }
      gsap.to(valContainer, {
        val: item.value,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#impact-stats',
          start: 'top 90%',
        },
        onUpdate: () => {
          let output = Math.round(valContainer.val).toLocaleString()
          if (item.prefix) output = item.prefix + output
          if (item.suffix) output = output + item.suffix
          el.textContent = output
        }
      })
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
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
        <span v-if="el.type === 'emoji'">{{ el.label }}</span>
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
          📱
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
            <span v-if="isDark" aria-hidden="true" class="text-sm">☀️</span>
            <span v-else aria-hidden="true" class="text-sm">🌙</span>
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
              <span aria-hidden="true">🌱</span>
              <span>Smart Food Rescue Mechanics</span>
            </div>

            <h1 id="hero-title" class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 overflow-hidden">
              <span class="inline-block hero-word mr-3">Rescue</span>
              <span class="inline-block hero-word mr-3">fresh</span>
              <span class="inline-block hero-word mr-3 text-[#E8621A]">surplus.</span>
              <br />
              <span class="inline-block hero-word mr-3">Save</span>
              <span class="inline-block hero-word mr-3">funds.</span>
              <span class="inline-block hero-word text-[#E8621A]">Protect.</span>
            </h1>

            <p
              :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'"
              class="text-base sm:text-lg leading-relaxed mb-8 max-w-lg hero-fade-in transition-colors"
            >
              Jarabag matches you with top-rated local eateries, bukas, and kitchens. Collect delicious surplus food boxes before closing and play your part in reducing landfill waste via our secure verification system.
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
              <div class="w-16 h-16 bg-[#E8621A]/10 text-3xl rounded-2xl flex items-center justify-center select-none" aria-hidden="true">
                💚
              </div>
              <h2 class="text-base font-extrabold mt-4">Simulate Our Safe Flow</h2>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-2.5 leading-relaxed px-2">
                Jarabag guards your transaction securely. Experience the automated lock-escrow and OTP release protocol below!
              </p>
              <a
                href="#simulator"
                @click="scrollToSection('simulator', $event)"
                class="mt-6 px-6 py-3 bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors inline-block select-none cursor-pointer"
              >
                Start Live Simulator
              </a>
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
              Live Escrow Simulator
            </h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">
              Click the interactive buttons inside the phone mockup below to test our cryptographic protection flow.
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
                  <!-- Lock notification banner -->
                  <div v-if="activeStep === 2" class="push-notif absolute top-9 left-4 right-4 bg-[#E8621A] p-3 rounded-2xl shadow-xl z-30 flex items-center gap-3">
                    <span class="text-xl" aria-hidden="true">🎉</span>
                    <div class="text-left text-white leading-tight">
                      <p class="text-[9px] font-bold uppercase tracking-wider opacity-90">Instant Reservation</p>
                      <p class="text-[11px] font-extrabold mt-0.5">Escrow Lock Confirmed!</p>
                    </div>
                  </div>

                  <!-- SCREEN 1: BROWSE MAP -->
                  <div v-if="activeStep === 1" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Rescue Map</span>
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
                        <h3 class="font-extrabold text-sm">Mama Titi Kitchen (Surplus)</h3>
                        <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[10px] mt-1.5 leading-relaxed">
                          Click the active orange pin on the radar map above to inspect listing details!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(2)"
                      class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      View Food Box details
                    </button>
                  </div>

                  <!-- SCREEN 2: LOCK ESCROW -->
                  <div v-else-if="activeStep === 2" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Escrow Lock</span>
                        <span class="text-[11px] font-mono font-bold text-red-500">{{ formatCurrency(walletBalance) }}</span>
                      </div>

                      <div class="space-y-4">
                        <div class="h-32 bg-[#E8621A]/5 rounded-2xl flex items-center justify-center border border-[#E8621A]/20 relative overflow-hidden" aria-hidden="true">
                          <div class="lock-graphic text-5xl">🔒</div>
                        </div>

                        <div class="text-left">
                          <h3 class="font-extrabold text-sm">Party Jollof & Charcoal Chicken</h3>
                          <p class="text-xs font-bold text-[#E8621A] mt-1.5">₦1,500 held in secure escrow</p>
                          <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[10.5px] mt-2 leading-relaxed">
                            Your money is held in the platform escrow pool. The vendor receives no payment until you present the unique OTP upon delivery.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(3)"
                      class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      Generate Claim OTP
                    </button>
                  </div>

                  <!-- SCREEN 3: SECURE CLAIM OTP -->
                  <div v-else-if="activeStep === 3" class="flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                        <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">OTP Verification</span>
                        <span class="text-[11px] font-mono font-bold">{{ formatCurrency(walletBalance) }}</span>
                      </div>

                      <div class="space-y-5 text-center">
                        <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-[10.5px] leading-relaxed">
                          Show this rolling OTP code to the merchant at the pickup counter.
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
                          <h3 class="font-extrabold uppercase tracking-wider text-[#E8621A] text-[10px]">Pickup Instructions</h3>
                          <p>1. Arrive at Mama Titi's within pickup times.</p>
                          <p>2. Share the 4-digit code with the clerk.</p>
                          <p>3. Wait for database verification confirm.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="runStepTransition(4)"
                      class="w-full bg-[#181614] hover:bg-[#252220] border border-[#262321] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                    >
                      Simulate Vendor input
                    </button>
                  </div>

                  <!-- SCREEN 4: SUCCESS -->
                  <div v-else-if="activeStep === 4" class="flex-1 flex flex-col justify-between">
                    <div class="text-center py-6 space-y-4">
                      <div class="success-check w-14 h-14 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-2xl rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
                        ✓
                      </div>
                      <div>
                        <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm">Verification Success</h3>
                        <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-[10.5px] mt-2 px-3 leading-relaxed">
                          Funds released! ₦1,425 has been credited to the vendor wallet (5% platform commission deducted).
                        </p>
                      </div>
                    </div>

                    <div
                      :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
                      class="p-4 rounded-xl border text-left"
                    >
                      <p class="text-[9px] uppercase tracking-wider font-extrabold opacity-70">Vendor Ledger Balance</p>
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
              <h3 class="text-2xl font-bold font-display leading-tight">Escrow-backed trust loop</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base leading-relaxed mb-6">
                Jarabag completely eliminates payment fraud by using safe automated locks. Funds move between users only after scanning the OTP code at the counter.
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
                    <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 1 — Discover Deal</p>
                    <span v-if="activeStep === 1" aria-hidden="true" class="text-xs">⚡</span>
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Browse geolocated listings on the interactive food map near your target coordinates.
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
                    <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 2 — Lock Escrow</p>
                    <span v-if="activeStep === 2" aria-hidden="true" class="text-xs">⚡</span>
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Funds are secured safely in the platform escrow pool until handover code verification.
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
                    <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 3 — Retrieve Rolling OTP</p>
                    <span v-if="activeStep === 3" aria-hidden="true" class="text-xs">⚡</span>
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    A unique, secure claim verification OTP code rolls onto your device.
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
                    <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 4 — Release &amp; Verified</p>
                    <span v-if="activeStep === 4" aria-hidden="true" class="text-xs">⚡</span>
                  </div>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs mt-1.5 leading-relaxed">
                    Merchant enters the OTP on terminal, releases escrow balance, and handles fresh pickup!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Lifecycle Trace Map -->
      <section
        id="timeline-flow"
        :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]' : 'border-t border-[#E7E3DF] bg-white'"
        class="py-24 relative z-20"
        aria-labelledby="lifecycle-heading"
      >
        <div class="max-w-5xl mx-auto px-6">
          <div class="text-center max-w-lg mx-auto mb-16">
            <h2 id="lifecycle-heading" class="text-3xl font-extrabold tracking-tight font-display mb-3">The Saved-Food Lifecycle</h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">Trace the path of a meal package from listing to escrow payoff.</p>
          </div>

          <div class="lifecycle-timeline relative w-full overflow-x-auto pb-8 scrollbar-hide">
            <div class="min-w-[700px] max-w-full relative h-36 flex flex-col justify-between">
              <div class="absolute inset-0 top-10 pointer-events-none select-none" aria-hidden="true">
                <svg class="w-full h-10 overflow-visible" viewBox="0 0 700 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50,20 L 650,20" :stroke="isDark ? '#262321' : '#E7E3DF'" stroke-width="4" stroke-linecap="round" />
                  <path id="timeline-path" d="M 50,20 L 650,20" stroke="#E8621A" stroke-width="4" stroke-linecap="round" stroke-dasharray="600" stroke-dashoffset="600" />
                </svg>
              </div>

              <div class="flex justify-between items-center z-10 px-12 relative top-2">
                <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                  <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none" aria-hidden="true">
                    🍲
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-wider mt-3">1. Listing</p>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[9px] mt-0.5 leading-snug">Kitchen posts excess</p>
                </div>

                <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                  <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none" aria-hidden="true">
                    🔒
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-wider mt-3">2. Lock</p>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[9px] mt-0.5 leading-snug">Escrow hold funds</p>
                </div>

                <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                  <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none" aria-hidden="true">
                    🔐
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-wider mt-3">3. Code</p>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[9px] mt-0.5 leading-snug">Pickup OTP rolls</p>
                </div>

                <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                  <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none" aria-hidden="true">
                    💳
                  </div>
                  <p class="text-[10px] font-black uppercase tracking-wider mt-3">4. Release</p>
                  <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-[9px] mt-0.5 leading-snug">Payoff releases</p>
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
              <span aria-hidden="true">🚀</span>
              <span>Platform Superpowers</span>
            </div>
            <h2 id="superpowers-heading" class="text-3xl md:text-4xl font-extrabold tracking-tight font-display mb-4">
              Smart tools for both sides of the counter.
            </h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">
              We built powerful features into the Jarabag app that make recovering surplus food entirely effortless.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 feature-card-container">
            <!-- 1 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#E8621A]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">📡</div>
              <h3 class="text-lg font-extrabold mb-2">Dynamic Push Radius</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Vendors can expand their alert radius from a local neighborhood (2km) to city-wide reach instantly, ensuring large batches of food sell out before closing.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#E8621A]">For Vendors</span>
            </div>

            <!-- 2 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#10B981]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#10B981]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#10B981]/10 text-[#10B981] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">🔔</div>
              <h3 class="text-lg font-extrabold mb-2">Proximity Alerts</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                "Ping! Fresh bags near you." Receive instant notifications the moment new surplus bags drop nearby, or when walking near a buka with available bags.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#10B981]">For Consumers</span>
            </div>

            <!-- 3 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#E8621A]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#E8621A]/10 text-[#E8621A] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">📢</div>
              <h3 class="text-lg font-extrabold mb-2">Zero Marketing Effort</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Post a surplus bag in 10 seconds. We automatically crowd-ping hungry users in your area. Turn daily kitchen surplus into instant recovered revenue.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#E8621A]">For Vendors</span>
            </div>

            <!-- 4 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#3B82F6]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#3B82F6]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#3B82F6]/10 text-[#3B82F6] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">⚡</div>
              <h3 class="text-lg font-extrabold mb-2">One-Tap Reserving</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                See a meal you love? Tap to lock it in escrow instantly. Secure your discounted meal in seconds without complex checkout steps.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#3B82F6]">For Consumers</span>
            </div>

            <!-- 5 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#8B5CF6]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#8B5CF6]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">⏰</div>
              <h3 class="text-lg font-extrabold mb-2">Scheduled Listings</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Too busy during rush hours? Pre-schedule your surplus drops for evening pickup. Our system automatically notifies nearby customers at your chosen time.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]">For Vendors</span>
            </div>

            <!-- 6 -->
            <div :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#EF4444]/40' : 'bg-[#FAF8F6] border-[#E7E3DF] hover:border-[#EF4444]/40'" class="flex flex-col h-full p-8 border rounded-3xl transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div class="w-12 h-12 bg-[#EF4444]/10 text-[#EF4444] rounded-2xl flex items-center justify-center text-xl mb-6" aria-hidden="true">❤️</div>
              <h3 class="text-lg font-extrabold mb-2">Favorite Your Spots</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed mb-4">
                Love a specific bakery or buka? Save them to your favorites to get priority notifications the moment they post a new surplus bag.
              </p>
              <span class="mt-auto block text-[9px] font-black uppercase tracking-widest text-[#EF4444]">For Consumers</span>
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
            <h2 id="principles-heading" class="text-3xl font-extrabold tracking-tight font-display mb-3 text-[#E8621A]">Core Platform Principles</h2>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm sm:text-base">We combine sustainable food economics with modern security.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <span class="text-4xl select-none" aria-hidden="true">🍲</span>
                <h3 class="text-base font-extrabold mt-5 mb-2.5">Zero Food Waste</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Clear fresh surplus inventory from local kitchens daily. Provide safe, warm portions at massive savings.
                </p>
              </div>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <span class="text-4xl select-none" aria-hidden="true">🛡️</span>
                <h3 class="text-base font-extrabold mt-5 mb-2.5">Secure Escrow Lock</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Payments are held inside the platform lock pool. Escrow releases balance exclusively when claim code matches database.
                </p>
              </div>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
              class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
            >
              <div>
                <span class="text-4xl select-none" aria-hidden="true">🌍</span>
                <h3 class="text-base font-extrabold mt-5 mb-2.5">Environmental Recovery</h3>
                <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs sm:text-sm leading-relaxed">
                  Stop organic inventory from decomposing inside local landfills, dramatically lowering methane emissions.
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
          <div>
            <p id="stat-bags" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Surplus Bags Saved</p>
          </div>
          <div>
            <p id="stat-savings" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Customer Savings</p>
          </div>
          <div>
            <p id="stat-co2" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">CO₂ Prevented</p>
          </div>
          <div>
            <p id="stat-bukas" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
            <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-xs uppercase tracking-widest mt-2.5 font-bold">Registered Kitchens</p>
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
          &copy; 2026 Jarabag. All rights reserved.
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
