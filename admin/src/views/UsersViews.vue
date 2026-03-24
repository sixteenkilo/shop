<template>
  <PageTitle
    title="Пользователи"
    btnTitle="Добавить пользователя"
    @action="openCreateUserDrawer"
  />

  <CreateUserDrawer
    v-model:show="stateCreateUser"
    :role-options="roleOptions"
    @create="handleCreateUser"
  />
  <CreateUserDrawer
    v-model:show="stateEditUser"
    :role-options="roleOptions"
    :editing-user="editingUser"
    @update="handleUpdateUser"
  />

  <n-alert v-if="usersStore.error" type="error" class="mb-12" :bordered="false">
    {{ usersStore.error }}
  </n-alert>

  <n-data-table
    :columns="columns"
    :data="usersStore.users"
    :loading="usersStore.isLoading"
  />
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NIcon, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { PencilOutline, TrashOutline } from '@vicons/ionicons5'
import PageTitle from '@/components/pageTitle.vue'
import CreateUserDrawer from '@/components/users/CreateUserDrawer.vue'
import { useUsersStore, type UserItem } from '@/stores/users'
import { useRolesStore } from '@/stores/roles'

// --- state ---

const stateCreateUser = ref(false)
const stateEditUser = ref(false)
const editingUser = ref<UserItem | null>(null)

const usersStore = useUsersStore()
const rolesStore = useRolesStore()
const roleOptions = ref<Array<{ label: string; value: number }>>([])

watch(stateEditUser, (show) => {
  if (!show) editingUser.value = null
})

// --- handlers ---

const openCreateUserDrawer = () => {
  stateCreateUser.value = true
}

type CreateUserPayload = {
  name: string
  email: string
  password: string
  roleIds?: number[]
}

const handleCreateUser = async (payload: CreateUserPayload) => {
  await usersStore.createUser(payload)
}

const openEditUser = (row: UserItem) => {
  editingUser.value = row
  stateEditUser.value = true
}

type UpdateUserEventPayload = {
  id: number
  body: { name: string; email: string; password?: string; roleIds: number[] }
}

const handleUpdateUser = async (payload: UpdateUserEventPayload) => {
  await usersStore.updateUser(payload.id, payload.body)
}

const handleDeleteUser = async (id: number) => {
  await usersStore.deleteUser(id)
}

// --- table ---

const DELETE_CONFIRM_TEXT = 'Удалить этого пользователя?'

function iconButton(icon: typeof PencilOutline) {
  return () => h(NIcon, { component: icon })
}

function renderRolesCell(row: UserItem) {
  if (!row.roles?.length) return '—'

  return h(
    'div',
    { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
    row.roles.map((role) =>
      h(
        NTag,
        { size: 'small', type: 'info', bordered: false },
        { default: () => role.value },
      ),
    ),
  )
}

function renderActionsCell(
  row: UserItem,
  onEdit: (row: UserItem) => void,
  onDelete: (id: number) => void,
) {
  const editButton = h(
    NButton,
    {
      size: 'small',
      type: 'warning',
      onClick: () => onEdit(row),
    },
    {
      icon: iconButton(PencilOutline),
      default: () => 'Изменить',
    },
  )

  const deleteButton = h(
    NPopconfirm,
    {
      positiveText: 'Удалить',
      negativeText: 'Отмена',
      onPositiveClick: () => onDelete(row.id),
    },
    {
      trigger: () =>
        h(
          NButton,
          { size: 'small', type: 'error' },
          {
            icon: iconButton(TrashOutline),
            default: () => 'Удалить',
          },
        ),
      default: () => DELETE_CONFIRM_TEXT,
    },
  )

  return h(NSpace, { size: 'small', wrap: false }, { default: () => [editButton, deleteButton] })
}

function buildUserColumns(params: {
  onEdit: (row: UserItem) => void
  onDelete: (id: number) => void
}): DataTableColumns<UserItem> {
  const { onEdit, onDelete } = params

  return [
    { title: 'ID', key: 'id' },
    { title: 'Имя', key: 'name' },
    { title: 'Почта', key: 'email' },
    {
      title: 'Роли',
      key: 'roles',
      render: (row) => renderRolesCell(row),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (row) => renderActionsCell(row, onEdit, onDelete),
    },
  ]
}

const columns = computed(() =>
  buildUserColumns({
    onEdit: openEditUser,
    onDelete: handleDeleteUser,
  }),
)

// --- lifecycle ---

onMounted(async () => {
  await Promise.all([usersStore.fetchUsers(), rolesStore.fetchRoles()])
  roleOptions.value = rolesStore.roles.map((role) => ({
    label: role.value,
    value: role.id,
  }))
})
</script>

<style scoped>
.mb-12 {
  margin-bottom: 12px;
}
</style>
