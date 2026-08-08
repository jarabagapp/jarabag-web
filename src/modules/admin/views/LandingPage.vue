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

const toggleMode = (event: MouseEvent) => {
  const x = event.clientX
  const y = event.clientY

  const overlay = document.querySelector('.theme-wipe-overlay') as HTMLElement
  if (!overlay) {
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
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => {
        isDark.value = nextIsDark
        document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
        if (typeof window !== 'undefined') {
          localStorage.setItem('jarabag_theme', isDark.value ? 'dark' : 'light')
        }
        gsap.set(overlay, { display: 'none', clipPath: `circle(0px at ${x}px ${y}px)` })
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

  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div')
    el.className = 'absolute w-2.5 h-2.5 rounded-sm pointer-events-none z-50'
    const colors = ['#E8621A', '#10B981', '#3B82F6', '#FBBF24', '#EC4899']
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || '#E8621A'

    const startX = 150 // center of 300px phone mockup
    const startY = 160 // vertical center of checkmark

    container.appendChild(el)

    const angle = Math.random() * Math.PI * 2
    const distance = 40 + Math.random() * 110
    const endX = startX + Math.cos(angle) * distance
    const endY = startY + Math.sin(angle) * distance + (40 + Math.random() * 80) // gravity drift

    gsap.set(el, { x: startX, y: startY, scale: Math.random() * 0.8 + 0.4, rotation: Math.random() * 360 })

    gsap.to(el, {
      x: endX,
      y: endY,
      rotation: Math.random() * 720,
      opacity: 0,
      duration: 1.5 + Math.random() * 1.5,
      ease: 'power2.out',
      onComplete: () => el.remove()
    })
  }
}
const scrollTimelineToNode = (stepNumber: number) => {
  const container = document.querySelector('.lifecycle-timeline')
  if (!container) return

  const nodes = document.querySelectorAll('.lifecycle-step-node')
  const targetNode = nodes[stepNumber - 1] as HTMLElement
  if (!targetNode) return

  const containerWidth = container.clientWidth
  const nodeOffsetLeft = targetNode.offsetLeft
  const nodeWidth = targetNode.clientWidth

  const targetScrollLeft = nodeOffsetLeft - (containerWidth / 2) + (nodeWidth / 2)

  gsap.to(container, {
    scrollLeft: targetScrollLeft,
    duration: 0.6,
    ease: 'power2.out'
  })
}

// GSAP interactive transitions
const runStepTransition = (targetStep: number) => {
  scrollTimelineToNode(targetStep)

  gsap.to('.sim-screen', {

    opacity: 0,
    scale: 0.96,
    duration: 0.2,
    onComplete: () => {
      activeStep.value = targetStep

      gsap.to('.sim-screen', {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out',
      })

      // Wait for Vue DOM patch
      nextTick(() => {
        // Run specific step animations
        if (targetStep === 2) {
          // Animate wallet countdown
          gsap.to(walletBalance, {
            duration: 1.2,
            value: 3000,
            roundProps: 'value',
            ease: 'power2.out',
          })

          // Lock secure transition
          gsap.fromTo('.lock-graphic',
            { scale: 0.6, rotation: -90, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.1 }
          )
        }

        if (targetStep === 3) {
          // Roll number effect using slot column translations
          otpDigits.forEach((digit, idx) => {
            const col = document.getElementById(`otp-col-${idx}`)
            if (col) {
              const targetY = -parseInt(digit) * 48 // 48px height per digit box
              gsap.fromTo(col,
                { y: 0 },
                {
                  y: targetY,
                  duration: 1.5 + idx * 0.15,
                  ease: 'power3.out',
                }
              )
            }
          })
        }

        if (targetStep === 4) {
          // Confetti burst
          spawnConfetti()

          // Animate merchant balance count up
          gsap.to(merchantEarnings, {
            duration: 1.5,
            value: 13425, // 12000 + 1500 - 5% commission = 13425
            roundProps: 'value',
            ease: 'power3.out',
          })

          // Ticket pop up
          gsap.fromTo('.success-check',
            { scale: 0, rotate: -45 },
            { scale: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' }
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

const handleMouseMove = (event: MouseEvent) => {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const dx = (event.clientX - cx) / cx
  const dy = (event.clientY - cy) / cy

  floatingElements.value.forEach((el) => {
    const factor = (el.size / 44) * 25
    gsap.to(`#float-el-${el.id}`, {
      x: dx * factor,
      y: dy * factor,
      duration: 1.5,
      ease: 'power2.out',
      overwrite: 'auto'
    })
  })
}

onMounted(() => {
  // Check theme preference (default to light mode)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('jarabag_theme')
    if (saved === 'dark') {
      isDark.value = true
    } else {
      isDark.value = false
    }
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  // Configure ScrollTrigger default scroller (since #app handles page scrolling)
  ScrollTrigger.defaults({
    scroller: '#app'
  })

  // Mouse move listener for parallax depth
  window.addEventListener('mousemove', handleMouseMove)


  // GSAP Hero Reveals
  gsap.from('.hero-word', {
    y: 35,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power4.out'
  })

  gsap.from('.hero-fade-in', {
    opacity: 0,
    y: 20,
    duration: 1,
    delay: 0.4,
    stagger: 0.2,
    ease: 'power3.out'
  })

  // Start autonomous float timelines
  floatingElements.value.forEach((el) => {
    gsap.to(`#float-el-${el.id}`, {
      y: '+=25',
      rotation: '+=20',
      duration: el.speed,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: el.delay
    })
  })

  // ScrollTrigger - SVG Path Tracing for Lifecycle Timeline
  gsap.fromTo('#timeline-path',
    { strokeDashoffset: 800 },
    {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.lifecycle-timeline',
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: 1,
      }
    }
  )

  // ScrollTrigger - Lifecycle Steps scaling
  gsap.from('.lifecycle-step-node', {
    scale: 0,
    opacity: 0,
    duration: 0.6,
    stagger: 0.2,
    ease: 'back.out(1.5)',
    scrollTrigger: {
      trigger: '.lifecycle-timeline',
      start: 'top 75%',
      end: 'bottom 35%',
      scrub: false,
    }
  })

  // ScrollTrigger - Count-up Stats
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
        duration: 2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#impact-stats',
          start: 'top 85%',
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
    :class="isDark ? 'bg-[#090807] text-[#F8F6F4]' : 'bg-[#FAF8F6] text-[#1E1A17]'"
    class="min-h-screen font-sans selection:bg-[#E8621A] selection:text-white transition-colors duration-500 overflow-x-hidden relative"
  >
    <!-- Background Technical Grid (Fixed & Crisp across light & dark modes) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="technical-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" :stroke="isDark ? '#302B27' : '#DDD5CC'" stroke-width="1.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#technical-grid)" />
      </svg>
    </div>

    <!-- Parallax Elements in Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
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

    <!-- Theme Transition Overlay Sweep -->
    <div class="theme-wipe-overlay fixed inset-0 pointer-events-none z-50 hidden" style="clip-path: circle(0px at 0px 0px);"></div>

    <!-- Global Toast Alert -->
    <transition name="toast-alert">
      <div
        v-if="showDownloadAlert"
        :class="isDark ? 'bg-[#12110F] border-[#262321] text-[#FAF8F6] shadow-2xl' : 'bg-white border-[#E7E3DF] text-[#1E1A17] shadow-lg'"
        class="fixed bottom-6 right-6 z-[9999] border px-5 py-4 rounded-2xl flex items-center gap-3.5 max-w-sm transition-all"
      >
        <div class="w-10 h-10 bg-[#E8621A]/10 text-[#E8621A] rounded-xl flex items-center justify-center text-xl font-bold">
          📱
        </div>
        <div>
          <p class="font-bold text-sm">App coming soon to {{ downloadStoreName }}</p>
          <p :class="isDark ? 'text-neutral-400' : 'text-neutral-500'" class="text-xs mt-0.5 leading-relaxed">
            We are polishing the experience before our official store launch!
          </p>
        </div>
      </div>
    </transition>

    <!-- Sticky Header Navigation -->
    <header
      :class="isDark ? 'border-b border-[#1A1816] bg-[#090807]/80' : 'border-b border-[#E7E3DF] bg-[#FAF8F6]/80'"
      class="backdrop-blur-md sticky top-0 z-40 transition-colors duration-500"
    >
      <div class="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3 select-none">
          <img src="/jarabag-icon.svg" alt="Jarabag Logo" class="w-10 h-10 object-contain drop-shadow-sm" />
          <span class="text-xl font-black tracking-tight font-display">Jarabag</span>
        </div>

        <!-- <nav
          :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'"
          class="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest"
        >
          <a href="#simulator" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Interactive Demo</a>
          <a href="#timeline-flow" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Escrow Lifecycle</a>
          <a href="#features" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Principles</a>
          <a href="#impact-stats" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Impact</a>
        </nav> -->

        <div class="flex items-center gap-4">
          <button
            @click="toggleMode"
            :class="isDark ? 'border-[#262321] hover:bg-[#1C1A18] text-[#FAF8F6]' : 'border-[#E7E3DF] hover:bg-[#EAE6E1] text-[#1E1A17]'"
            class="p-2.5 border rounded-xl transition-all cursor-pointer shadow-sm"
            title="Toggle theme mode"
          >
            <span v-if="isDark" class="text-sm">☀️</span>
            <span v-else class="text-sm">🌙</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-16 pb-24 md:pt-28 md:pb-36 max-w-5xl mx-auto px-6 z-20">
      <div class="grid md:grid-cols-12 gap-12 items-center">
        <!-- Hero Text -->
        <div class="md:col-span-7 flex flex-col items-start text-left">
          <div
            :class="isDark ? 'bg-[#E8621A]/10 border-[#E8621A]/20 text-[#E8621A]' : 'bg-[#E8621A]/5 border-[#E8621A]/15 text-[#E8621A]'"
            class="inline-flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 hero-fade-in"
          >
            🌱 Smart Food Rescue Mechanics
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 overflow-hidden">
            <span class="inline-block hero-word mr-3">Rescue</span>
            <span class="inline-block hero-word mr-3">fresh</span>
            <span class="inline-block hero-word mr-3 text-[#E8621A]">surplus.</span>
            <br />
            <span class="inline-block hero-word mr-3">Save</span>
            <span class="inline-block hero-word mr-3">funds.</span>
            <span class="inline-block hero-word text-[#E8621A]">Protect.</span>
          </h1>

          <p
            :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'"
            class="text-base leading-relaxed mb-8 max-w-lg hero-fade-in transition-colors"
          >
            Jarabag matches you with top-rated local eateries, bukas, and kitchens. Collect delicious surplus food boxes before closing and play your part in reducing landfill waste via our secure verification system.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto hero-fade-in">
            <button
              @click="triggerDownload('apple')"
              :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
              class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
              </svg>
              <div class="text-left leading-tight">
                <p class="text-[9px] opacity-75 font-normal tracking-wide uppercase">Download on the</p>
                <p class="text-xs font-black mt-0.5">App Store</p>
              </div>
            </button>
            <button
              @click="triggerDownload('google')"
              :class="isDark ? 'bg-white hover:bg-[#FAF8F6] text-[#090807]' : 'bg-[#1E1A17] hover:bg-[#090807] text-white'"
              class="flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M5,3.14L15.31,13.43L5,23.71C4.42,23.14 4.09,22.28 4.09,21.14V5.71C4.09,4.57 4.42,3.71 5,3.14M20.25,12.56L16.73,14.56L16.03,13.86L20.25,12.56M17.44,11.89L21.43,9.89C22.18,9.5 22.18,8.5 21.43,8.11L17.44,6.11C16.89,5.83 16.27,6.17 16.27,6.78V11.22C16.27,11.83 16.89,12.17 17.44,11.89M5.71,2.43L15.31,12L5.71,21.57C6.28,22.14 7.14,22.47 8.29,22.47C9.14,22.47 10.09,22.09 11.23,21.43L19.29,16.86L15.31,12L11.23,7.14L19.29,2.57L11.23,2C10.09,1.33 9.14,1 8.29,1C7.14,1 6.28,1.33 5.71,1.9M8.29,1.9H8.3C8.42,1.9 8.54,1.93 8.66,2L14.6,5.34L7.66,12.28L6.43,11.05C6.07,10.69 5.86,10.14 5.86,9.57C5.86,9 6.07,8.45 6.43,8.09L8.29,1.9Z" />
              </svg>
              <div class="text-left leading-tight">
                <p class="text-[9px] opacity-75 font-normal tracking-wide uppercase">Get it on</p>
                <p class="text-xs font-black mt-0.5">Google Play</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Interactive Map Visual Badge / Trigger -->
        <div class="md:col-span-5 flex justify-center hero-fade-in">
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-7 border rounded-3xl flex flex-col justify-center items-center text-center shadow-2xl w-full max-w-sm hover:scale-[1.02] transition-transform duration-300"
          >
            <div class="w-16 h-16 bg-[#E8621A]/10 text-3xl rounded-2xl flex items-center justify-center select-none">
              💚
            </div>
            <h3 class="text-base font-extrabold mt-4">Simulate Our Safe Flow</h3>
            <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs mt-2.5 leading-relaxed px-2">
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
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/80 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/80 backdrop-blur-sm'"
      class="py-24 relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center max-w-lg mx-auto mb-20">
          <h2 class="text-3xl font-extrabold tracking-tight font-display mb-3 text-[#E8621A]">Live Escrow Simulator</h2>
          <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm">Click the interactives inside the phone mockup below to test our cryptographic protection flow.</p>
        </div>

        <div class="grid lg:grid-cols-12 gap-12 items-center">
          <!-- Simulator App Mockup -->
          <div class="lg:col-span-6 flex justify-center relative">
            <!-- Confetti Canvas Container -->
            <div class="confetti-container absolute inset-0 pointer-events-none z-50 overflow-hidden max-w-[304px] h-[584px] mx-auto rounded-[40px]"></div>

            <div
              :class="isDark ? 'border-[#262321] bg-[#090807] shadow-orange-950/10' : 'border-[#E7E3DF] bg-[#FAF8F6] shadow-neutral-200'"
              class="relative w-[304px] h-[584px] border-4 rounded-[40px] shadow-2xl overflow-hidden transition-colors duration-500"
            >
              <!-- Smartphone Camera Notch -->
              <div :class="isDark ? 'bg-[#1C1A18]' : 'bg-[#EAE6E1]'" class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 rounded-b-xl z-40"></div>

              <!-- Screen Container -->
              <div
                :class="isDark ? 'bg-[#0E0D0C] text-[#FAF8F6]' : 'bg-white text-[#1E1A17]'"
                class="sim-screen p-5 pt-8 h-full flex flex-col justify-between transition-colors relative"
              >
                <!-- Lock graphic background panel -->
                <div v-if="activeStep === 2" class="push-notif absolute top-9 left-4 right-4 bg-[#E8621A] p-3 rounded-2xl shadow-xl z-30 flex items-center gap-3">
                  <span class="text-xl">🎉</span>
                  <div class="text-left text-white leading-tight">
                    <p class="text-[9px] font-bold uppercase tracking-wider opacity-90">Instant Reservation</p>
                    <p class="text-[11px] font-extrabold mt-0.5">Escrow Lock Confirmed!</p>
                  </div>
                </div>

                <!-- SCREEN 1: BROWSE MAP -->
                <div v-if="activeStep === 1" class="flex-1 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-4 border-b border-[#262321]/30 pb-2.5">
                      <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Rescue Map</span>
                      <span class="text-[11px] font-mono font-bold text-[#E8621A]">{{ formatCurrency(walletBalance) }}</span>
                    </div>

                    <!-- Stylized Vector Map Grid -->
                    <div
                      :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-[#FAF8F6]/80 border-[#E7E3DF]'"
                      class="h-60 rounded-2xl border relative overflow-hidden flex items-center justify-center select-none"
                    >
                      <!-- Abstract roads pattern -->
                      <div class="absolute inset-0 opacity-15">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" stroke-width="2" />
                          <line x1="80" y1="0" x2="80" y2="300" stroke="currentColor" stroke-width="2" />
                          <line x1="180" y1="0" x2="180" y2="300" stroke="currentColor" stroke-width="1.5" />
                          <circle cx="180" cy="80" r="4" fill="currentColor" />
                          <path d="M-20,180 Q100,100 320,180" fill="none" stroke="currentColor" stroke-width="2" />
                        </svg>
                      </div>

                      <!-- Sonar waves for pulsing pin -->
                      <button
                        @click="runStepTransition(2)"
                        class="absolute top-24 left-36 -translate-x-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <span class="absolute inline-flex h-10 w-10 rounded-full bg-[#E8621A]/30 animate-ping"></span>
                        <span class="absolute inline-flex h-6 w-6 rounded-full bg-[#E8621A]/50 animate-pulse"></span>
                        <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#E8621A] border-2 border-white shadow-lg"></span>
                      </button>
                    </div>

                    <div class="mt-5 text-left">
                      <p class="font-extrabold text-sm">Mama Titi Kitchen (Surplus)</p>
                      <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-[10px] mt-1.5 leading-relaxed">
                        Click the active orange pin on the radar map above to inspect listing details!
                      </p>
                    </div>
                  </div>

                  <button
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
                      <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">Escrow Lock</span>
                      <span class="text-[11px] font-mono font-bold text-red-500">{{ formatCurrency(walletBalance) }}</span>
                    </div>

                    <div class="space-y-4">
                      <!-- Padlock SVG closing animations -->
                      <div class="h-32 bg-[#E8621A]/5 rounded-2xl flex items-center justify-center border border-[#E8621A]/20 relative overflow-hidden">
                        <div class="lock-graphic text-5xl">🔒</div>
                      </div>

                      <div class="text-left">
                        <p class="font-extrabold text-sm">Party Jollof & Charcoal Chicken</p>
                        <p class="text-xs font-bold text-[#E8621A] mt-1.5">₦1,500 held in secure escrow</p>
                        <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-[10.5px] mt-2 leading-relaxed">
                          Your money is held in the platform escrow pool. The vendor receives no payment until you present the unique OTP upon delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
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
                      <span class="text-[10px] font-bold uppercase tracking-widest opacity-60">OTP Verification</span>
                      <span class="text-[11px] font-mono font-bold">{{ formatCurrency(walletBalance) }}</span>
                    </div>

                    <div class="space-y-5 text-center">
                      <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-[10.5px] leading-relaxed">
                        Show this rolling OTP code to the merchant at the pickup counter.
                      </p>

                      <!-- Slot-machine style rolling code widget -->
                      <div class="py-5 bg-[#E8621A]/10 border border-[#E8621A]/25 rounded-2xl relative overflow-hidden flex items-center justify-center gap-2">
                        <div v-for="(col, colIndex) in 4" :key="colIndex" class="w-10 h-12 overflow-hidden relative border border-[#E8621A]/20 bg-[#0E0D0C] rounded-lg flex items-center justify-center">
                          <div :id="`otp-col-${colIndex}`" class="absolute top-0 flex flex-col items-center">
                            <!-- Stack of digits 0 to 9 -->
                            <span v-for="digit in 10" :key="digit" class="h-12 flex items-center justify-center text-xl font-mono font-black text-[#E8621A]">
                              {{ digit - 1 }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="text-left text-[10px] space-y-2 border-t border-[#262321]/30 pt-4">
                        <p class="font-extrabold uppercase tracking-wider text-[#E8621A]">Pickup Instructions</p>
                        <p>1. Arrive at Mama Titi's within pickup times.</p>
                        <p>2. Share the 4-digit code with the clerk.</p>
                        <p>3. Wait for database verification confirm.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    @click="runStepTransition(4)"
                    class="w-full bg-[#181614] hover:bg-[#252220] border border-[#262321] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                  >
                    Simulate Vendor input
                  </button>
                </div>

                <!-- SCREEN 4: SUCCESS AND LEDGER DEPOSIT -->
                <div v-else-if="activeStep === 4" class="flex-1 flex flex-col justify-between">
                  <div class="text-center py-6 space-y-4">
                    <div class="success-check w-14 h-14 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-2xl rounded-full flex items-center justify-center mx-auto">
                      ✓
                    </div>
                    <div>
                      <h4 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-extrabold text-sm">Verification Success</h4>
                      <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-[10.5px] mt-2 px-3 leading-relaxed">
                        Funds released! ₦1,425 has been credited to the vendor wallet (5% platform commission deducted).
                      </p>
                    </div>
                  </div>

                  <div
                    :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-[#FAF8F6] border-[#E7E3DF]'"
                    class="p-4 rounded-xl border text-left"
                  >
                    <p class="text-[9px] uppercase tracking-wider font-extrabold opacity-60">Vendor Ledger Balance</p>
                    <p class="text-xl font-mono font-black text-[#10B981] mt-1">{{ formatCurrency(merchantEarnings) }}</p>
                  </div>

                  <button
                    @click="handleResetSimulator"
                    class="w-full bg-[#E8621A] hover:bg-[#CF5112] text-white rounded-xl py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer select-none"
                  >
                    Reset & Run Again
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline Timeline (Right Side Navigation) -->
          <div class="lg:col-span-6 space-y-5 text-left">
            <h3 class="text-2xl font-bold font-display leading-tight">Escrow-backed trust loop</h3>
            <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm leading-relaxed mb-6">
              Jarabag completely eliminates payment fraud by using safe automated locks. Funds move between users only after scanning the OTP code at the counter.
            </p>

            <div class="space-y-3.5">
              <!-- Step details triggers -->
              <div
                @click="runStepTransition(1)"
                :class="activeStep === 1 ? 'border-[#E8621A] bg-[#E8621A]/5 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 1 — Discover Deal</p>
                  <span v-if="activeStep === 1" class="text-xs">⚡</span>
                </div>
                <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs mt-1.5 leading-relaxed">
                  Browse geolocated listings on the interactive food map near your target coordinates.
                </p>
              </div>

              <div
                @click="runStepTransition(2)"
                :class="activeStep === 2 ? 'border-[#E8621A] bg-[#E8621A]/5 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 2 — Lock Escrow</p>
                  <span v-if="activeStep === 2" class="text-xs">⚡</span>
                </div>
                <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs mt-1.5 leading-relaxed">
                  Funds are secured safely in the platform escrow pool until handover code verification.
                </p>
              </div>

              <div
                @click="runStepTransition(3)"
                :class="activeStep === 3 ? 'border-[#E8621A] bg-[#E8621A]/5 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 3 — Retrieve Rolling OTP</p>
                  <span v-if="activeStep === 3" class="text-xs">⚡</span>
                </div>
                <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs mt-1.5 leading-relaxed">
                  A unique, secure claim verification OTP code rolls onto your device.
                </p>
              </div>

              <div
                @click="runStepTransition(4)"
                :class="activeStep === 4 ? 'border-[#E8621A] bg-[#E8621A]/5 shadow-sm' : (isDark ? 'border-[#1C1A18] hover:bg-[#12110F]' : 'border-[#E7E3DF] hover:bg-white')"
                class="p-4 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div class="flex items-center justify-between">
                  <p class="text-xs font-black text-[#E8621A] uppercase tracking-widest">Step 4 — Release & Verified</p>
                  <span v-if="activeStep === 4" class="text-xs">⚡</span>
                </div>
                <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs mt-1.5 leading-relaxed">
                  Merchant enters the OTP on terminal, releases escrow balance, and handles fresh pickup!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lifecycle Trace Map horizontal (ScrollTrigger animated line drawing) -->
    <section
      id="timeline-flow"
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]' : 'border-t border-[#E7E3DF] bg-white'"
      class="py-24 relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center max-w-lg mx-auto mb-16">
          <h2 class="text-3xl font-extrabold tracking-tight font-display mb-3">The Saved-Food Lifecycle</h2>
          <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm">Trace the path of a meal package from listing to escrow payoff.</p>
        </div>

        <!-- SVG horizontal tracing path container -->
        <div class="lifecycle-timeline relative w-full overflow-x-auto pb-8 scrollbar-hide">
          <div class="min-w-[700px] max-w-full relative h-36 flex flex-col justify-between">

            <!-- SVG Tracing line -->
            <div class="absolute inset-0 top-10 pointer-events-none select-none">
              <svg class="w-full h-10 overflow-visible" viewBox="0 0 700 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Base path background gray -->
                <path d="M 50,20 L 650,20" :stroke="isDark ? '#262321' : '#E7E3DF'" stroke-width="4" stroke-linecap="round" />
                <!-- Active path tracing orange -->
                <path id="timeline-path" d="M 50,20 L 650,20" stroke="#E8621A" stroke-width="4" stroke-linecap="round" stroke-dasharray="600" stroke-dashoffset="600" />
              </svg>
            </div>

            <!-- Nodes overlapping the line -->
            <div class="flex justify-between items-center z-10 px-12 relative top-2">
              <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none">
                  🍲
                </div>
                <p class="text-[10px] font-black uppercase tracking-wider mt-3">1. Listing</p>
                <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] mt-0.5 leading-snug">Kitchen posts excess</p>
              </div>

              <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none">
                  🔒
                </div>
                <p class="text-[10px] font-black uppercase tracking-wider mt-3">2. Lock</p>
                <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] mt-0.5 leading-snug">Escrow hold funds</p>
              </div>

              <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none">
                  🔐
                </div>
                <p class="text-[10px] font-black uppercase tracking-wider mt-3">3. Code</p>
                <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] mt-0.5 leading-snug">Pickup OTP rolls</p>
              </div>

              <div class="lifecycle-step-node flex flex-col items-center w-24 text-center">
                <div :class="isDark ? 'bg-[#181614] border-[#262321] text-white shadow-xl' : 'bg-[#FAF8F6] border-[#E7E3DF] text-[#1E1A17] shadow-md'" class="w-16 h-16 rounded-full border flex items-center justify-center text-xl font-bold font-display select-none">
                  💳
                </div>
                <p class="text-[10px] font-black uppercase tracking-wider mt-3">4. Release</p>
                <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] mt-0.5 leading-snug">Payoff releases</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- Core Values Section (Cards Float Hover Animations) -->
    <section
      id="features"
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]'"
      class="py-24 transition-colors duration-500 relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6">
        <div class="text-center max-w-lg mx-auto mb-16">
          <h2 class="text-3xl font-extrabold tracking-tight font-display mb-3 text-[#E8621A]">Core Platform Principles</h2>
          <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm">We combine sustainable food economics with modern security.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
            class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
          >
            <div>
              <span class="text-4xl select-none">🍲</span>
              <h3 class="text-base font-extrabold mt-5 mb-2.5">Zero Food Waste</h3>
              <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs leading-relaxed">
                Clear fresh surplus inventory from local kitchens daily. Provide safe, warm portions at massive savings.
              </p>
            </div>
          </div>

          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
            class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
          >
            <div>
              <span class="text-4xl select-none">🛡️</span>
              <h3 class="text-base font-extrabold mt-5 mb-2.5">Secure Escrow Lock</h3>
              <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs leading-relaxed">
                Payments are held inside the platform lock pool. Escrow releases balance exclusively when claim code matches database.
              </p>
            </div>
          </div>

          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321] hover:border-[#E8621A]/30' : 'bg-white border-[#E7E3DF] hover:border-[#E8621A]/30'"
            class="p-8 border rounded-3xl transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
          >
            <div>
              <span class="text-4xl select-none">🌍</span>
              <h3 class="text-base font-extrabold mt-5 mb-2.5">Environmental Recovery</h3>
              <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-xs leading-relaxed">
                Stop organic inventory from decomposing inside local landfills, dramatically lowering methane emissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Stats Counters Section -->
    <section
      id="impact-stats"
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#0E0D0C]/80 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/80 backdrop-blur-sm'"
      class="py-20 transition-colors duration-500 relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center select-none">
        <div>
          <p id="stat-bags" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
          <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] uppercase tracking-widest mt-2.5 font-bold">Surplus Bags Saved</p>
        </div>
        <div>
          <p id="stat-savings" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
          <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] uppercase tracking-widest mt-2.5 font-bold">Customer Savings</p>
        </div>
        <div>
          <p id="stat-co2" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
          <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] uppercase tracking-widest mt-2.5 font-bold">CO₂ Emissions Prevented</p>
        </div>
        <div>
          <p id="stat-bukas" class="text-4xl md:text-5xl font-black text-[#E8621A] font-display">0</p>
          <p :class="isDark ? 'text-neutral-500' : 'text-neutral-600'" class="text-[9px] uppercase tracking-widest mt-2.5 font-bold">Registered Kitchens</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/80 backdrop-blur-sm' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/80 backdrop-blur-sm'"
      class="py-12 text-xs text-[#A09A95] transition-colors relative z-20"
    >
      <div class="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2.5 select-none">
          <img src="/jarabag-icon.svg" alt="Jarabag Logo" class="w-7 h-7 object-contain" />
          <span :class="isDark ? 'text-white' : 'text-neutral-900'" class="font-extrabold tracking-tight">Jarabag</span>
        </div>

        <div class="flex gap-6 text-[#A09A95] font-bold">
          <router-link to="/privacy" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Privacy Policy</router-link>
          <router-link to="/terms" :class="isDark ? 'hover:text-white' : 'hover:text-neutral-900'" class="transition-colors">Terms of Service</router-link>
        </div>

        <p>&copy; 2026 Jarabag. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Custom animations & keyframes */
.toast-alert-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-alert-leave-active {
  animation: toast-out 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toast-in {
  from {
    transform: translateY(1.5rem) scale(0.95);
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
    transform: translateY(1.5rem) scale(0.95);
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
