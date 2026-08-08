import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  // ─── Public Pages ───
  {
    path: '/',
    name: 'landing',
    component: () => import('@/modules/admin/views/LandingPage.vue'),
    meta: {
      title: 'Jarabag — Save Food, Save Money',
      description: 'Rescue fresh surplus meals from local restaurants at 50-70% off.',
      layout: 'none',
      scrollTop: true,
    },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/modules/admin/views/TermsPage.vue'),
    meta: {
      title: 'Terms of Service — Jarabag',
      description: 'Read the terms of service for using the Jarabag platform.',
      layout: 'none',
      scrollTop: true,
    },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/modules/admin/views/PrivacyPage.vue'),
    meta: {
      title: 'Privacy Policy — Jarabag',
      description: 'Read our privacy policy and how we protect your location and user data.',
      layout: 'none',
      scrollTop: true,
    },
  },

  // ─── Admin Authentication ───
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/modules/admin/views/AdminLogin.vue'),
    meta: {
      title: 'Admin Sign In — Jarabag',
      description: 'Sign in to the Jarabag superadmin operator control panel.',
      layout: 'none',
      scrollTop: true,
    },
  },

  // ─── Super Admin Control Panel ───
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('@/modules/admin/views/DashboardOverview.vue'),
    meta: {
      title: 'Overview — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/modules/admin/views/UserManagement.vue'),
    meta: {
      title: 'User Control — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/vendors',
    name: 'admin-vendors',
    component: () => import('@/modules/admin/views/VendorManagement.vue'),
    meta: {
      title: 'Vendor Profiles — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/roles',
    name: 'admin-roles',
    component: () => import('@/modules/admin/views/RolesManagement.vue'),
    meta: {
      title: 'Roles & Permissions — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/wallets',
    name: 'admin-wallets',
    component: () => import('@/modules/admin/views/WalletManagement.vue'),
    meta: {
      title: 'Wallets & Ledger — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/modules/admin/views/OrderOverride.vue'),
    meta: {
      title: 'Order Overrides — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/emails',
    name: 'admin-emails',
    component: () => import('@/modules/admin/views/EmailScheduler.vue'),
    meta: {
      title: 'Scheduled Emails — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },
  {
    path: '/admin/settings',
    name: 'admin-settings',
    component: () => import('@/modules/admin/views/PlatformSettings.vue'),
    meta: {
      title: 'Platform Settings — Jarabag Admin',
      requiresAdmin: true,
      scrollTop: true,
    },
  },

  // ─── Catch-all ───
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/admin/views/LandingPage.vue'),
    meta: {
      title: 'Jarabag — Page Not Found',
      layout: 'none',
      scrollTop: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ─── Navigation Guards ───
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Guard admin routes: user must be authenticated AND have role admin or superadmin
  if (to.meta.requiresAdmin || (to.path.startsWith('/admin') && to.path !== '/admin/login')) {
    if (!auth.isAuthenticated) {
      return { name: 'admin-login' }
    }
    if (auth.user?.role !== 'admin' && auth.user?.role !== 'superadmin') {
      auth.logout()
      return { name: 'admin-login' }
    }
  }

  // Redirect authenticated admin users away from login
  if (to.path === '/admin/login' && auth.isAuthenticated) {
    if (auth.user?.role === 'admin' || auth.user?.role === 'superadmin') {
      return { name: 'admin-dashboard' }
    }
  }
})

// ─── Title, Meta & Scroll-to-Top ───
router.afterEach((to) => {
  if (to.path.startsWith('/admin')) {
    document.body.classList.add('admin-mode')
  } else {
    document.body.classList.remove('admin-mode')
  }

  const title = (to.meta.title as string) ?? 'JaraBag — Fresh Food, Smart Savings'
  const description = (to.meta.description as string) ?? ''

  document.title = title

  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && description) {
    metaDesc.setAttribute('content', description)
  }

  // Scroll-to-top: since html/body use overflow:hidden and #app handles scrolling,
  // Vue Router's native scrollBehavior doesn't work. We manually scroll #app instead.
  // Routes with scrollTop: false (e.g. Map) preserve their scroll/view state.
  // We use nextTick + rAF to ensure the new route component has rendered after the transition.
  if (to.meta.scrollTop !== false) {
    nextTick(() => {
      requestAnimationFrame(() => {
        // Primary: scroll the #app container (used for iOS safe-area layout)
        const appContainer = document.getElementById('app')
        if (appContainer) {
          appContainer.scrollTop = 0
        }
        // Fallback: also scroll window and documentElement in case layout changes
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    })
  }
})

export default router
