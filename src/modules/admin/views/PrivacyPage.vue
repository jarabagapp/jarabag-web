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
    <!-- Skip to main content link for keyboard accessibility -->
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
        <span aria-hidden="true">🛡️</span>
        <span>Legal &amp; Data Protection</span>
      </div>

      <h1 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-4xl sm:text-5xl font-extrabold font-display mb-2">
        Privacy Policy
      </h1>
      <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'" class="text-sm font-medium mb-10">
        Last updated: August 18, 2026 • Effective Date: August 18, 2026
      </p>

      <div class="space-y-10 leading-relaxed">
        <section
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-500"
          aria-labelledby="heading-overview"
        >
          <h2 id="heading-overview" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-3">
            1. Overview &amp; Commitment
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            Jarabag Technologies Limited ("we", "our", or "us") operates the Jarabag mobile application and website (<a href="https://jarabagapp.com" :class="isDark ? 'text-[#FFA666]' : 'text-[#C2410C]'" class="underline font-semibold">jarabagapp.com</a>). We are committed to protecting your personal data, respecting your privacy rights, and maintaining complete transparency regarding how information is collected, processed, and safeguarded under the Nigeria Data Protection Regulation (NDPR) and international privacy frameworks.
          </p>
        </section>

        <section aria-labelledby="heading-collected-info">
          <h2 id="heading-collected-info" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            2. Information We Collect
          </h2>
          <div class="space-y-4 text-sm sm:text-base">
            <div
              :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-base mb-1.5">
                A. Personal Identification Data
              </h3>
              <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'">
                Name, email address, verified phone number, role preference (consumer or vendor), and secure credentials (hashed tokens and bcrypt-encrypted passwords).
              </p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-base mb-1.5">
                B. Location &amp; Geofencing Data
              </h3>
              <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'">
                Foreground GPS coordinates (to display geolocated food deals near your location) and background location access (to dispatch vicinity notifications when food deals drop in your target radius).
              </p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-base mb-1.5">
                C. Financial &amp; Transaction Data
              </h3>
              <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'">
                In-app wallet balances, ledger transaction logs, payment references, bank account verification details (NUBAN account numbers and bank codes), and PCI-DSS payment partner logs.
              </p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/80 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-base mb-1.5">
                D. Device &amp; Usage Technical Data
              </h3>
              <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'">
                Push notification tokens (Expo / Firebase tokens), device IP addresses, browser user agent strings, operating system versions, and app diagnostic interaction logs.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="heading-bg-location">
          <h2 id="heading-bg-location" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            3. Background Location Access &amp; Usage
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4 leading-relaxed">
            Jarabag requires location permissions to deliver our essential surplus food rescue feature: alerting consumers when nearby partner kitchens have surplus bags available before closing hours.
          </p>
          <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-2 text-sm sm:text-base pl-2">
            <li>Location data is utilized exclusively to compute distances to verified vendor listings and dispatch proximity push alerts.</li>
            <li>We do not record continuous historical location trails, nor do we sell location coordinates to third-party ad networks.</li>
            <li>You can adjust or revoke location permissions at any time via your mobile operating system settings.</li>
          </ul>
        </section>

        <section aria-labelledby="heading-data-sharing">
          <h2 id="heading-data-sharing" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            4. Data Sharing &amp; Third Parties
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4">
            We never sell, rent, or monetize your personal information. Data is shared exclusively with certified infrastructure partners necessary to operate the Jarabag platform:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base mb-1.5">Paystack</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">Processes card deposits, wallet funding, and bank verification in strict compliance with PCI-DSS Level 1 standards.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base mb-1.5">Expo / Firebase</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">Dispatches push notifications, order status changes, and vicinity alert messages directly to your mobile device.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base mb-1.5">Cloudinary</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">Securely stores food listing photos and store profile imagery uploaded by vendors and food creators.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base mb-1.5">Vendors &amp; Consumers</h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">Pickup details (order code and 4-digit claim OTP) are securely shared between buyer and seller to authorize handover.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="heading-retention">
          <h2 id="heading-retention" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            5. Data Retention &amp; Account Deletion
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4 leading-relaxed">
            We retain account data for as long as your Jarabag account remains active. You possess the legal right to request full account deletion and personal data erasure at any time:
          </p>
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-6 border rounded-xl text-sm sm:text-base transition-colors shadow-sm"
          >
            <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-base mb-2">
              How to Request Account &amp; Data Deletion:
            </h3>
            <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm mb-3">
              1. Email our privacy compliance desk from your registered email address at
              <a href="mailto:support@jarabagapp.com" :class="isDark ? 'text-[#FFA666]' : 'text-[#C2410C]'" class="underline font-bold">support@jarabagapp.com</a>
              with the subject line "Account Deletion Request".
            </p>
            <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm mb-3">
              2. Alternatively, go to Profile Settings &rarr; Delete Account directly inside the Jarabag mobile application.
            </p>
            <p :class="isDark ? 'border-[#262321] text-[#A8A29E]' : 'border-neutral-200 text-[#544E49]'" class="text-xs sm:text-sm mt-3 pt-3 border-t">
              Upon request receipt and identity confirmation, all personal identification records will be permanently purged within 14 business days, except where mandatory financial auditing regulations require statutory record retention.
            </p>
          </div>
        </section>

        <section aria-labelledby="heading-security">
          <h2 id="heading-security" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            6. Security Safeguards
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            All data in transit is encrypted using modern TLS 1.3 cryptographic protocols. User authentication tokens and passwords are salted and hashed using industry-standard bcrypt. On mobile clients, sensitive session keys are stored in encrypted hardware keystores (iOS Keychain &amp; Android KeyStore).
          </p>
        </section>

        <section aria-labelledby="heading-contact">
          <h2 id="heading-contact" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            7. Contact Our Data Protection Team
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base">
            For inquiries, legal notices, or data protection subject access requests regarding this Privacy Policy, please contact our Data Protection Officer:
          </p>
          <p class="font-bold text-base mt-2">
            Jarabag Technologies Limited
          </p>
          <p class="font-bold text-base mt-1">
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
            :class="isDark ? 'text-white font-bold' : 'text-[#110E0D] font-bold'"
            class="transition-colors underline"
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
