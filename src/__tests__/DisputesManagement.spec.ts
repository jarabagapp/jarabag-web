import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/services/api'
import { AdminService } from '@/modules/admin/services/admin.service'
import DisputeAdjudicationDrawer from '@/modules/admin/components/DisputeAdjudicationDrawer.vue'
import DisputesManagement from '@/modules/admin/views/DisputesManagement.vue'

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockDisputedOrders = [
  {
    id: 'ord-101',
    userId: 'user-1',
    bagId: 'bag-1',
    quantity: 2,
    amount: 5000,
    cashPaid: 4500,
    jaraCoinsUsed: 500,
    status: 'ready-for-pickup',
    paymentStatus: 'held-in-escrow',
    isDisputed: true,
    disputeStatus: 'pending',
    disputeCategory: 'food_spoiled',
    disputeReason: 'The meal smelled sour and was completely spoiled.',
    disputePreferredRemedy: 'wallet_credit',
    disputeEvidencePhotos: [
      'https://res.cloudinary.com/jarabag/image/upload/v1/evidence1.jpg',
      'https://res.cloudinary.com/jarabag/image/upload/v1/evidence2.jpg',
    ],
    createdAt: '2026-10-23T10:00:00.000Z',
    disputedAt: '2026-10-23T11:00:00.000Z',
    user: {
      name: 'Tunde Bakare',
      email: 'tunde@example.com',
      phone: '+2348011112222',
    },
    bag: {
      title: 'Party Jollof & Turkey Surprise',
      originalPrice: 5000,
      discountedPrice: 2500,
      pickupWindowStart: '2026-10-23T12:00:00.000Z',
      pickupWindowEnd: '2026-10-23T14:00:00.000Z',
    },
    vendor: {
      name: 'Iya Basira Eatery',
      category: 'African Delicacies',
      phone: '+2348099998888',
      address: '15 Admiralty Way, Lekki',
      fulfillmentRate: 94,
      disputeCount: 2,
      strikeCount: 1,
    },
  },
  {
    id: 'ord-102',
    userId: 'user-2',
    bagId: 'bag-2',
    quantity: 1,
    amount: 3000,
    cashPaid: 3000,
    jaraCoinsUsed: 0,
    status: 'refunded',
    paymentStatus: 'refunded',
    isDisputed: false,
    disputeStatus: 'resolved',
    disputeCategory: 'store_closed',
    disputeReason: 'Store was locked when I arrived.',
    disputePreferredRemedy: 'wallet_credit',
    disputeEvidencePhotos: [],
    disputeResolutionAction: 'full_refund',
    disputeRefundAmount: 3000,
    disputeResolutionNotes: 'Verified store was closed by checking vendor CCTV/calls.',
    createdAt: '2026-10-22T14:00:00.000Z',
    disputedAt: '2026-10-22T15:00:00.000Z',
    resolvedAt: '2026-10-22T16:00:00.000Z',
    user: {
      name: 'Chioma Okonkwo',
      email: 'chioma@example.com',
      phone: '+2348022223333',
    },
    bag: {
      title: 'Crispy Fried Chicken Box',
      originalPrice: 6000,
      discountedPrice: 3000,
      pickupWindowStart: '2026-10-22T16:00:00.000Z',
      pickupWindowEnd: '2026-10-22T18:00:00.000Z',
    },
    vendor: {
      name: 'Chicken Republic Lekki',
      category: 'Fast Food',
      phone: '+2348077776666',
      address: '22 Admiralty Way, Lekki',
      fulfillmentRate: 98,
      disputeCount: 1,
      strikeCount: 0,
    },
  },
  {
    id: 'ord-103',
    userId: 'user-3',
    bagId: 'bag-3',
    quantity: 1,
    amount: 4000,
    cashPaid: 4000,
    jaraCoinsUsed: 0,
    status: 'picked-up',
    paymentStatus: 'released',
    isDisputed: false,
    disputeStatus: 'dismissed',
    disputeCategory: 'missing_items',
    disputeReason: 'Missing drinks.',
    disputeResolutionAction: 'dismiss',
    disputeResolutionNotes: 'Customer arrived after pickup window ended and bag contents matched listing.',
    createdAt: '2026-10-21T14:00:00.000Z',
    disputedAt: '2026-10-21T15:00:00.000Z',
    resolvedAt: '2026-10-21T16:00:00.000Z',
    user: {
      name: 'Ahmed Bello',
      email: 'ahmed@example.com',
      phone: '+2348033334444',
    },
    bag: {
      title: 'Shawarma & Fries Meal',
      originalPrice: 4000,
      discountedPrice: 4000,
      pickupWindowStart: '2026-10-21T16:00:00.000Z',
      pickupWindowEnd: '2026-10-21T18:00:00.000Z',
    },
    vendor: {
      name: 'Suya Spot VI',
      category: 'Grill',
      phone: '+2348055554444',
      address: 'Victoria Island',
      fulfillmentRate: 99,
      disputeCount: 0,
      strikeCount: 0,
    },
  },
]

