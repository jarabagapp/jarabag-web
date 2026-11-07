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
            By downloading, accessing, or utilizing the Jarabag mobile application or website (<a href="https://jarabagapp.com" :class="isDark ? 'text-[#FFA666]' : 'text-[#C2410C]'" class="underline font-semibold">jarabagapp.com</a>), operated by Jarabag Technologies Limited ("Company", "we", "our", or "us"), you explicitly agree to be bound by these Terms of Service ("Terms"). If you do not agree to all terms stated herein, you must immediately cease accessing or using our platform.
          </p>
        </section>

        <section aria-labelledby="heading-marketplace">
          <h2 id="heading-marketplace" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            2. Description of Marketplace Service
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed mb-4">
            Jarabag Technologies Limited operates a digital food marketplace connecting food sellers (home cooks, student chefs, restaurants, bakeries, and bukas) offering meals and food deals at discounted rates with consumers seeking affordable food solutions.
          </p>
          <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-2 text-sm sm:text-base pl-2">
            <li>Jarabag Technologies Limited acts as an intermediary technology platform facilitating listing discovery, digital meal reservations, 4-digit pickup code verification, automated vendor settlement, and customer support.</li>
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
            <p>&bull; Registered vendors must maintain accurate physical store addresses, adhere to state hygiene regulations, and update food deal inventory truthfully.</p>
          </div>
        </section>

        <section aria-labelledby="heading-settlement">
          <h2 id="heading-settlement" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            4. Order Payments, Pickup Verification &amp; Vendor Settlement
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed mb-4">
            All order transactions and vendor settlements on Jarabag operate through a direct, automated settlement workflow:
          </p>
          <div
            :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
            class="p-6 border rounded-xl space-y-4 text-xs sm:text-sm shadow-sm transition-colors"
          >
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">1. Pre-Paid Order Reservation:</strong>
              When a consumer reserves a food deal, payment is processed upfront via Paystack or their in-app wallet (and optional Jara Coins rewards, where 1 Jara Coin = ₦1) to confirm the meal reservation for the stipulated pickup window.
            </p>
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">2. 4-Digit Pickup Verification &amp; Immediate 95% Vendor Settlement:</strong>
              Upon arriving at the vendor's store during the pickup window, the consumer presents their 4-digit pickup verification code to confirm collection. Immediately upon code verification, <strong>95% of the order amount</strong> is automatically credited to the vendor's balance in real time (with a <strong>5% platform commission</strong> deducted), with no additional conditions or settlement delay.
            </p>
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">3. Consumer Cashback Rewards (Jara Coins):</strong>
              On every completed pickup, consumers automatically earn <strong>2.5% cashback</strong> in Jara Coins (minimum 5 coins, capped at ₦250 per order), or <strong>5.0% cashback</strong> (minimum 10 coins, capped at ₦1,000 per order) for active Jara Pass VIP subscribers.
            </p>
            <p>
              <strong class="text-[#E8621A] text-sm block mb-1">4. Direct Bank Payouts:</strong>
              Vendors can initiate automated bank transfers of their full settled earnings directly to their verified Nigerian commercial bank accounts at any time via Paystack Transfers (standard Paystack transfer fees apply: ₦10 for transfers &le; ₦5,000; ₦25 for ₦5,001–₦50,000; ₦50 above ₦50,000), with no minimum balance lock or holding period.
            </p>
          </div>
        </section>

        <section aria-labelledby="heading-cancellation">
          <h2 id="heading-cancellation" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            5. Cancellation, No-Show &amp; Compensation Policy
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4">
            Because listings on Jarabag are perishable prepared meals with fixed pickup windows, our platform automatically executes the following refund and compensation splits so that no order payment ever remains unsettled:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base">
                A. Early Consumer Cancellation (&gt; 30 Mins Before Window)
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                If a consumer cancels more than 30 minutes before the pickup window starts:
              </p>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1">
                <li><strong>Consumer Refund:</strong> <strong>100% full refund</strong> of cash and Jara Coins credited automatically.</li>
                <li><strong>Vendor Impact:</strong> Meal portion is automatically restored to available inventory. No penalty to either party.</li>
              </ul>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base">
                B. Late Consumer Cancellation (0–30 Mins Before Window)
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                If a consumer cancels within 30 minutes of the pickup window start (after meal packaging has begun):
              </p>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1">
                <li><strong>Consumer Refund:</strong> <strong>50%</strong> automatic refund (cash and Jara Coins).</li>
                <li><strong>Vendor Compensation:</strong> <strong>40%</strong> settled automatically to the vendor for packaging/preparation costs.</li>
                <li><strong>Platform Fee:</strong> <strong>10%</strong> processing share.</li>
              </ul>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base">
                C. Consumer No-Show or Uncollected Order
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                If a consumer cancels after the pickup window opens, or fails to show up / provide the 4-digit pickup code within the pickup window (plus a <strong>15-minute grace period</strong>) for a prepared order:
              </p>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1">
                <li><strong>First-Time No-Show (Forgiveness Split):</strong> <strong>50%</strong> refunded to consumer, <strong>40%</strong> settled to vendor, <strong>10%</strong> platform fee.</li>
                <li><strong>Repeat No-Shows (within 30 days):</strong> <strong>70%</strong> settled automatically to the vendor, <strong>5%</strong> refunded to consumer, <strong>25%</strong> platform fee.</li>
              </ul>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="font-bold text-sm sm:text-base">
                D. Vendor Cancellation or Failure to Fulfill
              </h3>
              <p :class="isDark ? 'text-[#D1CBC7]' : 'text-[#544E49]'">
                If a vendor cancels a confirmed order, fails to prepare the order before the pickup window ends, or is closed during pickup:
              </p>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1">
                <li><strong>Consumer Refund:</strong> <strong>100% full refund</strong> of the order amount (cash and Jara Coins).</li>
                <li><strong>Consumer Goodwill Bonus:</strong> Additional <strong>50 non-withdrawable Jara Coins</strong> automatically credited to the consumer's loyalty balance for use as a discount on their next order.</li>
                <li><strong>Pre-Order Batch Exception:</strong> If a crowdfunded batch listing does not reach its minimum order goal by pickup start, consumers receive a <strong>100% refund</strong> with <strong>zero vendor penalty</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="heading-penalties">
          <h2 id="heading-penalties" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            6. Platform Accountability &amp; Penalty Policy
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base mb-4">
            To protect both buyers and sellers from repeated no-shows or unfulfilled orders, Jarabag enforces automated strike and suspension rules over a rolling 30-day period:
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base">
                Consumer Penalties (No-Show Strikes)
              </h3>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1.5">
                <li><strong>Reliability Score Reduction:</strong> Each no-show deducts <strong>20 points</strong> from the consumer's reliability score and records <strong>1 no-show strike</strong>.</li>
                <li><strong>2nd No-Show Strike (within 30 days):</strong> Automatic <strong>24-hour suspension</strong> from making new meal reservations.</li>
                <li><strong>3rd+ No-Show Strike (within 30 days):</strong> Automatic <strong>7-day suspension</strong> from making new meal reservations.</li>
                <li><strong>OTP Lockout Protection:</strong> 5 consecutive incorrect 4-digit pickup code attempts lock pickup verification for <strong>15 minutes</strong>.</li>
                <li><strong>Monthly Reset:</strong> Consumer no-show strikes reset automatically after <strong>30 days</strong>.</li>
              </ul>
            </div>

            <div
              :class="isDark ? 'bg-[#12110F] border-[#262321]' : 'bg-white border-[#E7E3DF]'"
              class="p-5 border rounded-xl transition-colors shadow-sm space-y-2"
            >
              <h3 class="font-bold text-[#E8621A] text-sm sm:text-base">
                Vendor Penalties (Fulfillment Strikes)
              </h3>
              <ul :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="list-disc list-inside space-y-1.5">
                <li><strong>Strike &amp; Fulfillment Rate Impact:</strong> Each vendor-fault cancellation or unfulfilled order adds <strong>1 vendor strike</strong> and lowers the store's fulfillment rate and search visibility (no cash deduction is charged to the vendor's balance).</li>
                <li><strong>3 Vendor Strikes (within 30 days) or 3 Fault Reports (within 24 hours):</strong> Automatic <strong>3-day store suspension</strong> from publishing or selling listings.</li>
                <li><strong>5 Vendor Strikes (within 30 days):</strong> Automatic <strong>30-day store suspension</strong>.</li>
                <li><strong>Monthly Reset:</strong> Vendor strikes reset automatically after <strong>30 days</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="heading-disputes">
          <h2 id="heading-disputes" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            7. Disputes &amp; Quality Resolution
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            If a food deal is unavailable, substantially mismatched, or the merchant is closed during the official pickup window, consumers can report a vendor fault or reject pickup on-site (verified via GPS proximity within 200–300m of the vendor location) or submit a dispute within <strong>24 hours</strong> of pickup with photo evidence for food quality or missing item claims. Verified vendor-fault claims receive an immediate <strong>100% refund</strong> (plus the 50 non-withdrawable Jara Coins goodwill bonus where applicable), while suspicious or repeated unfounded rejections are flagged for admin review and may result in partial settlement to the vendor (80% of the unrefunded portion to the vendor, 20% to the platform).
          </p>
        </section>

        <section aria-labelledby="heading-liability">
          <h2 id="heading-liability" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            8. Limitation of Liability
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base leading-relaxed">
            Jarabag Technologies Limited provides marketplace matching services on an "as is" and "as available" basis. While we verify partner merchants, food preparation and health standards remain the sole responsibility of individual kitchen operators. To the extent permissible by applicable law, Jarabag Technologies Limited disclaims liability for indirect damages.
          </p>
        </section>

        <section aria-labelledby="heading-contact-terms">
          <h2 id="heading-contact-terms" :class="isDark ? 'text-white' : 'text-[#1E1A17]'" class="text-xl font-bold mb-4">
            9. Contact &amp; Legal Notices
          </h2>
          <p :class="isDark ? 'text-[#E5E0DC]' : 'text-[#3D3834]'" class="text-sm sm:text-base">
            For inquiries regarding our Terms of Service, merchant partnership agreements, or legal communications, reach out to:
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
          &copy; 2026 Jarabag Technologies Limited. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
