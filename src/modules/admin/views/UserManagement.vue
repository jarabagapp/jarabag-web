<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue'
import { refDebounced } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '../components/AdminLayout.vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import {
  useAdminUsers,
  useAdminRoles,
  useCreateAdmin,
  useUpdateAdminPermissions,
  useToggleBlockUser,
  useAdminTemplates,
  useScheduleEmail,
} from '../composables/useAdminQuery'

interface RoleRecord {
  id: string
  _id?: string
  name: string
  permissions: string[]
}

interface UserRecord {
  id: string
  name: string
  email: string | null
  phone: string
  role: 'consumer' | 'vendor' | 'admin' | 'superadmin'
  permissions?: string[]
  customRole: RoleRecord | null
  isBlocked: boolean
  createdAt: string
}

const authStore = useAuthStore()

const page = ref(1)
const pageSize = ref(10)

// Filters & Search
const filterRole = ref('')
const searchQuery = ref('')
const debouncedSearchQuery = refDebounced(searchQuery, 300)

// Computed Query Parameters
const listParams = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  role: filterRole.value || undefined,
  search: debouncedSearchQuery.value.trim() || undefined,
}))

// Queries
const { data, isLoading: loading, error } = useAdminUsers(() => listParams.value)
const users = computed<UserRecord[]>(() => (data.value?.users as any) || [])
const total = computed(() => data.value?.total || 0)

const { data: rolesData } = useAdminRoles()
const customRolesList = computed(() => rolesData.value || [])

const { data: templatesData } = useAdminTemplates()
const mailTemplates = computed(() => templatesData.value || [])

// Mutations
const createAdminMutation = useCreateAdmin()
const updatePermissionsMutation = useUpdateAdminPermissions()
const toggleBlockUserMutation = useToggleBlockUser()
const scheduleEmailMutation = useScheduleEmail()

// Create User States
const showCreateModal = ref(false)
const newName = ref('')
const newEmail = ref('')
const newPhone = ref('')
const newPassword = ref('')
const newRole = ref<'admin' | 'superadmin'>('admin')
const newCustomRole = ref<string>('') // Role ID
const newPermissions = ref<string[]>([])
const createError = ref('')
const createLoading = ref(false)

// Permissions Editor States
const showPermissionsModal = ref(false)
const editingUser = ref<UserRecord | null>(null)
const selectedCustomRole = ref<string>('') // Role ID
const selectedPermissions = ref<string[]>([])
const permissionsLoading = ref(false)

// Send Mail Modal States
const showMailModal = ref(false)
const selectedMailUser = ref<UserRecord | null>(null)
const mailTemplateId = ref('')
const mailSubject = ref('')
const mailBody = ref('')
const mailError = ref('')
const mailLoading = ref(false)
const previewTab = ref<'edit' | 'preview'>('edit')
const isRichEditor = ref(true)
const quillEditorRef = ref<HTMLDivElement | null>(null)
let quillInstance: any = null


const allSystemPermissions = [
  { value: 'manage_vendors', label: 'Manage Vendors' },
  { value: 'manage_customers', label: 'Manage Customers' },
  { value: 'manage_payments', label: 'Manage Payments' },
  { value: 'schedule_emails', label: 'Schedule Emails' },
]

// Watchers for search/filter
watch([filterRole, debouncedSearchQuery], () => {
  page.value = 1
})

const handlePageChange = (p: number) => {
  page.value = p
}

const showBlockConfirmModal = ref(false)
const targetBlockUser = ref<UserRecord | null>(null)
const blockNotifyUser = ref(true)

const handleToggleBlock = (user: UserRecord) => {
  targetBlockUser.value = user
  blockNotifyUser.value = true
  showBlockConfirmModal.value = true
}

const confirmToggleBlock = async () => {
  if (!targetBlockUser.value) return
  try {
    const updatedStatus = !targetBlockUser.value.isBlocked
    await toggleBlockUserMutation.mutateAsync({
      id: targetBlockUser.value.id,
      isBlocked: updatedStatus,
      notify: blockNotifyUser.value,
    })
    showBlockConfirmModal.value = false
  } catch (err: any) {
    alert(err.message || 'Failed to update user block status.')
  }
}

