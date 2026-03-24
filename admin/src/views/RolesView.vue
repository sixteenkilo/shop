<template>
  <PageTitle
    title="Роли"
    btnTitle="Добавить роль"
    @action="openCreateRoleDrawer"
  />

  <CreateRoleDrawer
    v-model:show="stateCreateRole"
    @create="handleCreateRole"
  />

  <n-alert v-if="rolesStore.error" type="error" class="mb-12" :bordered="false">
    {{ rolesStore.error }}
  </n-alert>

  <n-data-table
    :columns="columns"
    :data="rolesStore.roles"
    :loading="rolesStore.isLoading"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageTitle from '@/components/pageTitle.vue'
import CreateRoleDrawer from '@/components/roles/CreateRoleDrawer.vue'
import { useRolesStore } from '@/stores/roles'

const stateCreateRole = ref(false)
const rolesStore = useRolesStore()

const openCreateRoleDrawer = () => {
  stateCreateRole.value = true
}

const handleCreateRole = async (payload: {
  value: string
  description?: string
}) => {
  await rolesStore.createRole(payload)
}

const columns = [
  { title: 'ID', key: 'id' },
  { title: 'Код роли', key: 'value' },
  { title: 'Описание', key: 'description' },
]

onMounted(async () => {
  await rolesStore.fetchRoles()
})
</script>

<style scoped>
.mb-12 {
  margin-bottom: 12px;
}
</style>

