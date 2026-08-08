<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '../components/AdminLayout.vue'
import {
  useAdminRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '../composables/useAdminQuery'

interface RoleRecord {
  id: string
  name: string
  permissions: string[]
  createdAt?: string
}

// Form States
const showFormModal = ref(false)
const editingRole = ref<RoleRecord | null>(null)
const roleName = ref('')
const selectedPermissions = ref<string[]>([])
const saveLoading = ref(false)
const saveError = ref('')

const allSystemPermissions = [
  { value: 'manage_vendors', label: 'Manage Vendors', desc: 'Can verify, block, and view vendor profiles and category audit.' },
  { value: 'manage_customers', label: 'Manage Customers', desc: 'Can view, block, create admins, and update user accounts.' },
  { value: 'manage_payments', label: 'Manage Payments', desc: 'Can override wallet balances, view transactions ledger, and process disputes.' },
  { value: 'schedule_emails', label: 'Schedule Emails', desc: 'Can draft, template, and schedule bulk email campaign dispatches.' },
]

const { data: rolesData, isLoading: loading, error } = useAdminRoles()
const roles = computed(() => rolesData.value || [])

const createRoleMutation = useCreateRole()
const updateRoleMutation = useUpdateRole()
const deleteRoleMutation = useDeleteRole()

const openCreateModal = () => {
  editingRole.value = null
  roleName.value = ''
  selectedPermissions.value = []
  saveError.value = ''
  showFormModal.value = true
}

const openEditModal = (role: RoleRecord) => {
  editingRole.value = role
  roleName.value = role.name
  selectedPermissions.value = [...role.permissions]
  saveError.value = ''
  showFormModal.value = true
}

const handleSaveSubmit = async () => {
  if (!roleName.value.trim()) {
    saveError.value = 'Role name is required'
    return
  }

  saveLoading.value = true
  saveError.value = ''

  try {
    if (editingRole.value) {
      await updateRoleMutation.mutateAsync({
        id: editingRole.value.id,
        dto: {
          name: roleName.value,
          permissions: selectedPermissions.value,
        },
      })
    } else {
      await createRoleMutation.mutateAsync({
        name: roleName.value,
        permissions: selectedPermissions.value,
      })
    }
    showFormModal.value = false
  } catch (err: any) {
    saveError.value = err.message || 'Failed to save role.'
  } finally {
    saveLoading.value = false
  }
}

const handleDeleteRole = async (id: string) => {
  if (!confirm('Are you sure you want to delete this role? Any users holding this role will have their role cleared.')) {
    return
  }

  try {
    await deleteRoleMutation.mutateAsync(id)
  } catch (err: any) {
    alert(err.message || 'Failed to delete role.')
  }
}
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <!-- Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-text-main tracking-tight font-display">Roles & Permissions</h2>
          <p class="text-text-sub text-sm mt-1">Configure security profiles for operators and staff and map system permissions.</p>
        </div>

        <div>
          <button
            @click="openCreateModal"
            class="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-600/20 active:scale-98 transition-all text-sm cursor-pointer"
          >
            🛡️ Create Role
          </button>
        </div>
      </div>

      <!-- Roles List -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="roles.length === 0" class="bg-surface-raised border border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <span class="text-5xl">🛡️</span>
        <h3 class="text-lg font-bold text-text-main font-display">No Custom Roles Found</h3>
        <p class="text-text-sub text-sm max-w-sm">Create staff profiles with specific access controls. By default, Superadmins bypass all locks.</p>
        <button
          @click="openCreateModal"
          class="bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer"
        >
          Create First Role
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="r in roles"
          :key="r.id"
          class="bg-surface-raised border border-border-subtle rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6 hover:border-orange-500/30 transition-colors"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-lg font-bold text-text-main font-display">{{ r.name }}</h3>
                <span class="text-[9px] text-text-muted font-mono uppercase tracking-widest block mt-0.5">ID: {{ r.id }}</span>
              </div>
              <span class="bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                Custom Role
              </span>
            </div>

            <!-- Permission Tags -->
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Assigned Access</label>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="p in r.permissions"
                  :key="p"
                  class="bg-surface-base border border-border-strong text-text-sub text-[10px] px-2 py-0.5 rounded-lg"
                >
                  {{ p.replace('manage_', '').replace('schedule_', '').replace('_', ' ') }}
                </span>
                <span v-if="r.permissions.length === 0" class="text-text-muted text-xs italic font-light">
                  No active permissions (Read-only access)
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-border-subtle">
            <button
              @click="openEditModal(r)"
              class="text-xs text-orange-500 hover:text-orange-400 font-bold px-2 py-1 rounded hover:bg-orange-500/10 transition-colors cursor-pointer"
            >
              Modify
            </button>
            <button
              @click="handleDeleteRole(r.id)"
              class="text-xs text-red-500 hover:text-red-400 font-bold px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-surface-raised border border-border-subtle max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h3 class="text-xl font-bold text-text-main font-display">
            {{ editingRole ? 'Modify Role Profile' : 'Create Custom Role' }}
          </h3>
          <p class="text-xs text-text-muted mt-1">Specify staff role name and check permissions mapping.</p>
        </div>

        <div v-if="saveError" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
          {{ saveError }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Role Name</label>
            <input
              v-model="roleName"
              type="text"
              placeholder="e.g. Content Moderator, Support Executive"
              class="w-full bg-surface-base border border-border-strong rounded-lg px-4 py-2.5 text-text-main focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-text-sub mb-2">Mapped Permissions</label>
            <div class="space-y-2">
              <label
                v-for="p in allSystemPermissions"
                :key="p.value"
                class="flex items-start p-3 bg-surface-base border border-border-strong rounded-xl cursor-pointer hover:border-orange-500/30 transition-all"
              >
                <input
                  v-model="selectedPermissions"
                  type="checkbox"
                  :value="p.value"
                  class="mt-1 accent-orange-600 rounded"
                />
                <div class="ml-3">
                  <span class="text-xs font-bold text-text-main block leading-tight">{{ p.label }}</span>
                  <span class="text-[10px] text-text-muted mt-0.5 block leading-normal">{{ p.desc }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="showFormModal = false"
            class="px-4 py-2 border border-border-strong hover:bg-surface-base rounded-xl text-xs font-semibold text-text-sub hover:text-text-main transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="handleSaveSubmit"
            :disabled="saveLoading"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
          >
            {{ saveLoading ? 'Saving...' : 'Save Role' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
