<script setup lang="ts">
import { computed, ref, useId } from 'vue'

interface Props {
  modelValue?: string | number
  label: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  inputmode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' | 'none'
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [e: FocusEvent]
}>()

const inputId = useId()
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`
const isFocused = ref(false)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(errorId)
  if (props.hint && !props.error) ids.push(hintId)
  return ids.length ? ids.join(' ') : undefined
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onBlur(e: FocusEvent) {
  isFocused.value = false
  emit('blur', e)
}
</script>

<template>
  <div class="base-input" :class="{ 'base-input--error': error, 'base-input--disabled': disabled }">
    <label :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-hidden="true">*</span>
    </label>

    <div class="base-input__wrapper" :class="{ 'base-input__wrapper--focused': isFocused }">
      <slot name="prefix" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :enterkeyhint="enterkeyhint"
        :maxlength="maxlength"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        :aria-required="required || undefined"
        class="base-input__field"
        @input="onInput"
        @focus="isFocused = true"
        @blur="onBlur"
      />
      <slot name="suffix" />
    </div>

    <p v-if="error" :id="errorId" class="base-input__error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="base-input__hint">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.base-input__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.base-input__required {
  color: var(--color-error-500);
  margin-inline-start: 0.125rem;
}

.base-input__wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  background-color: var(--surface-raised);
  border: 1.5px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition:
    border-color var(--duration-fast) ease-out,
    box-shadow var(--duration-fast) ease-out;
}

.base-input__wrapper--focused {
  border-color: var(--ring-color);
  box-shadow: 0 0 0 var(--ring-width) oklch(from var(--ring-color) l c h / 0.2);
}

.base-input--error .base-input__wrapper {
  border-color: var(--color-error-500);
}

.base-input--error .base-input__wrapper--focused {
  box-shadow: 0 0 0 var(--ring-width) oklch(from var(--color-error-500) l c h / 0.2);
}

.base-input__field {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.5;
}

.base-input__field::placeholder {
  color: var(--text-tertiary);
}

.base-input__error {
  font-size: var(--text-sm);
  color: var(--color-error-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.base-input__hint {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.base-input--disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