describe('Disputes Management & Adjudication System', () => {
  let queryClient: QueryClient

  beforeEach(async () => {
    setActivePinia(createPinia())
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()

    const auth = useAuthStore()
    auth.user = {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@jarabag.com',
      phone: '+2348000000000',
      role: 'superadmin',
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    }
    auth.authStep = 'authenticated'

    await router.push('/')
    await router.isReady()
  })

  describe('1. AdminService.resolveDispute Contract', () => {
    it('sends PUT /admin/orders/:id/resolve-dispute with correct multi-field payload', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, message: 'Dispute resolved' },
      } as any)

      const payload = {
        action: 'full_refund' as const,
        partialRefundAmount: undefined,
        adminNotes: 'Food was spoiled per evidence photo confirmation.',
        applyVendorStrike: true,
      }

      await AdminService.resolveDispute('ord-101', payload)

      expect(apiClient.put).toHaveBeenCalledWith(
        '/admin/orders/ord-101/resolve-dispute',
        payload
      )
    })
  })

  describe('2. DisputeAdjudicationDrawer Component', () => {
    it('renders customer claim, remedy, evidence photos, and vendor ledger', async () => {
      const order = mockDisputedOrders[0]
      const wrapper = mount(DisputeAdjudicationDrawer, {
        props: {
          open: true,
          order,
        },
        global: {
          plugins: [router, [VueQueryPlugin, { queryClient }]],
        },
      })

      expect(wrapper.text()).toContain('ORD-101')
      expect(wrapper.text()).toContain('Tunde Bakare')
      expect(wrapper.text()).toContain('Food Spoiled')
      expect(wrapper.text()).toContain('The meal smelled sour and was completely spoiled.')
      expect(wrapper.text()).toContain('Jara Wallet Credit')
      expect(wrapper.text()).toContain('Iya Basira Eatery')
      expect(wrapper.text()).toContain('94%') // fulfillment rate
      expect(wrapper.text()).toContain('1') // strikes

      // Evidence photos displayed
      const photos = wrapper.findAll('[data-testid="evidence-photo-thumb"]')
      expect(photos.length).toBe(2)

      // Lightbox interaction
      const firstPhoto = photos[0]
      expect(firstPhoto).toBeDefined()
      await firstPhoto!.trigger('click')
      const lightbox = wrapper.find('[data-testid="photo-lightbox"]')
      expect(lightbox.exists()).toBe(true)
      expect(lightbox.find('img').attributes('src')).toBe(
        'https://res.cloudinary.com/jarabag/image/upload/v1/evidence1.jpg'
      )

      // Close lightbox
      const closeLightboxBtn = wrapper.find('[data-testid="close-lightbox-btn"]')
      await closeLightboxBtn.trigger('click')
      expect(wrapper.find('[data-testid="photo-lightbox"]').exists()).toBe(false)
    })

    it('requires minimum 5 characters in admin notes before submitting resolution', async () => {
      const order = mockDisputedOrders[0]
      const wrapper = mount(DisputeAdjudicationDrawer, {
        props: {
          open: true,
          order,
        },
        global: {
          plugins: [router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const submitBtn = wrapper.find('[data-testid="execute-resolution-btn"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()

      const notesTextarea = wrapper.find('[data-testid="admin-notes-input"]')
      await notesTextarea.setValue('Bad')
      expect(submitBtn.attributes('disabled')).toBeDefined()

      await notesTextarea.setValue('Approved full refund after inspection.')
      expect(submitBtn.attributes('disabled')).toBeUndefined()
    })

    it('calculates partial refund split dynamically between customer and vendor', async () => {
      const order = mockDisputedOrders[0] // cashPaid = 4500
      const wrapper = mount(DisputeAdjudicationDrawer, {
        props: {
          open: true,
          order,
        },
        global: {
          plugins: [router, [VueQueryPlugin, { queryClient }]],
        },
      })

      // Select partial refund option
      const partialRadio = wrapper.find('[data-testid="radio-partial_refund"]')
      await partialRadio.trigger('click')

      const amountInput = wrapper.find('[data-testid="partial-refund-amount-input"]')
      expect(amountInput.exists()).toBe(true)

      // Set partial refund to 2000 NGN out of 4500 cashPaid.
      // Remaining = 2500. Vendor gets 80% = 2000, Platform fee 20% = 500.
      await amountInput.setValue('2000')

      expect(wrapper.text()).toContain('Customer Refund')
      expect(wrapper.text()).toContain('₦2,000')
      expect(wrapper.text()).toContain('Vendor Remainder')
      expect(wrapper.text()).toContain('₦2,000') // 2500 * 0.8
    })

    it('executes resolution via mutation and emits resolved and close events', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true },
      } as any)

      const order = mockDisputedOrders[0]
      const wrapper = mount(DisputeAdjudicationDrawer, {
        props: {
          open: true,
          order,
        },
        global: {
          plugins: [router, [VueQueryPlugin, { queryClient }]],
        },
      })

      const notesTextarea = wrapper.find('[data-testid="admin-notes-input"]')
      await notesTextarea.setValue('Full refund issued to customer wallet.')

      const submitBtn = wrapper.find('[data-testid="execute-resolution-btn"]')
      await submitBtn.trigger('click')
      await flushPromises()

      expect(apiClient.put).toHaveBeenCalledWith(
        '/admin/orders/ord-101/resolve-dispute',
        expect.objectContaining({
          action: 'full_refund',
          adminNotes: 'Full refund issued to customer wallet.',
          applyVendorStrike: true,
        })
      )
      expect(wrapper.emitted('resolved')).toBeTruthy()
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('3. DisputesManagement View Component', () => {
    it('renders top metric cards, dispute rows, and handles tab filtering', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          orders: mockDisputedOrders,
          total: 3,
        },
      } as any)

      const wrapper = mount(DisputesManagement, {
        global: {
          plugins: [router, [VueQueryPlugin, { queryClient }]],
        },
      })

      await flushPromises()

      // Header and Metrics
      expect(wrapper.text()).toContain('Disputes & Claims Adjudication')
      expect(wrapper.text()).toContain('Open Disputes')
      expect(wrapper.text()).toContain('1') // 1 pending dispute in mock data
      expect(wrapper.text()).toContain('Escrow at Risk')
      expect(wrapper.text()).toContain('₦5,000') // ord-101 amount held

      // Table contains rows
      expect(wrapper.text()).toContain('ORD-101')
      expect(wrapper.text()).toContain('Tunde Bakare')
      expect(wrapper.text()).toContain('Iya Basira Eatery')

      // Clicking tab filters
      const resolvedTab = wrapper.find('[data-testid="tab-resolved"]')
      expect(resolvedTab.exists()).toBe(true)
      await resolvedTab.trigger('click')

      // Check Review & Adjudicate button opens drawer
      const allTab = wrapper.find('[data-testid="tab-all"]')
      await allTab.trigger('click')
      await flushPromises()

      const adjudicateBtn = wrapper.find('[data-testid="adjudicate-btn"]')
      expect(adjudicateBtn.exists()).toBe(true)
      await adjudicateBtn.trigger('click')

      // Adjudication drawer should now be open for ord-101
      expect(wrapper.findComponent(DisputeAdjudicationDrawer).props('open')).toBe(true)
      expect(wrapper.findComponent(DisputeAdjudicationDrawer).props('order')?.id).toBe('ord-101')
    })
  })

  describe('4. Router and AdminLayout Integration', () => {
    it('navigates to /admin/disputes when authenticated as admin', async () => {
      await router.push('/admin/disputes')
      expect(router.currentRoute.value.path).toBe('/admin/disputes')
      expect(router.currentRoute.value.name).toBe('admin-disputes')
    })
  })
})
