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
    expect(heading.text()).toContain('List it. Broadcast it. Sell out.')

    // Commercial value driver pillars
    expect(wrapper.text()).toContain('Instant Sales, No Ads')
    expect(wrapper.text()).toContain('Straight to Their Phone')
    expect(wrapper.text()).toContain('Pre-paid, No No-shows')
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

    // Initial preset content (Mama Ada's Kitchen)
    expect(wrapper.text()).toContain("Mama Ada's Kitchen")
    expect(wrapper.text()).toContain('Homemade Jollof Rice & Fried Plantain')
    expect(wrapper.text()).toContain('3,500')
    expect(wrapper.text()).toContain('12 / 12 Available')
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

    // Switch to Scenario 2: Campus Quick Bite (Chef Tunde)
    await tabs[1]?.trigger('click')

    expect(tabs[0]?.attributes('aria-selected')).toBe('false')
    expect(tabs[1]?.attributes('aria-selected')).toBe('true')
    expect(tabs[2]?.attributes('aria-selected')).toBe('false')

    expect(wrapper.text()).toContain('Chef Tunde (Student)')
    expect(wrapper.text()).toContain('Indomie & Egg Combo Packs')
    expect(wrapper.text()).toContain('1,800')
    expect(wrapper.text()).toContain('Campus Deal: Chef Tunde')
    expect(wrapper.text()).toContain('20 / 20 Available')

    // Switch to Scenario 3: Restaurant Flash Deal (Buka Prime Kitchen)
    await tabs[2]?.trigger('click')

    expect(tabs[0]?.attributes('aria-selected')).toBe('false')
    expect(tabs[1]?.attributes('aria-selected')).toBe('false')
    expect(tabs[2]?.attributes('aria-selected')).toBe('true')

    expect(wrapper.text()).toContain('Buka Prime Kitchen')
    expect(wrapper.text()).toContain('Smoky Jollof + Grilled Asun Mega Box')
    expect(wrapper.text()).toContain('6,960')
    expect(wrapper.text()).toContain('Flash Deal: Buka Prime Kitchen')
    expect(wrapper.text()).toContain('25 / 25 Available')
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
