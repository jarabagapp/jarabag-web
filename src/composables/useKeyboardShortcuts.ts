import { onMounted, onUnmounted, ref } from 'vue'

interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  description: string
  handler: (e: KeyboardEvent) => void
}

const shortcuts = ref<Shortcut[]>([])
const isHelpOpen = ref(false)

export function useKeyboardShortcuts() {
  function register(shortcut: Shortcut) {
    shortcuts.value.push(shortcut)
  }

  function unregister(key: string) {
    shortcuts.value = shortcuts.value.filter((s) => s.key !== key)
  }

  function isInsideTextField(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement
    const tagName = target.tagName.toLowerCase()
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    )
  }

  function handleKeydown(e: KeyboardEvent) {
    // Never suppress inside text fields (except Escape)
    if (isInsideTextField(e) && e.key !== 'Escape') return

    // ? opens shortcut help
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      isHelpOpen.value = !isHelpOpen.value
      return
    }

    for (const shortcut of shortcuts.value) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true
      const metaMatch = shortcut.meta ? e.metaKey : true
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey

      if (e.key.toLowerCase() === shortcut.key.toLowerCase() && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault()
        shortcut.handler(e)
        return
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return {
    register,
    unregister,
    shortcuts,
    isHelpOpen,
  }
}
