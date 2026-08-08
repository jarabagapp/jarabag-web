<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { refDebounced } from '@vueuse/core'
import AdminLayout from '../components/AdminLayout.vue'
import {
  useAdminEmailSchedules,
  useAdminTemplates,
  useScheduleEmail,
} from '../composables/useAdminQuery'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

interface EmailScheduleRecord {
  id: string
  to: string
  subject: string
  body: string
  scheduledAt: string
  status: 'pending' | 'sent' | 'failed'
  error?: string
  createdAt: string
  targetingFilters?: any
  recipientCount?: number
  sentRecipients?: string[]
}


const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

// Form States
const showCreateModal = ref(false)
const showConfirmModal = ref(false)
const selectedCampaign = ref<EmailScheduleRecord | null>(null)
const showDetailsModal = ref(false)

const openDetails = (s: EmailScheduleRecord) => {
  selectedCampaign.value = s
  showDetailsModal.value = true
}

const copyStateText = ref('Copy Content')
const copyRawCampaignContent = async () => {
  if (!selectedCampaign.value) return
  try {
    await navigator.clipboard.writeText(selectedCampaign.value.body)
    copyStateText.value = 'Copied! ✓'
    setTimeout(() => {
      copyStateText.value = 'Copy Content'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
    alert('Failed to copy content to clipboard.')
  }
}

const targetAudience = ref('all_customers')
const customRecipientsTags = ref<string[]>([])
const recipientInput = ref('')
const selectedTemplateId = ref('')
const emailSubject = ref('')
const emailBody = ref('')
const emailScheduledAt = ref('')
const scheduleMode = ref<'immediate' | 'later'>('immediate')
const composeLoading = ref(false)
const composeError = ref('')

const initLaterTime = () => {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  emailScheduledAt.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const showNativePicker = () => {
  if (dateTimeInput.value) {
    try {
      dateTimeInput.value.showPicker()
    } catch (e) {
      console.warn('showPicker not supported or failed:', e)
    }
  }
}

const confirmTargetDescription = computed(() => {
  if (targetAudience.value === 'all_customers') return 'All Registered Consumers'
  if (targetAudience.value === 'all_vendors') return 'All Verified Vendors'
  if (targetAudience.value === 'all_users') return 'All Registered Profiles'
  if (targetAudience.value === 'custom') {
    return `${customRecipientsTags.value.length} Custom Recipient(s)`
  }
  if (targetAudience.value === 'dynamic') {
    const roleText = dynamicRole.value === 'all' ? 'All Roles' : `${dynamicRole.value}s`
    return `Dynamic Segment (${roleText} matching ${conditions.value.length} rule(s))`
  }
  return 'Unknown Audience'
})

const confirmTimeDescription = computed(() => {
  if (scheduleMode.value === 'immediate') return 'Send Immediately (on the next cycle)'
  if (!emailScheduledAt.value) return 'Not set'
  return formatDate(emailScheduledAt.value)
})

const formatConditionField = (field: string) => {
  const map: Record<string, string> = {
    walletBalance: 'Wallet Balance (₦)',
    lastLogin: 'Days since last login',
    orderCount: 'Total order count',
    status: 'Account Status',
  }
  return map[field] || field
}

const formatConditionOp = (op: string) => {
  const map: Record<string, string> = {
    eq: 'is',
    ne: 'is not',
    gt: 'greater than',
    lt: 'less than',
    gte: 'greater than or equal to',
    lte: 'less than or equal to',
  }
  return map[op] || op
}

// Dynamic Targeting Segment Filters
interface Condition {
  logical?: 'AND' | 'OR'
  field: 'walletBalance' | 'lastLogin' | 'orderCount' | 'status'
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte'
  value: any
}
const dynamicRole = ref('all')
const conditions = ref<Condition[]>([
  { field: 'walletBalance', operator: 'gte', value: 0 }
])

const addConditionRow = () => {
  conditions.value.push({
    logical: 'AND',
    field: 'walletBalance',
    operator: 'gte',
    value: 0
  })
}

const removeConditionRow = (index: number) => {
  conditions.value.splice(index, 1)
}

const handleFieldChange = (index: number) => {
  const cond = conditions.value[index]
  if (!cond) return
  if (cond.field === 'status') {
    cond.operator = 'eq'
    cond.value = 'active'
  } else {
    cond.operator = 'gte'
    cond.value = 0
  }
}

// Preview State
const previewTab = ref<'edit' | 'preview'>('edit')

const csvFileInput = ref<HTMLInputElement | null>(null)
const dateTimeInput = ref<HTMLInputElement | null>(null)

const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  search: debouncedSearchQuery.value.trim() || undefined,
}))

const { data, isLoading: loading, error } = useAdminEmailSchedules(() => listParams.value)
const schedules = computed(() => data.value?.schedules || [])
const total = computed(() => data.value?.total || 0)

