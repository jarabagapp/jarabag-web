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
    :class="isDark ? 'bg-[#090807] text-[#FAF8F6]' : 'bg-[#FAF8F6] text-[#1E1A17]'"
    class="min-h-screen font-sans transition-colors duration-500 pb-24"
  >
    <!-- Header -->
    <header
      :class="isDark ? 'border-b border-[#1A1816] bg-[#090807]/80' : 'border-b border-[#E7E3DF] bg-[#FAF8F6]/80'"
      class="backdrop-blur-md sticky top-0 z-50 transition-colors duration-500"
    >
      <div class="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <img src="/jarabag-icon.svg" alt="Jarabag Logo" class="w-8 h-8 object-contain drop-shadow-sm" />
          <span :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-lg font-bold">Jarabag</span>
        </router-link>
        <div class="flex items-center gap-4">
          <button
            @click="toggleMode"
            :class="isDark ? 'border-[#262321] hover:bg-[#1C1A18] text-[#FAF8F6]' : 'border-[#E7E3DF] hover:bg-[#EAE6E1] text-[#1E1A17]'"
            class="p-2 border rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center w-9 h-9"
            title="Toggle theme mode"
          >
            <span v-if="isDark" class="text-sm">☀️</span>
            <span v-else class="text-sm">🌙</span>
          </button>
          <router-link
            to="/"
            :class="isDark ? 'text-[#A09A95] hover:text-white' : 'text-[#6C6661] hover:text-neutral-900'"
            class="text-sm font-medium transition-colors"
          >
            Back to Home
          </router-link>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-6 pt-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8621A]/10 border border-[#E8621A]/20 text-[#E8621A] text-xs font-semibold mb-4">
        <span>🛡️ Legal & Data Protection</span>
      </div>
      <h1 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-4xl font-extrabold font-display mb-2">Privacy Policy</h1>
      <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm mb-10">Last updated: August 6, 2026 • Effective Date: August 6, 2026</p>

      <div class="space-y-10 leading-relaxed">
        <section
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-2xl p-6 shadow-sm transition-colors duration-500"
        >
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-3 flex items-center gap-2">
            <span>1. Overview & Commitment</span>
          </h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed">
            Jarabag ("we", "our", or "us") operates the Jarabag mobile application and website. We are committed to protecting your personal data, respecting your privacy rights, and maintaining transparency regarding how information is collected, processed, and safeguarded under applicable data protection regulations.
          </p>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">2. Information We Collect</h2>
          <div class="space-y-4 text-sm">
            <div
              :class="isDark ? 'bg-[#12110F]/60 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-semibold mb-1">A. Personal Identification Data</h3>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Name, email address, phone number, role preference (consumer or vendor), and encrypted credentials (hashed passwords and auth tokens).</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/60 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-semibold mb-1">B. Location & Geofencing Data</h3>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Foreground GPS location data (to show nearby surplus food listings) and background location data (to dispatch proximity notifications when surplus food bags become available near your location).</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/60 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-semibold mb-1">C. Financial & Transaction Data</h3>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Wallet balances, transaction history, deposit references, bank account verification details (account number, bank code), and Paystack payment gateway metadata.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F]/60 border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl shadow-sm transition-colors"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-semibold mb-1">D. Device & Usage Technical Data</h3>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Push notification tokens (Expo tokens), device IP addresses, browser user agents, operating system version, and app interaction logs.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">3. Background Location Access & Usage</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm mb-4">
            Jarabag requires background location access to provide our core surplus food rescue feature: alerting consumers about nearby discounted food bags that are nearing expiry before they go to waste.
          </p>
          <ul :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="list-disc list-inside space-y-2 text-sm pl-2">
            <li>Location data is used solely to compute distance to nearby vendors and trigger vicinity alerts.</li>
            <li>We do not track continuous movement history or sell location data to third-party advertisers.</li>
            <li>You can adjust or revoke location permissions at any time via your mobile device settings.</li>
          </ul>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">4. Data Sharing & Third Parties</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm mb-4">
            We do not sell, rent, or trade your personal data. Data is shared strictly with trusted service providers required to operate Jarabag:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors"
            >
              <span class="font-bold text-[#E8621A] block mb-1">Paystack</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Processes card deposits, wallet funding, and bank verification in compliance with PCI-DSS standards.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors"
            >
              <span class="font-bold text-[#E8621A] block mb-1">Expo / Firebase</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Dispatches push notifications and vicinity alert messages to your mobile device.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors"
            >
              <span class="font-bold text-[#E8621A] block mb-1">Cloudinary</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Hosts food listing photos and profile images uploaded by vendors and consumers.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors"
            >
              <span class="font-bold text-[#E8621A] block mb-1">Food Vendors & Consumers</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Order pickup details (OTP code and order ID) are shared between buyer and seller to verify pickup.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">5. Data Retention & Account Deletion</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm mb-4">
            We retain your data for as long as your account remains active. You have the right to request full account deletion and personal data purging at any time:
          </p>
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-5 border rounded-xl text-sm transition-colors"
          >
            <p :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-semibold mb-2">How to Request Account Deletion:</p>
            <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-xs mb-3">1. Send an email from your registered email address to <a href="mailto:support@jarabagapp.com" class="text-[#E8621A] underline">support@jarabagapp.com</a> with the subject "Account Deletion Request".</p>
            <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-xs">2. Alternatively, navigate to Profile Settings → Delete Account inside the Jarabag mobile application.</p>
            <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-[11px] mt-3">Upon verification, your personal data and wallet records will be permanently purged within 14 business days, except where financial retention laws require mandatory audit archiving.</p>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">6. Security Safeguards</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm">
            All data transmissions are encrypted using SSL/TLS 1.3 encryption. Passwords and sensitive authentication tokens are hashed using bcrypt and stored in encrypted storage hardware (iOS Keychain & Android Keystore).
          </p>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">7. Contact Us</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm">
            If you have questions, concerns, or data protection inquiries regarding this Privacy Policy, please contact our Data Protection Officer at:
          </p>
          <p class="text-[#E8621A] font-semibold text-sm mt-2">Email: support@jarabagapp.com</p>
        </section>
      </div>
    </main>
  </div>
</template>
