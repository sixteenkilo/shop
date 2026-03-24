<template>
  <n-layout-header bordered class="layout-header">
    <div class="header-content">
      <n-breadcrumb v-if="breadcrumbs.length" class="breadcrumbs">
        <n-breadcrumb-item v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
          <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
          <span v-else>{{ crumb.label }}</span>
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="header-user">
      <span class="greeting">Привет, {{ displayName }}</span>
      <n-dropdown trigger="click" :options="userMenuOptions" @select="onUserMenuSelect">
        <n-button quaternary circle class="user-menu-trigger" aria-label="Меню пользователя">
          <template #icon>
            <n-icon>
              <ChevronDownOutline />
            </n-icon>
          </template>
        </n-button>
      </n-dropdown>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NButton, NDropdown, NIcon } from 'naive-ui'
import type { DropdownOption } from 'naive-ui'
import { ChevronDownOutline } from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const displayName = computed(() => user.value?.name || user.value?.email || 'Пользователь')

const route = useRoute()
const router = useRouter()

type Crumb = { label: string; to?: string }

const pageTitle = computed(() => (route.meta.title as string) || 'Панель управления')
const breadcrumbs = computed(() => (route.meta.breadcrumbs as Crumb[]) || [])

const userMenuOptions: DropdownOption[] = [{ label: 'Выйти', key: 'logout' }]

const onUserMenuSelect = async (key: string) => {
  if (key !== 'logout') return
  await authStore.logout()
  await router.push({ name: 'auth' })
}
</script>

<style scoped>
.layout-header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 20px;
  background: #fff;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.breadcrumbs {
  margin-bottom: 4px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.greeting {
  font-size: 14px;
  color: var(--n-text-color-3, rgba(0, 0, 0, 0.65));
}

.user-menu-trigger {
  flex-shrink: 0;
}
</style>