const handleCreateAdminSubmit = async () => {
  if (!newName.value.trim() || !newEmail.value.trim() || !newPhone.value.trim()) {
    createError.value = 'Name, email, and phone number are required'
    return
  }

  createLoading.value = true
  createError.value = ''

  try {
    await createAdminMutation.mutateAsync({
      name: newName.value,
      email: newEmail.value,
      phone: newPhone.value,
      role: newRole.value,
      password: newPassword.value || undefined,
      customRole: newRole.value === 'admin' && newCustomRole.value ? newCustomRole.value : null,
      permissions: newRole.value === 'admin' && !newCustomRole.value ? newPermissions.value : [],
    })

    showCreateModal.value = false
    newName.value = ''
    newEmail.value = ''
    newPhone.value = ''
    newPassword.value = ''
    newCustomRole.value = ''
    newPermissions.value = []
  } catch (err: any) {
    createError.value = err.message || 'Failed to create admin profile.'
  } finally {
    createLoading.value = false
  }
}

const openPermissionsEditor = (user: UserRecord) => {
  editingUser.value = user
  selectedCustomRole.value = user.customRole?.id || user.customRole?._id || ''
  selectedPermissions.value = [...(user.permissions || [])]
  showPermissionsModal.value = true
}

const handleSavePermissions = async () => {
  if (!editingUser.value) return

  permissionsLoading.value = true
  try {
    await updatePermissionsMutation.mutateAsync({
      id: editingUser.value.id,
      dto: {
        permissions: selectedCustomRole.value ? [] : selectedPermissions.value,
        customRole: selectedCustomRole.value || null,
      },
    })
    showPermissionsModal.value = false
  } catch (err: any) {
    alert(err.message || 'Failed to update admin permissions.')
  } finally {
    permissionsLoading.value = false
  }
}

const openMailComposer = (user: UserRecord) => {
  selectedMailUser.value = user
  mailTemplateId.value = ''
  mailSubject.value = ''
  mailBody.value = ''
  mailError.value = ''
  showMailModal.value = true
}

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

    quillInstance.root.innerHTML = mailBody.value || ''

    quillInstance.on('text-change', () => {
      mailBody.value = quillInstance.root.innerHTML
    })
  })
}

const toggleEditorMode = () => {
  if (isRichEditor.value) {
    if (quillInstance) {
      mailBody.value = quillInstance.root.innerHTML
    }
    isRichEditor.value = false
  } else {
    isRichEditor.value = true
    initQuill()
  }
}

watch(showMailModal, (newVal) => {
  if (newVal) {
    isRichEditor.value = true
    initQuill()
  } else {
    quillInstance = null
  }
})

const handleTemplateSelect = () => {
  if (!mailTemplateId.value) {
    mailSubject.value = ''
    mailBody.value = ''
    if (isRichEditor.value && quillInstance) {
      quillInstance.root.innerHTML = ''
    }
    return
  }
  const matched = mailTemplates.value.find((t) => t.id === mailTemplateId.value)
  if (matched) {
    mailSubject.value = matched.subject
    mailBody.value = matched.body
    if (isRichEditor.value && quillInstance) {
      quillInstance.root.innerHTML = matched.body
    }
  }
}

const handleSendMail = async () => {
  if (!selectedMailUser.value || !selectedMailUser.value.email) {
    mailError.value = 'User does not have a valid email address.'
    return
  }
  if (isRichEditor.value && quillInstance) {
    mailBody.value = quillInstance.root.innerHTML
  }
  if (!mailSubject.value.trim() || !mailBody.value.trim()) {
    mailError.value = 'Subject and body content are required.'
    return
  }

  mailLoading.value = true
  mailError.value = ''
  try {
    await scheduleEmailMutation.mutateAsync({
      to: selectedMailUser.value.email,
      subject: mailSubject.value,
      body: mailBody.value,
      scheduledAt: new Date().toISOString(), // Send immediately
    })
    showMailModal.value = false
    alert(`Email sent successfully to ${selectedMailUser.value.email}!`)
  } catch (err: any) {
    mailError.value = err.message || 'Failed to send email.'
  } finally {
    mailLoading.value = false
  }
}

const getCompiledPreview = (text: string) => {
  if (!text) return ''
  const mockUser = {
    name: selectedMailUser.value?.name || 'User Name',
    email: selectedMailUser.value?.email || 'user@example.com',
    phone: selectedMailUser.value?.phone || '+23480...',
    role: selectedMailUser.value?.role || 'consumer',
  }
  let compiled = text
  for (const [key, value] of Object.entries(mockUser)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    compiled = compiled.replace(regex, value)
  }
  return compiled
}