const { data: templatesData } = useAdminTemplates()
const templates = computed(() => templatesData.value || [])

const scheduleEmailMutation = useScheduleEmail()

watch(debouncedSearchQuery, () => {
  page.value = 1
})

const handlePageChange = (p: number) => {
  page.value = p
}

// Visual Tag Input Handlers
const addRecipientTag = () => {
  const email = recipientInput.value.replace(/,/g, '').trim().toLowerCase()
  if (!email) return
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.')
    return
  }
  if (!customRecipientsTags.value.includes(email)) {
    customRecipientsTags.value.push(email)
  }
  recipientInput.value = ''
}

const removeRecipientTag = (index: number) => {
  customRecipientsTags.value.splice(index, 1)
}

const handleInputKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addRecipientTag()
  } else if (event.key === 'Backspace' && !recipientInput.value) {
    customRecipientsTags.value.pop()
  }
}

// CSV Parsing
const handleCSVUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    if (!text) return
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matched = text.match(emailRegex) || []

    let addedCount = 0
    matched.forEach((email) => {
      const formatted = email.toLowerCase().trim()
      if (!customRecipientsTags.value.includes(formatted)) {
        customRecipientsTags.value.push(formatted)
        addedCount++
      }
    })

    alert(`Successfully parsed CSV. Imported ${addedCount} unique email addresses!`)
    const inputElement = event.target as HTMLInputElement
    inputElement.value = ''
  }
  reader.readAsText(file)
}

const isRichEditor = ref(true)
const quillEditorRef = ref<HTMLDivElement | null>(null)
let quillInstance: any = null

const initQuill = () => {
  nextTick(() => {
    if (!quillEditorRef.value) return
    
    if (quillInstance) {
      quillInstance = null
      quillEditorRef.value.innerHTML = ''
    }

    quillInstance = new Quill(quillEditorRef.value, {
      theme: 'snow',
      placeholder: 'Compose email content with dynamic placeholders...',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
        ],
      },
    })

    quillInstance.root.innerHTML = emailBody.value || ''

    quillInstance.on('text-change', () => {
      emailBody.value = quillInstance.root.innerHTML
    })
  })
}

const toggleEditorMode = () => {
  if (isRichEditor.value) {
    if (quillInstance) {
      emailBody.value = quillInstance.root.innerHTML
    }
    isRichEditor.value = false
  } else {
    isRichEditor.value = true
    initQuill()
  }
}

watch(showCreateModal, (newVal) => {
  if (newVal) {
    isRichEditor.value = true
    initQuill()
    scheduleMode.value = 'immediate'
    emailScheduledAt.value = ''
  } else {
    quillInstance = null
  }
})

const handleTemplateSelect = () => {
  if (!selectedTemplateId.value) return
  const matched = templates.value.find((t) => t.id === selectedTemplateId.value)
  if (matched) {
    emailSubject.value = matched.subject
    emailBody.value = matched.body
    
    if (isRichEditor.value && quillInstance) {
      quillInstance.root.innerHTML = matched.body
    }
  }
}

const handleComposeSubmit = async () => {
  if (!emailSubject.value || !emailBody.value || (scheduleMode.value === 'later' && !emailScheduledAt.value)) {
    composeError.value = 'Subject, body content, and schedule date/time are required'
    return
  }

  if (targetAudience.value === 'custom') {
    if (customRecipientsTags.value.length === 0) {
      composeError.value = 'Please insert at least one custom email address recipient'
      return
    }
  } else if (targetAudience.value === 'dynamic') {
    if (conditions.value.length === 0) {
      composeError.value = 'Please add at least one dynamic targeting condition'
      return
    }
  }

  showConfirmModal.value = true
}

const confirmAndSubmitCompose = async () => {
  showConfirmModal.value = false
  composeLoading.value = true
  composeError.value = ''

  let toValue = targetAudience.value
  let targetingFiltersValue: any = null

  if (targetAudience.value === 'custom') {
    toValue = customRecipientsTags.value.join(',')
  } else if (targetAudience.value === 'dynamic') {
    toValue = 'dynamic'
    targetingFiltersValue = {
      role: dynamicRole.value,
      conditions: conditions.value.map((c, idx) => {
        const cond: any = {
          field: c.field,
          operator: c.operator,
          value: c.field === 'status' ? c.value : Number(c.value),
        }
        if (idx > 0) {
          cond.logical = c.logical || 'AND'
        }
        return cond
      }),
    }
  }

  try {
    const scheduledDateIso = scheduleMode.value === 'immediate'
      ? new Date().toISOString()
      : new Date(emailScheduledAt.value).toISOString()

    await scheduleEmailMutation.mutateAsync({
      to: toValue,
      subject: emailSubject.value,
      body: emailBody.value,
      scheduledAt: scheduledDateIso,
      targetingFilters: targetingFiltersValue,
    })

    showCreateModal.value = false
    emailSubject.value = ''
    emailBody.value = ''
    emailScheduledAt.value = ''
    customRecipientsTags.value = []
    selectedTemplateId.value = ''
    previewTab.value = 'edit'
    
    // reset condition builder defaults
    dynamicRole.value = 'all'
    conditions.value = [{ field: 'walletBalance', operator: 'gte', value: 0 }]
    scheduleMode.value = 'immediate'
  } catch (err: any) {
    composeError.value = err.message || 'Failed to schedule campaign.'
  } finally {
    composeLoading.value = false
  }
}

