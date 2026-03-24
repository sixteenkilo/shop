import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export type RoleItem = {
  id: number
  value: string
  description?: string | null
}

type CreateRolePayload = {
  value: string
  description?: string
}

type CreateRoleResponse = {
  message: string
  role: RoleItem
}

export const useRolesStore = defineStore('roles', () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  const roles = ref<RoleItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const extractErrorMessage = async (response: Response) => {
    try {
      const data = await response.json()
      if (Array.isArray(data.message)) return data.message.join(', ')
      return data.message || data.error || 'Произошла ошибка'
    } catch {
      return 'Произошла ошибка'
    }
  }

  const rolesRequest = async <T>(path: string, init: RequestInit = {}) => {
    const authStore = useAuthStore()
    const token = authStore.accessToken

    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response))
    }

    return (await response.json()) as T
  }

  const fetchRoles = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await rolesRequest<RoleItem[]>('/roles', { method: 'GET' })
      roles.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить роли'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createRole = async (payload: CreateRolePayload) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await rolesRequest<CreateRoleResponse>('/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      roles.value = [data.role, ...roles.value]
      return data.role
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось создать роль'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    createRole,
  }
})