// Helper to watch selected custom role and lock permissions checkbox list
const handleNewRoleChange = () => {
  if (newCustomRole.value) {
    const matched = customRolesList.value.find((r) => r.id === newCustomRole.value)
    if (matched) {
      newPermissions.value = [...matched.permissions]
    }
  } else {
    newPermissions.value = []
  }
}

const handleEditRoleChange = () => {
  if (selectedCustomRole.value) {
    const matched = customRolesList.value.find((r) => r.id === selectedCustomRole.value)
    if (matched) {
      selectedPermissions.value = [...matched.permissions]
    }
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">User Control Panel</h2>
          <p class="text-text-sub text-sm mt-1">Suspend profiles, override role permissions, and provision new admins.</p>
        </div>

        <div v-if="authStore.user?.role === 'superadmin'">
          <button
            @click="showCreateModal = true"
            class="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all text-sm cursor-pointer"
          >
            + Create Admin
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-surface-raised border border-border-subtle p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-text-muted uppercase tracking-wide">Role:</label>
            <select
              v-model="filterRole"
              class="bg-surface-base border border-border-strong rounded-lg px-3 py-1.5 text-sm text-text-main focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="consumer">Consumers</option>
              <option value="vendor">Vendors</option>
              <option value="admin">Admins</option>
              <option value="superadmin">Superadmins</option>
            </select>
          </div>
        </div>

        <div class="relative w-full md:w-80">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, phone..."
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
      <div v-else-if="users.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">👥</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Users Found</h3>
        <p class="text-text-sub text-sm max-w-sm">No accounts match your current filters or search query. Clear searches to reload.</p>
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
                <th class="py-4 px-6">Name</th>
                <th class="py-4 px-6">Email / Phone</th>
                <th class="py-4 px-6">Role</th>
                <th class="py-4 px-6">Mapped Access Profile</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="u in users" :key="u.id" class="hover:bg-surface-base/20 text-sm">
                <td class="py-4 px-6">
                  <div class="font-semibold text-text-main">{{ u.name }}</div>
                  <div class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">ID: {{ u.id }}</div>
                </td>
                <td class="py-4 px-6 text-text-sub">
                  <div>{{ u.email || '—' }}</div>
                  <div class="text-text-muted text-xs mt-0.5">{{ u.phone }}</div>
                </td>
                <td class="py-4 px-6">
                  <span
                    :class="{
                      'bg-orange-500/10 text-orange-500 border border-orange-500/20': u.role === 'superadmin',
                      'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20': u.role === 'admin',
                      'bg-blue-500/10 text-blue-500 border border-blue-500/20': u.role === 'vendor',
                      'bg-neutral-800 text-neutral-400 border border-neutral-700': u.role === 'consumer',
                    }"
                    class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <div v-if="u.role === 'superadmin'" class="text-xs text-text-muted font-light italic">
                    Bypasses all controls (full access)
                  </div>
                  <div v-else-if="u.role === 'admin'" class="space-y-1">
                    <div v-if="u.customRole" class="text-xs font-bold text-orange-500">
                      🛡️ Role: {{ u.customRole.name }}
                    </div>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="p in (u.customRole ? u.customRole.permissions : (u.permissions || []))"
                        :key="p"
                        class="bg-surface-base border border-border-strong text-[9px] text-text-sub px-2 py-0.5 rounded"
                      >
                        {{ p.replace('manage_', '').replace('schedule_', '') }}
                      </span>
                      <span v-if="!u.customRole && (!u.permissions || u.permissions.length === 0)" class="text-xs text-text-muted italic">
                        No permissions set
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-xs text-text-muted font-light">—</div>
                </td>
                <td class="py-4 px-6 text-right space-x-2">
                  <!-- Send Mail -->
                  <button
                    v-if="u.email"
                    @click="openMailComposer(u)"
                    class="text-xs text-blue-500 hover:text-blue-400 font-bold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors cursor-pointer"
                  >
                    Send Mail
                  </button>

                  <!-- Set Permissions for admins -->
                  <button
                    v-if="u.role === 'admin' && authStore.user?.role === 'superadmin'"
                    @click="openPermissionsEditor(u)"
                    class="text-xs text-orange-500 hover:text-orange-400 font-bold px-2 py-1 rounded hover:bg-orange-500/10 transition-colors cursor-pointer"
                  >
                    Manage Access
                  </button>

                  <!-- Block / Unblock -->
                  <button
                    v-if="u.role !== 'superadmin' && u.id !== authStore.user?.id"
                    @click="handleToggleBlock(u)"
                    :class="u.isBlocked ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'"
                    class="text-xs font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    {{ u.isBlocked ? 'Activate' : 'Suspend' }}
                  </button>
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

    <!-- Create Admin Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">Provision New Admin</h3>
          <p class="text-xs text-text-muted mt-1">Specify name, contacts, administrative tier, and access privileges.</p>
        </div>

        <div v-if="createError" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
          {{ createError }}
        </div>

        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Name</label>
              <input v-model="newName" type="text" placeholder="John Doe" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Phone</label>
              <input v-model="newPhone" type="text" placeholder="+234..." class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Email</label>
              <input v-model="newEmail" type="email" placeholder="admin@jarabag.com" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Default Password</label>
              <input v-model="newPassword" type="password" placeholder="••••••••" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Admin Tier</label>
              <select v-model="newRole" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none text-sm">
                <option value="admin">Standard Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            <div v-if="newRole === 'admin'">
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Select Custom Role</label>
              <select v-model="newCustomRole" @change="handleNewRoleChange" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none text-sm">
                <option value="">None (Explicit Overrides)</option>
                <option v-for="r in customRolesList" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Explicit Checkbox overrides (only if no customRole selected) -->
          <div v-if="newRole === 'admin'" class="pt-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">
              Permissions
              <span v-if="newCustomRole" class="text-orange-500 font-normal lowercase italic">(Inherited from role)</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="p in allSystemPermissions"
                :key="p.value"
                class="flex items-center p-2.5 bg-surface-base border border-border-strong rounded-lg cursor-pointer"
              >
                <input
                  v-model="newPermissions"
                  type="checkbox"
                  :value="p.value"
                  :disabled="!!newCustomRole"
                  class="accent-orange-600 rounded"
                />
                <span class="ml-2 text-xs text-text-main">{{ p.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showCreateModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="handleCreateAdminSubmit" :disabled="createLoading" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            {{ createLoading ? 'Creating...' : 'Provision' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Permissions Modal -->
    <div v-if="showPermissionsModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">Manage Access Privileges</h3>
          <p class="text-xs text-text-muted mt-1">Assign custom role profiles or override manual permissions for <strong>{{ editingUser?.name }}</strong>.</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Role Profile</label>
            <select v-model="selectedCustomRole" @change="handleEditRoleChange" class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2.5 text-text-main focus:outline-none text-sm">
              <option value="">None (Manual Overrides)</option>
              <option v-for="r in customRolesList" :key="r.id" :value="r.id">
                {{ r.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">
              Permissions
              <span v-if="selectedCustomRole" class="text-orange-500 font-normal lowercase italic">(Inherited from role)</span>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="p in allSystemPermissions"
                :key="p.value"
                class="flex items-center p-2.5 bg-surface-base border border-border-strong rounded-lg cursor-pointer"
              >
                <input
                  v-model="selectedPermissions"
                  type="checkbox"
                  :value="p.value"
                  :disabled="!!selectedCustomRole"
                  class="accent-orange-600 rounded"
                />
                <span class="ml-2 text-xs text-text-main">{{ p.label }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showPermissionsModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="handleSavePermissions" :disabled="permissionsLoading" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            {{ permissionsLoading ? 'Saving...' : 'Apply Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Send Mail Modal -->
    <div v-if="showMailModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">Send Mail to {{ selectedMailUser?.name }}</h3>
          <p class="text-xs text-text-muted mt-1">Compose a custom mail message or load a pre-configured template.</p>
        </div>

        <div v-if="mailError" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
          {{ mailError }}
        </div>

        <div class="space-y-4 max-h-[62vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Recipient</label>
              <input
                type="text"
                :value="selectedMailUser?.email || ''"
                disabled
                class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2.5 text-text-muted text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Select Template</label>
              <select
                v-model="mailTemplateId"
                @change="handleTemplateSelect"
                class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2.5 text-text-main focus:outline-none text-sm"
              >
                <option value="">Custom (Empty template)</option>
                <option v-for="t in mailTemplates" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tabs header for Write vs Live Preview -->
          <div class="border-b border-border-subtle flex">
            <button
              type="button"
              @click="previewTab = 'edit'"
              :class="previewTab === 'edit' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-text-muted'"
              class="px-4 py-2 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Compose Text
            </button>
            <button
              type="button"
              @click="previewTab = 'preview'"
              :class="previewTab === 'preview' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-text-muted'"
              class="px-4 py-2 border-b-2 text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              👁️ Compiled Live Preview
            </button>
          </div>

          <!-- Editing Section -->
          <div v-show="previewTab === 'edit'" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Subject</label>
              <input
                v-model="mailSubject"
                type="text"
                placeholder="e.g. Action Required: Account Notice"
                class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2.5 text-text-main focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-xs font-bold uppercase tracking-wider text-text-sub">HTML Email Content</label>
                <button
                  type="button"
                  @click="toggleEditorMode"
                  class="text-[10px] bg-surface-base border border-border-strong px-2.5 py-1 rounded-lg text-text-sub hover:text-text-main cursor-pointer font-semibold transition-all"
                >
                  Switch to {{ isRichEditor ? 'Raw HTML Code' : 'Rich Text Editor' }}
                </button>
              </div>

              <!-- Quill Rich Text Editor Container -->
              <div v-show="isRichEditor" class="bg-surface-base rounded-lg border border-border-strong overflow-hidden text-text-main">
                <div ref="quillEditorRef" class="min-h-[160px] max-h-[300px] overflow-y-auto"></div>
              </div>

              <!-- Raw Textarea view -->
              <textarea
                v-show="!isRichEditor"
                v-model="mailBody"
                rows="7"
                placeholder="Type your message here..."
                class="w-full bg-surface-base border border-border-strong rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-orange-500 text-sm font-mono leading-relaxed"
              ></textarea>
            </div>
            
            <!-- Placeholders Helper -->
            <div v-pre class="bg-surface-base/50 border border-border-strong rounded-xl p-3">
              <span class="text-[10px] font-bold text-text-sub uppercase tracking-wider">Supports placeholders:</span>
              <div class="flex flex-wrap gap-2 mt-1.5">
                <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500">{{name}}</code>
                <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500">{{email}}</code>
                <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500">{{phone}}</code>
                <code class="text-[10px] bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded text-orange-500">{{role}}</code>
              </div>
            </div>
          </div>

          <!-- Preview Section -->
          <div v-show="previewTab === 'preview'" class="space-y-4">
            <div class="bg-surface-base border border-border-strong rounded-2xl p-4 space-y-3">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Compiled Subject:</span>
                <div class="text-sm font-bold text-text-main mt-0.5">
                  {{ getCompiledPreview(mailSubject) || '(Subject is empty)' }}
                </div>
              </div>
              
              <div class="border-t border-border-subtle pt-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Body Preview (compiled):</span>
                <div
                  v-if="mailBody"
                  class="bg-white text-neutral-900 border border-neutral-200 rounded-xl p-6 overflow-y-auto max-h-[250px] leading-relaxed text-sm font-sans"
                  v-html="getCompiledPreview(mailBody)"
                ></div>
                <div v-else class="text-xs text-text-muted italic py-4">No content composed to preview.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showMailModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="handleSendMail" :disabled="mailLoading" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            {{ mailLoading ? 'Sending...' : 'Send Mail' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Block/Unblock Confirmation Modal -->
    <div v-if="showBlockConfirmModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">
            {{ targetBlockUser?.isBlocked ? 'Activate User' : 'Suspend User' }}
          </h3>
          <p class="text-xs text-text-muted mt-1">
            Are you sure you want to {{ targetBlockUser?.isBlocked ? 'unsuspend and activate' : 'suspend and block' }} <strong>{{ targetBlockUser?.name }}</strong>?
          </p>
        </div>

        <div class="space-y-4">
          <label class="flex items-center p-3 bg-surface-base border border-border-strong rounded-lg cursor-pointer">
            <input
              v-model="blockNotifyUser"
              type="checkbox"
              class="accent-orange-600 rounded"
            />
            <span class="ml-3 text-xs font-semibold text-text-main">Notify user via email</span>
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button @click="showBlockConfirmModal = false" class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="confirmToggleBlock" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer">
            Confirm Action
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
