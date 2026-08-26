import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingPage from '../modules/admin/views/LandingPage.vue'

describe('VendorBroadcastShowcase Component integration', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn<() => void>(),
        removeListener: vi.fn<() => void>(),
        addEventListener: vi.fn<() => void>(),
        removeEventListener: vi.fn<() => void>(),
        dispatchEvent: vi.fn<() => boolean>(),
      }),
    })
    window.scrollTo = vi.fn<() => void>()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders the broadcast showcase section and header properly on LandingPage.vue', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          'router-link': true,
        },
      },
    })

    const section = wrapper.find('#broadcast-showcase')
    expect(section.exists()).toBe(true)

    const heading = wrapper.find('#broadcast-heading')
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toContain('Sell Out Fresh Batches & Specials in Minutes.')

    // Commercial value driver pillars
    expect(wrapper.text()).toContain('On-Demand Sales Spikes')
    expect(wrapper.text()).toContain('Direct Lock-Screen Reach')
    expect(wrapper.text()).toContain('Guaranteed Escrow Pre-Payment')
  })

  it('renders all 3 scenario tabs with role="tab" and correct initial aria-selected attributes', () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          'router-link': true,
        },
      },
    })

    const tabs = wrapper.findAll('#broadcast-showcase [role="tab"]')
    expect(tabs.length).toBe(3)

    // Initial state: first tab active, others inactive
    expect(tabs[0]?.attributes('aria-selected')).toBe('true')
    expect(tabs[1]?.attributes('aria-selected')).toBe('false')
    expect(tabs[2]?.attributes('aria-selected')).toBe('false')

    // Initial preset content (Golden Crust Artisan Bakery)
    expect(wrapper.text()).toContain('Golden Crust Artisan Bakery')
    expect(wrapper.text()).toContain('Hot Oven Meat Pies & Warm Croissants')
    expect(wrapper.text()).toContain('4,960')
    expect(wrapper.text()).toContain('15 / 15 Available')
  })

  it('updates the active tab, aria-selected attributes, and displays updated store name, product title, and discount price on click', async () => {
    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          'router-link': true,
        },
      },
    })

    const tabs = wrapper.findAll('#broadcast-showcase [role="tab"]')
    expect(tabs.length).toBe(3)

    // Switch to Scenario 2: Off-Peak Rush (Buka Prime Kitchen)
    await tabs[1]?.trigger('click')

    expect(tabs[0]?.attributes('aria-selected')).toBe('false')
    expect(tabs[1]?.attributes('aria-selected')).toBe('true')
    expect(tabs[2]?.attributes('aria-selected')).toBe('false')

    expect(wrapper.text()).toContain('Buka Prime Kitchen')
    expect(wrapper.text()).toContain('Midday Smoky Jollof + Grilled Asun Mega Box')
    expect(wrapper.text()).toContain('6,960')
    expect(wrapper.text()).toContain('Flash Deal: Buka Prime Kitchen')
    expect(wrapper.text()).toContain('25 / 25 Available')

    // Switch to Scenario 3: Surplus Clearance (Mama Cass Family Eatery)
    await tabs[2]?.trigger('click')

    expect(tabs[0]?.attributes('aria-selected')).toBe('false')
    expect(tabs[1]?.attributes('aria-selected')).toBe('false')
    expect(tabs[2]?.attributes('aria-selected')).toBe('true')

    expect(wrapper.text()).toContain('Mama Cass Family Eatery')
    expect(wrapper.text()).toContain('Chef Special Mystery Box')
    expect(wrapper.text()).toContain('3,500')
    expect(wrapper.text()).toContain('Surplus Rescue: Mama Cass')
    expect(wrapper.text()).toContain('10 / 10 Available')
  })

  it('triggers the broadcast demo and updates inventory countdown when replay blast button is clicked', async () => {
    vi.useFakeTimers()

    const wrapper = mount(LandingPage, {
      global: {
        stubs: {
          'router-link': true,
        },
      },
    })

    const blastButton = wrapper
      .findAll('#broadcast-showcase button')
      .find((btn) => btn.text().includes('Replay Blast'))

    expect(blastButton).toBeDefined()
    expect(blastButton?.exists()).toBe(true)

    // Trigger broadcast demo
    await blastButton?.trigger('click')

    // Button should reflect active broadcast state
    expect(wrapper.text()).toContain('Broadcasting Batch...')
    expect(blastButton?.attributes('disabled')).toBeDefined()

    // Advance timers through the sellout intervals
    vi.advanceTimersByTime(2500)
    await wrapper.vm.$nextTick()

    // Should indicate sold out status
    expect(wrapper.text()).toContain('100% Sold Out')
    expect(blastButton?.attributes('disabled')).toBeUndefined()
  })
})
