import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import BagDealPreviewPage from '@/modules/admin/views/BagDealPreviewPage.vue'
import { apiClient } from '@/services/api'

vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const mockBagPayload = {
  id: 'bag-777',
  title: 'Asun & Smoky Party Jollof Box',
  description: 'Freshly grilled spicy goat meat with smoky party jollof rice and plantain.',
  category: 'rice-dishes',
  originalPrice: 6000,
  discountedPrice: 3000,
  quantity: 10,
  quantityRemaining: 4,
  pickupWindowStart: '2026-10-20T16:00:00.000Z',
  pickupWindowEnd: '2026-10-20T19:00:00.000Z',
  status: 'available',
  vendor: {
    name: 'Mama Ada Kitchen',
    address: 'Sabo, Yaba, Lagos',
  },
}

describe('BagDealPreviewPage (/bag/:id)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    await router.push('/bag/bag-777')
    await router.isReady()
  })

  it('registers /bag/:id as a public route named bag-deal-preview', () => {
    expect(router.currentRoute.value.name).toBe('bag-deal-preview')
    expect(router.currentRoute.value.params.id).toBe('bag-777')
  })

  it('fetches and displays live deal details, discount badge, and app download CTAs', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { data: mockBagPayload },
    } as any)

    const wrapper = mount(BagDealPreviewPage, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(apiClient.get).toHaveBeenCalledWith('/bags/bag-777')
    expect(wrapper.text()).toContain('Asun & Smoky Party Jollof Box')
    expect(wrapper.text()).toContain('Mama Ada Kitchen')
    expect(wrapper.text()).toContain('-50% OFF')
    expect(wrapper.text()).toContain('Only 4 bags left')
    expect(wrapper.find('[data-testid="open-in-app-btn"]').attributes('href')).toBe(
      'jarabagmobile://bag/bag-777'
    )
    expect(wrapper.find('[data-testid="download-google-play-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="download-app-store-btn"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="download-poster-btn"]').exists()).toBe(true)
  })

  it('shows a graceful fallback state when the deal is expired or not found', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Not found'))

    const wrapper = mount(BagDealPreviewPage, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Deal Unavailable or Sold Out')
    expect(wrapper.find('[data-testid="download-google-play-btn"]').exists()).toBe(true)
  })

  it('renders P3 flash drop badge when priceDroppedAt and initialDiscountedPrice are returned', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          ...mockBagPayload,
          discountedPrice: 1800,
          initialDiscountedPrice: 2500,
          priceDroppedAt: '2026-10-21T16:05:00.000Z',
        },
      },
    } as any)

    const wrapper = mount(BagDealPreviewPage, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    const badge = wrapper.find('[data-testid="web-flash-drop-badge"]')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('⚡ Final-Hour Drop (was')
  })

  it('renders P4 pre-order batch crowdfunding badge when isBatchCrowdfunded and minOrdersToCook are returned', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        data: {
          ...mockBagPayload,
          isBatchCrowdfunded: true,
          minOrdersToCook: 4,
          quantity: 6,
          quantityRemaining: 4,
        },
      },
    } as any)

    const wrapper = mount(BagDealPreviewPage, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    const badge = wrapper.find('[data-testid="web-batch-crowdfund-badge"]')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('2/4 needed to cook')
  })
})
