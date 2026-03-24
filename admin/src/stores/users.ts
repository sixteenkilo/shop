import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

type Role = {
  id: number
  value: string
  description?: string
}

export type UserItem = {
  id: number
  name: string
  email: string
  roles?: Role[]
}

type CreateUserPayload = {
  name: string
  email: string
  password: string
  roleIds?: number[]
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  password?: string
  roleIds?: number[]
}

type CreateUserResponse = {
  message: string
  user: UserItem
}

type UpdateUserResponse = {
  message: string
  user: UserItem
}

export const useUsersStore = defineStore('users', () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  const users = ref<UserItem[]>([])
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

  const usersRequest = async <T>(path: string, init: RequestInit = {}) => {
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

  /** Список с API без смены флагов загрузки (для refetch после мутаций). */
  const loadUsersFromApi = async (): Promise<UserItem[]> => {
    return await usersRequest<UserItem[]>('/users', { method: 'GET' })
  }

  const fetchUsers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await loadUsersFromApi()
      users.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось загрузить пользователей'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /** Явный refetch списка (как invalidateTags → refetch в RTK Query). */
  const refetchUsers = fetchUsers

  const refetchAfterMutation = async () => {
    const data = await loadUsersFromApi()
    users.value = data
  }

  const createUser = async (payload: CreateUserPayload) => {
    isLoading.value = true
    error.value = null
    try {
      await usersRequest<CreateUserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось создать пользователя'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось обновить список пользователей'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateUser = async (id: number, payload: UpdateUserPayload) => {
    isLoading.value = true
    error.value = null
    try {
      await usersRequest<UpdateUserResponse>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось обновить пользователя'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось обновить список пользователей'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteUser = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await usersRequest(`/users/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось удалить пользователя'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось обновить список пользователей'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    refetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})

