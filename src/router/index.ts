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
      title: 'JaraBag — Save Fresh Surplus Food at 50–70% Off | Smart Savings & Zero Waste',
      description: 'Rescue delicious surplus meals, groceries, and bakery goods from local restaurants and bukas at 50–70% off with Jarabag. Secure escrow payments and zero food waste in Nigeria.',
      canonical: 'https://jarabagapp.com/',
      layout: 'none',
      scrollTop: true,
    },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/modules/admin/views/TermsPage.vue'),
    meta: {
      title: 'Terms of Service — JaraBag | User Agreement & Escrow Policies',
      description: 'Read the official Terms of Service for using the Jarabag food rescue platform, including wallet escrow, pickup verification, and refund policies.',
      canonical: 'https://jarabagapp.com/terms',
      layout: 'none',
      scrollTop: true,
    },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/modules/admin/views/PrivacyPage.vue'),
    meta: {
      title: 'Privacy Policy — JaraBag | Data Protection & Location Privacy',
      description: 'Learn how Jarabag protects your personal data, background location, and payment details in strict compliance with NDPR and international privacy standards.',
      canonical: 'https://jarabagapp.com/privacy',
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
      title: 'Admin Sign In — Jarabag Superadmin Portal',
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
      title: 'Page Not Found — Jarabag',
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
  const normalizedPath = to.path.replace(/\/+$/, '') || '/'
  const isAdminLogin = normalizedPath === '/admin/login'
  const isAdminRoute = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')

  // Guard admin routes: user must be authenticated AND have role admin or superadmin
  if (to.meta.requiresAdmin || (isAdminRoute && !isAdminLogin)) {
    if (!auth.isAuthenticated) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
    if (auth.user?.role !== 'admin' && auth.user?.role !== 'superadmin') {
      auth.logout()
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
  }

  // Redirect authenticated admin users away from login
  if (isAdminLogin && auth.isAuthenticated) {
    if (auth.user?.role === 'admin' || auth.user?.role === 'superadmin') {
      const redirectUrl = (to.query.redirect as string) || '/admin'
      return redirectUrl.startsWith('/admin') ? redirectUrl : '/admin'
    }
  }
})

// ─── Title, Meta, OpenGraph & Canonical Link Sync ───
router.afterEach((to) => {
  if (typeof document === 'undefined') return

  if (to.path.startsWith('/admin')) {
    document.body.classList.add('admin-mode')
  } else {
    document.body.classList.remove('admin-mode')
  }

  const title = (to.meta.title as string) ?? 'JaraBag — Save Fresh Surplus Food at 50–70% Off'
  const description = (to.meta.description as string) ?? 'Rescue fresh surplus meals from local restaurants and bukas at 50-70% off with Jarabag.'
  const canonicalUrl = (to.meta.canonical as string) ?? `https://jarabagapp.com${to.path}`

  document.title = title

  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector)
    if (!el) {
      el = document.createElement('meta')
      if (selector.startsWith('meta[name=')) {
        const name = selector.match(/name="([^"]+)"/)?.[1]
        if (name) el.setAttribute('name', name)
      } else if (selector.startsWith('meta[property=')) {
        const prop = selector.match(/property="([^"]+)"/)?.[1]
        if (prop) el.setAttribute('property', prop)
      }
      document.head.appendChild(el)
    }
    el.setAttribute(attr, value)
  }

  // Meta Description & Title
  setMeta('meta[name="description"]', 'content', description)
  setMeta('meta[name="title"]', 'content', title)

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[property="og:url"]', 'content', canonicalUrl)

  // Twitter Card
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)
  setMeta('meta[name="twitter:url"]', 'content', canonicalUrl)

  // Canonical Tag
  let canonicalEl = document.querySelector('link[rel="canonical"]')
  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }
  canonicalEl.setAttribute('href', canonicalUrl)

  // Scroll-to-top: scroll container and document
  if (to.meta.scrollTop !== false) {
    nextTick(() => {
      requestAnimationFrame(() => {
        const appContainer = document.getElementById('app')
        if (appContainer) {
          appContainer.scrollTop = 0
        }
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      })
    })
  }
})

export default router
