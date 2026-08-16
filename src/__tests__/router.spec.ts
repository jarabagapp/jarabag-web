import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

describe('Router & Navigation Guards', () => {
  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    localStorage.clear()
    const auth = useAuthStore()
    auth.user = null
    auth.authStep = 'idle'
    await router.push('/')
    await router.isReady()
  })

  it('allows access to public landing page', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
    expect(router.currentRoute.value.name).toBe('landing')
  })

  it('allows access to terms and privacy public routes', async () => {
    await router.push('/terms')
    expect(router.currentRoute.value.path).toBe('/terms')
    expect(router.currentRoute.value.name).toBe('terms')

    await router.push('/privacy')
    expect(router.currentRoute.value.path).toBe('/privacy')
    expect(router.currentRoute.value.name).toBe('privacy')
  })

  it('allows unauthenticated access to /admin/login', async () => {
    await router.push('/admin/login')
    expect(router.currentRoute.value.path).toBe('/admin/login')
    expect(router.currentRoute.value.name).toBe('admin-login')
  })

  it('redirects unauthenticated user from /admin to /admin/login with redirect query', async () => {
    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/admin/login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin')
  })

  it('redirects unauthenticated user from /admin/users to /admin/login with redirect query', async () => {
    await router.push('/admin/users')
    expect(router.currentRoute.value.path).toBe('/admin/login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/users')
  })

  it('allows admin access to /admin and /admin subroutes when authenticated', async () => {
    const auth = useAuthStore()
    auth.user = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jarabag.com',
      phone: '+2348000000000',
      role: 'admin',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    auth.authStep = 'authenticated'

    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/admin')
    expect(router.currentRoute.value.name).toBe('admin-dashboard')

    await router.push('/admin/users')
    expect(router.currentRoute.value.path).toBe('/admin/users')
    expect(router.currentRoute.value.name).toBe('admin-users')

    await router.push('/admin/wallets')
    expect(router.currentRoute.value.path).toBe('/admin/wallets')
    expect(router.currentRoute.value.name).toBe('admin-wallets')
  })

  it('redirects authenticated admin from /admin/login to /admin dashboard', async () => {
    const auth = useAuthStore()
    auth.user = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jarabag.com',
      phone: '+2348000000000',
      role: 'admin',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    auth.authStep = 'authenticated'

    await router.push('/admin/login')
    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('redirects authenticated admin from /admin/login to query redirect target', async () => {
    const auth = useAuthStore()
    auth.user = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jarabag.com',
      phone: '+2348000000000',
      role: 'admin',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    auth.authStep = 'authenticated'

    await router.push('/admin/login?redirect=/admin/orders')
    expect(router.currentRoute.value.path).toBe('/admin/orders')
  })

  it('rejects non-admin role when accessing /admin and redirects to login', async () => {
    const auth = useAuthStore()
    auth.user = {
      id: 'user-1',
      name: 'Regular Consumer',
      email: 'consumer@jarabag.com',
      phone: '+2348000000001',
      role: 'consumer',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    auth.authStep = 'authenticated'

    await router.push('/admin')
    expect(router.currentRoute.value.path).toBe('/admin/login')
    expect(auth.user).toBeNull()
  })

  it('handles unknown routes with catch-all fallback', async () => {
    await router.push('/some-non-existent-page')
    expect(router.currentRoute.value.name).toBe('not-found')
  })
})
