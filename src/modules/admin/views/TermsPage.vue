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
        <router-link to="/" class="flex items-center">
          <img src="/jarabag-full-logo.svg" alt="Jarabag Logo" class="h-8 md:h-11 w-auto object-contain drop-shadow-sm" />
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
        <span>📜 Terms & Service Agreement</span>
      </div>
      <h1 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-4xl font-extrabold font-display mb-2">Terms of Service</h1>
      <p :class="isDark ? 'text-[#A09A95]' : 'text-[#6C6661]'" class="text-sm mb-10">Last updated: August 6, 2026 • Effective Date: August 6, 2026</p>

      <div class="space-y-10 leading-relaxed">
        <section
          :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
          class="border rounded-2xl p-6 shadow-sm transition-colors duration-500"
        >
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-3">1. Agreement to Terms</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed">
            By accessing or using the Jarabag mobile application or website, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must immediately cease accessing or using our services.
          </p>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">2. Description of Marketplace Service</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed mb-4">
            Jarabag operates a surplus food rescue marketplace connecting verified food vendors (restaurants, bakeries, bukas, supermarkets) selling surplus food items at discounted prices with consumers interested in purchasing them before expiry.
          </p>
          <ul :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="list-disc list-inside space-y-2 text-sm pl-2">
            <li>Jarabag acts as an intermediary marketplace facilitator, providing digital ordering, location discovery, escrow settlement, and dispute handling.</li>
            <li>Vendors remain independent sellers responsible for preparing wholesome, safe, and accurately labeled surplus food bags.</li>
          </ul>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">3. User Accounts & Responsibilities</h2>
          <div :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="space-y-3 text-sm">
            <p>• You must be at least 18 years old or possess legal parental/guardian consent to create an account.</p>
            <p>• You are responsible for keeping your account login credentials, OTP codes, and wallet access pins secure.</p>
            <p>• Vendors must maintain active business verification, accurate store addresses, and valid health/hygiene standards.</p>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">4. Wallet, Payments & Escrow Settlement</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed mb-4">
            Financial transactions on Jarabag are processed via integrated payment partners (Paystack):
          </p>
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-5 border rounded-xl space-y-3 text-xs shadow-sm transition-colors"
          >
            <p><strong class="text-[#E8621A]">Escrow Hold:</strong> When a consumer reserves a surplus food bag, the funds are debited from their wallet and held in secure platform escrow.</p>
            <p><strong class="text-[#E8621A]">OTP Release:</strong> Funds are released from escrow to the vendor's wallet only after the consumer presents their 4-digit pickup OTP to the vendor at pickup.</p>
            <p><strong class="text-[#E8621A]">Withdrawals:</strong> Vendors can request wallet payouts to verified bank accounts at any time, subject to standard banking processing windows.</p>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">5. Cancellation & No-Show Policy</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm mb-4">
            To ensure fairness for both buyers and sellers, Jarabag enforces standard cancellation & no-show policies:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors shadow-sm"
            >
              <span :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold block mb-1">Consumer Cancellations</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">Cancellations made well before the pickup window start time receive a full wallet refund. Late cancellations incur a standard split fee.</p>
            </div>
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-4 border rounded-xl transition-colors shadow-sm"
            >
              <span :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold block mb-1">No-Show & Forfeitures</span>
              <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'">If a consumer fails to pick up their reserved bag during the pickup window, the escrow is processed according to first vs repeat no-show policy rules.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">6. Disputes & Refund Claims</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed mb-4">
            If a bag is missing, severely compromised, or the vendor is closed during pickup, the consumer can raise a dispute in the app. Jarabag superadmin team will investigate and issue wallet refunds where vendor fault is verified.
          </p>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">7. Limitation of Liability</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm leading-relaxed">
            Jarabag provides the marketplace platform on an "as-is" basis. Vendors are solely responsible for food preparation, hygiene standards, and item freshness. To the maximum extent permitted by law, Jarabag shall not be liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">8. Contact Information</h2>
          <p :class="isDark ? 'text-[#C5BEB9]' : 'text-[#5C5753]'" class="text-sm">
            For questions regarding these Terms of Service or legal inquiries, please contact:
          </p>
          <p class="text-[#E8621A] font-semibold text-sm mt-2">Email: support@jarabagapp.com</p>
        </section>
      </div>
    </main>
  </div>
</template>
