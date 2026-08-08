import { reactive, computed } from 'vue'
import en from './en.json'

type TranslationDict = Record<string, unknown>

const locales: Record<string, TranslationDict> = { en }
const state = reactive({ locale: 'en' })

function getNestedValue(obj: unknown, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

/**
 * Simple ICU-like interpolation: replaces {key} and {key, number} placeholders.
 * Handles basic plural: {key, plural, one {…} other {…}}
 */
function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template

  return template.replace(
    /\{(\w+)(?:,\s*(\w+)(?:,\s*(.*?))?)?\}/g,
    (match, key: string, type?: string, rest?: string) => {
      const value = params[key]
      if (value === undefined) return match

      if (type === 'number') {
        return formatNumber(Number(value))
      }

      if (type === 'plural' && rest) {
        const num = Number(value)
        const oneMatch = rest.match(/one\s*\{([^}]*)\}/)
        const otherMatch = rest.match(/other\s*\{([^}]*)\}/)
        return num === 1 ? (oneMatch?.[1] ?? String(value)) : (otherMatch?.[1] ?? String(value))
      }

      return String(value)
    },
  )
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat(state.locale).format(value)
}

function formatCurrency(value: number, currency = 'NGN'): string {
  return new Intl.NumberFormat(state.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(state.locale, options).format(date)
}

function formatTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(state.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatRelativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function useI18n() {
  const locale = computed(() => state.locale)

  function t(key: string, params?: Record<string, unknown>): string {
    const dict = locales[state.locale] ?? locales.en!
    const raw = getNestedValue(dict, key)
    return interpolate(raw, params)
  }

  function setLocale(newLocale: string) {
    if (locales[newLocale]) {
      state.locale = newLocale
      document.documentElement.lang = newLocale
    }
  }

  return {
    t,
    locale,
    setLocale,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatRelativeTime,
  }
}
