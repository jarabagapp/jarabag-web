<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleMode = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  if (typeof window !== 'undefined') {
    localStorage.setItem('jarabag_theme', isDark.value ? 'dark' : 'light')
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
})
</script>

<template>
  <div
    :class="isDark ? 'bg-[#090807] text-[#FAF8F6]' : 'bg-[#FAF8F6] text-[#26201B]'"
    class="min-h-screen font-sans transition-colors duration-500 pb-16"
  >
    <!-- Skip link for keyboard accessibility -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#E8621A] focus:text-white focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>

    <!-- Header Landmark -->
    <header
      role="banner"
      :class="isDark ? 'border-b border-[#1A1816] bg-[#090807]/90' : 'border-b border-[#E7E3DF] bg-[#FAF8F6]/90'"
      class="backdrop-blur-md sticky top-0 z-50 transition-colors duration-500"
    >
      <div class="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center" aria-label="Jarabag Home">
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
            class="p-2 border rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center w-10 h-10 min-w-[40px] min-h-[40px]"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDark"
          >
            <span v-if="isDark" aria-hidden="true" class="text-sm">☀️</span>
            <span v-else aria-hidden="true" class="text-sm">🌙</span>
          </button>
          <router-link
            to="/"
            :class="isDark ? 'text-[#D1CBC7] hover:text-white' : 'text-[#544E49] hover:text-[#110E0D]'"
            class="text-sm font-semibold transition-colors px-2 py-1"
          >
            Back to Home
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Landmark -->
    <main id="main-content" role="main" class="max-w-4xl mx-auto px-6 pt-16">
      <div
        :class="isDark ? 'bg-[#E8621A]/15 border-[#E8621A]/30 text-[#FFA666]' : 'bg-[#FFF7ED] border-[#FDBA74] text-[#9A3412]'"
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-4"
      >
        <span aria-hidden="true">📜</span>
        <span>Terms &amp; Service Agreement</span>
      </div>

      <h1 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-4xl sm:text-5xl font-extrabold font-display mb-2">
        Terms of Service
      </h1>
      <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm font-medium mb-10">
        Last updated: August 18, 2026 • Effective Date: August 18, 2026
      </p>

      <div class="space-y-10 leading-relaxed">
        <section
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-500"
          aria-labelledby="heading-agreement"
        >
          <h2 id="heading-agreement" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-3">
            1. Agreement to Terms
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            By downloading, accessing, or utilizing the Jarabag mobile application or website (<a href="https://jarabagapp.com" :class="isDark ? 'text-[#FFA666]' : 'text-[#C2410C]'" class="underline font-semibold">jarabagapp.com</a>), you explicitly agree to be bound by these Terms of Service ("Terms"). If you do not agree to all terms stated herein, you must immediately cease accessing or using our platform.
          </p>
        </section>

        <section aria-labelledby="heading-marketplace">
          <h2 id="heading-marketplace" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            2. Description of Marketplace Service
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed mb-4">
            Jarabag operates a specialized surplus food recovery marketplace connecting verified food vendors (restaurants, bakeries, bukas, and supermarkets) offering delicious surplus food items at 50% to 70% discounts with consumers seeking affordable food solutions.
          </p>
          <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-2 text-sm sm:text-base pl-2">
            <li>Jarabag acts as an intermediary technology platform facilitating listing discovery, digital orders, cryptographic escrow settlement, and customer support.</li>
            <li>Partner vendors operate as independent food businesses and retain full responsibility for preparing wholesome, safe, and hygienic food packages.</li>
          </ul>
        </section>

        <section aria-labelledby="heading-user-accounts">
          <h2 id="heading-user-accounts" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            3. User Accounts &amp; Platform Responsibilities
          </h2>
          <div :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="space-y-3 text-sm sm:text-base">
            <p>&bull; Users must be at least 18 years of age or possess legal guardian consent to register an account.</p>
            <p>&bull; You are strictly responsible for maintaining confidentiality over your wallet PINs, login credentials, and 4-digit pickup OTP codes.</p>
            <p>&bull; Registered vendors must maintain accurate physical store addresses, adhere to state hygiene regulations, and update surplus inventory truthfully.</p>
          </div>
        </section>

        <section aria-labelledby="heading-escrow">
          <h2 id="heading-escrow" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            4. Wallet, Payments &amp; Escrow Settlement
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed mb-4">
            All financial operations on Jarabag are protected by our automated platform escrow framework:
          </p>
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-6 border rounded-xl space-y-4 text-xs sm:text-sm shadow-sm transition-colors"
          >
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">1. Automated Escrow Hold:</strong>
              When a consumer reserves a surplus food bag, the payment amount is debited from their wallet and locked securely in the escrow pool.
            </p>
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">2. Cryptographic OTP Handover:</strong>
              Funds are only released from escrow to the vendor's wallet balance after the consumer physically presents the rolling 4-digit verification code at pickup.
            </p>
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">3. Vendor Payouts:</strong>
              Vendors can withdraw their verified balances to local Nigerian commercial bank accounts at any time, processed via accredited payment partners.
            </p>
          </div>
        </section>

        <section aria-labelledby="heading-cancellation">
          <h2 id="heading-cancellation" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            5. Cancellation &amp; No-Show Policy
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4">
            To guarantee fairness and prevent unnecessary food spoilage, Jarabag enforces standard dispute and cancellation rules:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base mb-1.5">
                Consumer Cancellations
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                Cancellations made before the vendor's preparation cutoff time receive a full 100% wallet refund. Late cancellations after packaging may incur standard split compensation.
              </p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base mb-1.5">
                No-Show &amp; Forfeitures
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                If a consumer fails to collect a reserved bag during the agreed pickup window without prior notice, escrow is settled according to our platform no-show policy.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="heading-disputes">
          <h2 id="heading-disputes" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            6. Disputes &amp; Quality Resolution
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            If a food bag is unavailable, substantially mismatched, or the merchant is closed during the official pickup window, consumers can submit a one-tap dispute via the mobile application. Our support team investigates within 2 hours and issues instant wallet credits upon vendor fault confirmation.
          </p>
        </section>

        <section aria-labelledby="heading-liability">
          <h2 id="heading-liability" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            7. Limitation of Liability
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            Jarabag provides marketplace matching services on an "as is" and "as available" basis. While we verify partner merchants, food preparation and health standards remain the sole responsibility of individual kitchen operators. To the extent permissible by applicable law, Jarabag disclaims liability for indirect damages.
          </p>
        </section>

        <section aria-labelledby="heading-contact-terms">
          <h2 id="heading-contact-terms" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            8. Contact &amp; Legal Notices
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base">
            For inquiries regarding our Terms of Service, merchant partnership agreements, or legal communications, reach out to:
          </p>
          <p class="font-bold text-base mt-2">
            Email: <a href="mailto:support@jarabagapp.com" :class="isDark ? 'text-[#FFA666]' : 'text-[#C2410C]'" class="underline">support@jarabagapp.com</a>
          </p>
        </section>
      </div>
    </main>

    <!-- Footer Landmark -->
    <footer
      role="contentinfo"
      :class="isDark ? 'border-t border-[#1C1A18] bg-[#090807]/90' : 'border-t border-[#E7E3DF] bg-[#FAF8F6]/90'"
      class="mt-20 py-12 text-sm transition-colors"
    >
      <div class="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <router-link to="/" class="flex items-center" aria-label="Jarabag Home">
          <img
            src="/jarabag-full-logo.svg"
            alt="Jarabag Logo"
            width="140"
            height="36"
            class="h-7 md:h-9 w-auto object-contain"
          />
        </router-link>

        <nav aria-label="Footer Legal Navigation" class="flex gap-6 font-semibold">
          <router-link
            to="/privacy"
            :class="isDark ? 'text-[#D1CBC7] hover:text-white' : 'text-[#544E49] hover:text-[#110E0D]'"
            class="transition-colors"
          >
            Privacy Policy
          </router-link>
          <router-link
            to="/terms"
            :class="isDark ? 'text-white font-bold' : 'text-[#110E0D] font-bold'"
            class="transition-colors underline"
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
