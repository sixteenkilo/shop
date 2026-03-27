import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UsersView from '../views/UsersViews.vue'
import RolesView from '../views/RolesView.vue'
import AuthView from '@/views/AuthView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import Layout from '@/views/layout/Layout.vue'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      meta: { guestOnly: true },
    },
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/',
      component: Layout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: {
            title: 'Главная',
            breadcrumbs: [{ label: 'Главная' }],
            requiresAuth: true,
          },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView,
          meta: {
            title: 'Пользователи',
            breadcrumbs: [
              { label: 'Главная', to: '/' },
              { label: 'Пользователи' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: 'roles',
          name: 'roles',
          component: RolesView,
          meta: {
            title: 'Роли',
            breadcrumbs: [
              { label: 'Главная', to: '/' },
              { label: 'Роли' },
            ],
            requiresAuth: true,
          },
        },
        {
          path: 'categories',
          name: 'categories',
          component: CategoriesView,
          meta: {
            title: 'Категории',
            breadcrumbs: [
              { label: 'Главная', to: '/' },
              { label: 'Категории' },
            ],
            requiresAuth: true,
          },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore(pinia)
  const requiresAuth = to.matched.some((record) => Boolean(record.meta.requiresAuth))
  const guestOnly = to.matched.some((record) => Boolean(record.meta.guestOnly))

  if (requiresAuth) {
    try {
      await authStore.refresh()
      return true
    } catch {
      return { name: 'auth' }
    }
  }

  if (guestOnly) {
    try {
      await authStore.refresh()
      return { name: 'home' }
    } catch {
      return true
    }
  }

  return true
})

export default router
