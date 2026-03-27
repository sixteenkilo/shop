<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    show-trigger="bar"
    content-style="padding: 16px"
    class="layout-sider"
  >
    <div class="brand">Shop Admin</div>
    <n-menu :options="menuOptions" :default-value="'home'" />
  </n-layout-sider>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { RouterLink } from 'vue-router'

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/',
        },
        { default: () => 'Главная' },
      ),
    key: 'home',
  },
  {
    label: () => 
        h(
            RouterLink,
            {
                to: '/users',
            },
            { default: () => 'Пользователи' },
        ),
    key: 'users'
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/roles',
        },
        { default: () => 'Роли' },
      ),
    key: 'roles',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/categories',
        },
        { default: () => 'Категории' },
      ),
    key: 'categories',
  },
]
</script>

<style scoped>
.layout-sider {
  background: #fff;
}

.brand {
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
}
</style>