// Live Compiler Preview Renderer
const getCompiledPreview = (text: string) => {
  if (!text) return ''
  const mockUser = {
    name: 'Ade Johnson',
    email: 'adeola@example.com',
    phone: '+2348012345678',
    walletBalance: '₦15,000.00',
    role: 'consumer',
  }
  let compiled = text
  for (const [key, value] of Object.entries(mockUser)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    compiled = compiled.replace(regex, value)
  }
  return compiled
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Scheduled Campaigns</h2>
          <p class="text-text-sub text-sm mt-1">Compose newsletters, system alerts, or marketing broadcasts and schedule them.</p>
        </div>

        <div>
          <button
            @click="showCreateModal = true"
            class="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all text-sm cursor-pointer"
          >
            ✉️ Schedule Broadcast
          </button>
        </div>
      </div>

      <!-- Search Toolbar -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex items-center justify-between gap-4">
        <div class="text-xs font-bold text-text-muted uppercase tracking-wide">
          Total matched: {{ total }}
        </div>
        <div class="relative w-full md:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search target, subject, content..."
            class="w-full bg-surface-base border border-border-strong rounded-xl pl-9 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-orange-500"
          />
          <span class="absolute left-3 top-2.5 text-text-muted text-xs">🔍</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="schedules.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">📅</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Scheduled Emails</h3>
        <p class="text-text-sub text-sm max-w-sm">No email dispatches match your search filters. Click 'Schedule Broadcast' to schedule a newsletter.</p>
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
        >
          Clear Search
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="bg-surface-raised border border-border-subtle rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-border-subtle bg-surface-base/30 text-xs font-bold uppercase tracking-wider text-text-muted">
                <th class="py-4 px-6">Campaign Subject</th>
                <th class="py-4 px-6">Audience Target</th>
                <th class="py-4 px-6">Scheduled Dispatch</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6">Error Log</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr
                v-for="s in schedules"
                :key="s.id"
                @click="openDetails(s)"
                class="hover:bg-surface-base/20 text-sm cursor-pointer transition-colors"
              >
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main truncate max-w-xs">{{ s.subject }}</div>
                  <div class="text-[10px] text-text-muted font-mono mt-0.5">ID: {{ s.id }}</div>
                </td>
                <td class="py-4 px-6">
                  <span
                    v-if="s.to.startsWith('all_')"
                    class="bg-surface-base border border-border-strong text-[10px] font-bold uppercase px-2 py-0.5 rounded text-orange-500"
                  >
                    {{ s.to.replace('all_', 'All ') }}
                  </span>
                  <span v-else class="text-text-sub font-mono text-xs truncate max-w-[150px] inline-block">
                    {{ s.to }}
                  </span>
                </td>
                <td class="py-4 px-6 text-text-sub text-xs">
                  {{ formatDate(s.scheduledAt) }}
                </td>
                <td class="py-4 px-6">
                  <span
                    :class="{
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20': s.status === 'pending',
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': s.status === 'sent',
                      'bg-red-500/10 text-red-500 border border-red-500/20': s.status === 'failed',
                    }"
                    class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="py-4 px-6 max-w-xs">
                  <div v-if="s.error" class="text-xs text-red-400 font-light truncate" :title="s.error">
                    {{ s.error }}
                  </div>
                  <div v-else class="text-xs text-text-muted font-light">—</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 bg-surface-base/30 border-t border-border-subtle flex items-center justify-between">
          <div class="text-xs text-text-muted">
            Showing {{ ((page - 1) * pageSize) + 1 }} to {{ Math.min(page * pageSize, total) }} of {{ total }} records
          </div>
          <div class="flex gap-2">
            <button
              :disabled="page <= 1"
              @click="handlePageChange(page - 1)"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              :disabled="page * pageSize >= total"
              @click="handlePageChange(page + 1)"
              class="px-3 py-1.5 bg-surface-base hover:bg-surface-raised border border-border-strong rounded-lg text-xs disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Compose/Schedule Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div class="bg-surface-raised border border-border-subtle w-full max-w-5xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 flex-shrink-0">
          <div>
            <h3 class="text-xl font-black text-text-main tracking-tight font-display">Schedule Campaign Broadcast</h3>
            <p class="text-xs text-text-sub mt-0.5">Filter targets using dynamic segment rules, schedule schedules, and compose templates.</p>
          </div>
          <button @click="showCreateModal = false" class="text-text-muted hover:text-text-main transition-colors text-lg p-1.5 hover:bg-surface-base rounded-full cursor-pointer border-none bg-transparent">
            ❌
          </button>
        </div>

        <!-- Error Feedback Banner -->
        <div v-if="composeError" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs flex-shrink-0 mb-4 font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ composeError }}</span>
        </div>

        <!-- Main Body: Two-Column Split Layout -->
        <div class="flex-1 overflow-y-auto pr-1 grid grid-cols-1 lg:grid-cols-12 gap-8 py-2">
          
          <!-- LEFT SIDEBAR: Targeting & Timing (5 Cols) -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Block 1: Target Audience Selection -->
            <div class="bg-surface-base/30 border border-border-strong rounded-2xl p-5 space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <span>🎯</span> Recipient Segmentation
              </h4>
              
              <div class="space-y-3">
                <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">Target Group Mode</label>
                <select v-model="targetAudience" class="w-full bg-surface-base border border-border-strong rounded-xl px-3.5 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold">
                  <option value="all_customers">All Registered Consumers</option>
                  <option value="all_vendors">All Verified Vendors</option>
                  <option value="all_users">All Registered Profiles</option>
                  <option value="dynamic">🔍 Dynamic Target Segment</option>
                  <option value="custom">✏️ Custom Email Addresses</option>
                </select>
              </div>

              <!-- Dispatch Time Scheduler -->
              <div class="space-y-3">
                <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">Dispatch Timing</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    @click="scheduleMode = 'immediate'; emailScheduledAt = ''"
                    :class="scheduleMode === 'immediate' ? 'bg-orange-600 text-white border-orange-600' : 'bg-surface-base border-border-strong text-text-sub hover:text-text-main'"
                    class="py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    ⚡ Send Immediately
                  </button>
                  <button
                    type="button"
                    @click="scheduleMode = 'later'; initLaterTime()"
                    :class="scheduleMode === 'later' ? 'bg-orange-600 text-white border-orange-600' : 'bg-surface-base border-border-strong text-text-sub hover:text-text-main'"
                    class="py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>📅</span> Schedule Later
                  </button>
                </div>

                <!-- DateTime Picker (visible only when scheduleMode is 'later') -->
                <div v-if="scheduleMode === 'later'" class="space-y-2 pt-1">
                  <div class="relative flex items-center">
                    <input
                      ref="dateTimeInput"
                      v-model="emailScheduledAt"
                      type="datetime-local"
                      @click="showNativePicker"
                      @focus="showNativePicker"
                      class="w-full bg-surface-base border border-border-strong rounded-xl pl-3 pr-10 py-2 text-text-main focus:outline-none focus:border-orange-500 text-xs font-semibold cursor-pointer"
                    />
                    <button
                      type="button"
                      @click="showNativePicker"
                      class="absolute right-3 text-text-muted hover:text-text-main text-xs border-none bg-transparent cursor-pointer"
                    >
                      📅
                    </button>
                  </div>
                  <p class="text-[9px] text-text-muted leading-relaxed">Select a future date and time for automated dispatch.</p>
                </div>
                
                <div v-else class="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                  <p class="text-[10px] text-orange-500 font-semibold leading-relaxed">
                    Broadcast will be queued and sent out instantly on the next minute dispatch cycle.
                  </p>
                </div>
              </div>
            </div>

            <!-- Block 2: Custom Recipients Tag Input + CSV Import (Conditionally Rendered) -->
            <div v-if="targetAudience === 'custom'" class="bg-surface-base/30 border border-border-strong rounded-2xl p-5 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold uppercase tracking-wider text-text-main">Custom Recipients</h4>
                <div class="flex items-center">
                  <input type="file" ref="csvFileInput" accept=".csv" class="hidden" @change="handleCSVUpload" />
                  <button @click="csvFileInput?.click()" type="button" class="text-[10px] bg-orange-500/10 border border-orange-500/20 px-2.5 py-1.5 rounded-lg text-orange-500 hover:bg-orange-500/20 cursor-pointer font-bold transition-all">
                    📎 Upload CSV File
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div class="w-full bg-surface-base border border-border-strong rounded-xl p-3 flex flex-wrap gap-1.5 min-h-[90px] items-start">
                  <span
                    v-for="(tag, idx) in customRecipientsTags"
                    :key="tag"
                    class="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold"
                  >
                    {{ tag }}
                    <button type="button" @click="removeRecipientTag(idx)" class="text-orange-500 hover:text-orange-600 font-bold cursor-pointer">×</button>
                  </span>

                  <input
                    v-model="recipientInput"
                    type="text"
                    placeholder="Type email and press enter..."
                    @keydown="handleInputKeyDown"
                    @blur="addRecipientTag"
                    class="flex-1 min-w-[150px] bg-transparent text-text-main border-none focus:outline-none text-xs h-6 py-0 px-1 font-mono"
                  />
                </div>
                <p class="text-[9px] text-text-muted leading-relaxed">Press Enter, Comma or blur target field to submit an email.</p>
              </div>
            </div>

            <!-- Block 3: Dynamic Pipeline Filter Builder (Conditionally Rendered) -->
            <div v-if="targetAudience === 'dynamic'" class="bg-surface-base/30 border border-border-strong rounded-2xl p-5 space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <span>⚡</span> Pipeline Condition Builder
              </h4>
              
              <!-- Role selector for segment -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">Target User Group</label>
                <select v-model="dynamicRole" class="w-full bg-surface-base border border-border-strong rounded-xl px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-xs font-semibold">
                  <option value="all">All Users</option>
                  <option value="consumer">Consumers Only</option>
                  <option value="vendor">Vendors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <!-- Conditions List -->
              <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 pl-1 py-3 border border-border-strong/10 rounded-xl">
                <div v-for="(cond, idx) in conditions" :key="idx" class="space-y-2.5 p-1">
                  <!-- Logical operator connector (OR/AND row) -->
                  <div v-if="idx > 0" class="flex items-center gap-2 pt-2 border-t border-border-strong/50">
                    <select v-model="cond.logical" class="bg-surface-raised border border-border-strong rounded-lg px-2 py-1 text-[10px] text-orange-500 font-extrabold focus:outline-none cursor-pointer uppercase">
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                    <span class="text-[9px] text-text-muted font-bold uppercase tracking-wider">Condition:</span>
                  </div>

                  <!-- Row controls -->
                  <div class="grid grid-cols-12 gap-2 items-center">
                    <!-- Field selection -->
                    <div class="col-span-5">
                      <select v-model="cond.field" @change="handleFieldChange(idx)" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main text-xs focus:outline-none">
                        <option value="walletBalance">Wallet Balance (₦)</option>
                        <option value="lastLogin">Days since Last Login</option>
                        <option value="orderCount">Total Order Count</option>
                        <option value="status">Account Status</option>
                      </select>
                    </div>

                    <!-- Operator -->
                    <div class="col-span-3">
                      <select v-model="cond.operator" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-2 text-text-main text-xs focus:outline-none">
                        <template v-if="cond.field === 'status'">
                          <option value="eq">Is</option>
                          <option value="ne">Is not</option>
                        </template>
                        <template v-else>
                          <option value="eq">==</option>
                          <option value="ne">!=</option>
                          <option value="gt">&gt;</option>
                          <option value="lt">&lt;</option>
                          <option value="gte">&gt;=</option>
                          <option value="lte">&lt;=</option>
                        </template>
                      </select>
                    </div>

                    <!-- Value -->
                    <div class="col-span-3">
                      <select v-if="cond.field === 'status'" v-model="cond.value" class="w-full bg-surface-base border border-border-strong rounded-lg px-2.5 py-2 text-text-main text-xs focus:outline-none">
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <input v-else v-model="cond.value" type="number" min="0" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main text-xs focus:outline-none font-semibold" />
                    </div>

                    <!-- Delete button -->
                    <div class="col-span-1 text-center">
                      <button @click="removeConditionRow(idx)" type="button" class="text-red-500 hover:text-red-600 font-bold text-sm cursor-pointer p-1 bg-transparent border-none">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add condition button -->
              <button @click="addConditionRow" type="button" class="w-full bg-surface-base hover:bg-surface-raised border border-dashed border-border-strong rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs text-orange-500 font-bold transition-all cursor-pointer">
                <span>➕</span> Add Filtering Condition
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: Campaign Template Composer (7 Cols) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Template profiles selector -->
            <div class="bg-surface-base/30 border border-border-strong rounded-2xl p-5 space-y-3">
              <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">Load Template Profile</label>
              <select v-model="selectedTemplateId" @change="handleTemplateSelect" class="w-full bg-surface-base border border-border-strong rounded-xl px-3.5 py-3 text-text-main focus:outline-none text-sm font-semibold">
                <option value="">None (Custom Broadcast)</option>
                <option v-for="t in templates" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </div>

            <!-- Content Workspace Tabs -->
            <div class="border-b border-border-subtle flex">
              <button
                type="button"
                @click="previewTab = 'edit'"
                :class="previewTab === 'edit' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-text-muted'"
                class="px-5 py-2.5 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer font-black bg-transparent"
              >
                Compose Campaign
              </button>
              <button
                type="button"
                @click="previewTab = 'preview'"
                :class="previewTab === 'preview' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-text-muted'"
                class="px-5 py-2.5 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer font-black bg-transparent"
              >
                👁️ Live Subject &amp; HTML Preview
              </button>
            </div>

            <!-- Compose Mode -->
            <div v-show="previewTab === 'edit'" class="space-y-4">
              <!-- Subject -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">Campaign Email Subject</label>
                <input v-model="emailSubject" type="text" placeholder="Don't miss out on fresh weekend surplus! 🍲" class="w-full bg-surface-base border border-border-strong rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-orange-500 text-sm font-semibold" />
              </div>

              <!-- Body Rich Text Editor -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="block text-[10px] font-bold uppercase tracking-wide text-text-sub">HTML Email Body</label>
                  <button
                    type="button"
                    @click="toggleEditorMode"
                    class="text-[9px] bg-surface-base border border-border-strong px-2.5 py-1 rounded-lg text-text-sub hover:text-text-main cursor-pointer font-semibold transition-all"
                  >
                    Switch to {{ isRichEditor ? 'Raw HTML Code' : 'Rich Editor' }}
                  </button>
                </div>

                <!-- Rich text editor container -->
                <div v-show="isRichEditor" class="bg-surface-base rounded-xl border border-border-strong overflow-hidden text-text-main">
                  <div ref="quillEditorRef" class="min-h-[220px] max-h-[350px] overflow-y-auto"></div>
                </div>

                <!-- HTML text area -->
                <textarea
                  v-show="!isRichEditor"
                  v-model="emailBody"
                  rows="9"
                  placeholder="<p>Hello saving stars!</p><p>We have massive surplus bags waiting for you today at Mama Titi Kitchen...</p>"
                  class="w-full bg-surface-base border border-border-strong rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-orange-500 text-xs font-mono leading-relaxed"
                ></textarea>
              </div>

              <!-- Placeholder guidelines help -->
              <div v-pre class="bg-surface-base/50 border border-border-strong rounded-xl p-3">
                <span class="text-[10px] font-bold text-text-sub uppercase tracking-wider block">Dynamic Interpolation tags:</span>
                <div class="flex flex-wrap gap-2 mt-1.5">
                  <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500 font-semibold font-mono">{{name}}</code>
                  <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500 font-semibold font-mono">{{email}}</code>
                  <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500 font-semibold font-mono">{{phone}}</code>
                  <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500 font-semibold font-mono">{{role}}</code>
                  <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500 font-semibold font-mono">{{walletBalance}}</code>
                </div>
              </div>
            </div>

            <!-- Compiled Live Preview Mode -->
            <div v-show="previewTab === 'preview'" class="space-y-4">
              <div class="bg-surface-base border border-border-strong rounded-2xl p-5 space-y-4">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Compiled Subject Line</span>
                  <div class="text-sm font-extrabold text-text-main mt-1 bg-surface-raised px-4 py-3 rounded-xl border border-border-subtle">
                    {{ getCompiledPreview(emailSubject) || '(Subject is empty)' }}
                  </div>
                </div>
                
                <div class="border-t border-border-subtle pt-4">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">HTML Body Live Render (Sample User Ade Johnson)</span>
                  <div
                    v-if="emailBody"
                    class="bg-white text-neutral-900 border border-neutral-200 rounded-2xl p-6 overflow-y-auto max-h-[300px] leading-relaxed text-sm font-sans"
                    v-html="getCompiledPreview(emailBody)"
                  ></div>
                  <div v-else class="text-xs text-text-muted italic py-6 text-center">No content composed to preview.</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer Actions Bar -->
        <div class="flex justify-end gap-3 border-t border-border-subtle pt-4 mt-4 flex-shrink-0">
          <button @click="showCreateModal = false" class="px-5 py-2.5 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-bold text-text-sub hover:text-text-main transition-all cursor-pointer">
            Cancel
          </button>
          <button @click="handleComposeSubmit" :disabled="composeLoading" class="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-black text-white shadow-lg shadow-orange-600/10 transition-all cursor-pointer">
            {{ composeLoading ? 'Scheduling Campaign...' : '💾 Schedule Broadcast Campaign' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Campaign Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-strong w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header / Icon -->
        <div class="flex flex-col items-center text-center space-y-3">
          <div class="w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-full flex items-center justify-center text-2xl text-orange-500">
            ✉️
          </div>
          <div>
            <h3 class="text-lg font-black text-text-main tracking-tight font-display">Confirm Email Broadcast</h3>
            <p class="text-xs text-text-sub mt-1">Please verify campaign details before dispatching.</p>
          </div>
        </div>

        <!-- Details Box -->
        <div class="bg-surface-base border border-border-subtle rounded-2xl p-4 space-y-3.5 text-xs">
          <div class="flex justify-between items-start gap-4">
            <span class="text-text-muted font-semibold uppercase tracking-wider text-[9px]">Target Audience</span>
            <span class="text-text-main font-bold text-right">{{ confirmTargetDescription }}</span>
          </div>
          <div class="flex justify-between items-start gap-4 border-t border-border-subtle/50 pt-3">
            <span class="text-text-muted font-semibold uppercase tracking-wider text-[9px]">Dispatch Schedule</span>
            <span class="text-orange-500 font-extrabold text-right">{{ confirmTimeDescription }}</span>
          </div>
          <div class="flex flex-col gap-1 border-t border-border-subtle/50 pt-3">
            <span class="text-text-muted font-semibold uppercase tracking-wider text-[9px]">Campaign Subject</span>
            <span class="text-text-main font-semibold break-words leading-relaxed">{{ emailSubject }}</span>
          </div>
        </div>

        <!-- Warning Alert -->
        <div class="bg-red-500/5 border border-red-500/15 rounded-xl p-3 text-[10px] text-red-400 font-semibold leading-relaxed flex gap-2">
          <span>⚠️</span>
          <span>This action will queue the campaign. Once sent, emails cannot be retracted.</span>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            @click="showConfirmModal = false"
            class="py-3 bg-surface-base border border-border-strong hover:bg-surface-raised rounded-xl text-xs font-bold text-text-sub hover:text-text-main transition-all cursor-pointer text-center"
          >
            Go Back
          </button>
          <button
            type="button"
            @click="confirmAndSubmitCompose"
            class="py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-black text-white shadow-lg shadow-orange-600/20 active:scale-98 transition-all cursor-pointer text-center"
          >
            Confirm &amp; Send
          </button>
        </div>

      </div>
    </div>

    <!-- Campaign Details Modal -->
    <div v-if="showDetailsModal && selectedCampaign" class="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle w-full max-w-3xl rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-border-subtle pb-4 mb-4 flex-shrink-0">
          <div>
            <h3 class="text-lg font-black text-text-main tracking-tight font-display">Campaign Details</h3>
            <p class="text-xs text-text-sub mt-0.5">Campaign ID: <span class="font-mono">{{ selectedCampaign.id }}</span></p>
          </div>
          <button @click="showDetailsModal = false" class="text-text-muted hover:text-text-main transition-colors text-lg p-1.5 hover:bg-surface-base rounded-full cursor-pointer border-none bg-transparent">
            ❌
          </button>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="flex-1 overflow-y-auto pr-1 space-y-6 py-4">
          <!-- Meta Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Dispatched Status -->
            <div class="bg-surface-base border border-border-subtle rounded-2xl p-4 flex flex-col justify-between">
              <span class="text-[9px] font-bold uppercase tracking-wider text-text-muted">Campaign Status</span>
              <div class="mt-2.5 flex items-center">
                <span
                  :class="{
                    'bg-amber-500/10 text-amber-500 border border-amber-500/20': selectedCampaign.status === 'pending',
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20': selectedCampaign.status === 'sent',
                    'bg-red-500/10 text-red-500 border border-red-500/20': selectedCampaign.status === 'failed',
                  }"
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                >
                  {{ selectedCampaign.status }}
                </span>
              </div>
            </div>

            <!-- Scheduled Dispatch -->
            <div class="bg-surface-base border border-border-subtle rounded-2xl p-4 flex flex-col justify-between">
              <span class="text-[9px] font-bold uppercase tracking-wider text-text-muted">Scheduled Dispatch</span>
              <div class="text-xs font-bold text-text-main mt-2.5">
                {{ formatDate(selectedCampaign.scheduledAt) }}
              </div>
            </div>

            <!-- Total Recipients reached -->
            <div class="bg-surface-base border border-border-subtle rounded-2xl p-4 flex flex-col justify-between">
              <span class="text-[9px] font-bold uppercase tracking-wider text-text-muted">Recipients Reached</span>
              <div class="text-xs font-bold text-orange-500 mt-2.5 flex items-center gap-1.5">
                <span class="text-base font-black">{{ selectedCampaign.recipientCount !== undefined ? selectedCampaign.recipientCount : '—' }}</span>
                <span class="text-[10px] text-text-muted font-normal">(Users evaluated at dispatch)</span>
              </div>
            </div>
          </div>

          <!-- Error Alert (visible only when status is 'failed') -->
          <div v-if="selectedCampaign.status === 'failed' && selectedCampaign.error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-xs space-y-1">
            <span class="font-bold block">⚠️ Campaign Dispatch Failure Trace:</span>
            <p class="font-mono break-all leading-relaxed whitespace-pre-wrap">{{ selectedCampaign.error }}</p>
          </div>

          <!-- Targeting Filters Info -->
          <div class="bg-surface-base border border-border-strong rounded-2xl p-5 space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
              <span>🎯</span> Targeting Segment &amp; Pipeline Filters
            </h4>

            <div class="space-y-3.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-text-sub font-semibold">Audience Group Mode:</span>
                <span class="bg-surface-raised border border-border-subtle text-[10px] font-bold uppercase px-2 py-0.5 rounded text-orange-500">
                  {{ selectedCampaign.to.startsWith('all_') ? selectedCampaign.to.replace('all_', 'All ') : (selectedCampaign.to === 'dynamic' ? '🔍 Dynamic Pipeline' : '✏️ Custom Recipient List') }}
                </span>
              </div>

              <!-- If targeted to a custom recipient list -->
              <div v-if="!selectedCampaign.to.startsWith('all_') && selectedCampaign.to !== 'dynamic'" class="space-y-1.5 border-t border-border-subtle/50 pt-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Direct Recipients:</span>
                <div class="max-h-[120px] overflow-y-auto bg-surface-raised border border-border-subtle rounded-xl p-3 text-xs font-mono text-text-main leading-relaxed whitespace-normal break-all">
                  {{ selectedCampaign.to }}
                </div>
              </div>

              <!-- If dynamic pipeline targets are applied -->
              <div v-if="selectedCampaign.targetingFilters" class="space-y-3 border-t border-border-subtle/50 pt-3">
                <div class="flex items-center justify-between">
                  <span class="text-text-sub font-semibold">Target User Group:</span>
                  <span class="text-text-main font-bold capitalize">{{ selectedCampaign.targetingFilters.role || 'all' }}</span>
                </div>

                <div class="space-y-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Pipeline Conditions:</span>
                  <div class="bg-surface-raised border border-border-subtle rounded-xl p-3.5 space-y-2.5">
                    <div
                      v-for="(cond, idx) in selectedCampaign.targetingFilters.conditions || []"
                      :key="idx"
                      class="flex flex-wrap items-center gap-1.5 text-xs text-text-main font-semibold"
                    >
                      <span v-if="Number(idx) > 0" class="text-orange-500 font-extrabold uppercase text-[10px] bg-orange-500/10 px-1.5 py-0.5 rounded mr-1">
                        {{ cond.logical || 'AND' }}
                      </span>
                      <span>User</span>
                      <span class="text-orange-500 font-bold font-mono">{{ formatConditionField(cond.field) }}</span>
                      <span class="text-text-sub font-medium">{{ formatConditionOp(cond.operator) }}</span>
                      <span class="text-orange-500 font-bold font-mono bg-surface-base px-2 py-0.5 rounded border border-border-strong/50">{{ cond.value }}</span>
                    </div>
                    <div v-if="!(selectedCampaign.targetingFilters.conditions?.length)" class="text-xs text-text-muted italic">
                      No condition filters applied (Sent directly to group).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sent Recipients List (Only visible if dispatched with recipients) -->
          <div v-if="selectedCampaign.status === 'sent' && selectedCampaign.sentRecipients && selectedCampaign.sentRecipients.length" class="bg-surface-base border border-border-strong rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                <span>👥</span> Dispatched Recipient Emails
              </h4>
              <span class="text-[10px] text-text-muted font-bold font-mono">Count: {{ selectedCampaign.sentRecipients.length }}</span>
            </div>
            <div class="bg-surface-raised border border-border-subtle rounded-xl p-3.5 max-h-[140px] overflow-y-auto space-y-1.5">
              <div v-for="email in selectedCampaign.sentRecipients" :key="email" class="text-xs font-mono text-text-main hover:text-orange-500 transition-colors py-0.5">
                📧 {{ email }}
              </div>
            </div>
          </div>

          <!-- HTML Body Preview -->
          <div class="bg-surface-base border border-border-strong rounded-2xl p-5 space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
              <span>📄</span> Campaign Content (Compiled Template)
            </h4>
            <div class="border border-border-subtle rounded-2xl overflow-hidden bg-white text-neutral-900">
              <div class="bg-neutral-100 border-b border-neutral-200 px-5 py-3 text-xs flex justify-between items-center text-neutral-600">
                <span class="truncate max-w-[60%]"><strong>Subject:</strong> {{ selectedCampaign.subject }}</span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="copyRawCampaignContent"
                    class="text-[10px] bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-2 py-0.5 rounded transition-all cursor-pointer font-semibold flex items-center gap-1 border-none active:scale-95"
                  >
                    📋 {{ copyStateText }}
                  </button>
                  <span class="text-[10px] font-mono bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">HTML View</span>
                </div>
              </div>
              <div
                class="p-6 overflow-y-auto max-h-[250px] leading-relaxed text-sm font-sans"
                v-html="getCompiledPreview(selectedCampaign.body)"
              ></div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-end border-t border-border-subtle pt-4 mt-4 flex-shrink-0">
          <button @click="showDetailsModal = false" class="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-98 rounded-xl text-xs font-black text-white shadow-lg shadow-orange-600/20 transition-all cursor-pointer">
            Close Details
          </button>
        </div>

      </div>
    </div>
  </AdminLayout>
</template>
