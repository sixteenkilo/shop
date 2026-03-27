import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export type CategoryItem = {
  id: number
  value: string
  slug: string | null
  description: string | null
}

type CreatePayload = {
  value: string
  slug: string
  description?: string
}

export type UpdatePayload = {
  value?: string
  slug?: string
  description?: string
}

type CreateResponse = {
  message: string
  category: CategoryItem
}

type UpdateResponse = {
  message: string
  category: CategoryItem
}

export const useCategoriesStore = defineStore('categories', () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  const categories = ref<CategoryItem[]>([])
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

  const categoriesRequest = async <T>(path: string, init: RequestInit = {}) => {
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

  const loadCategoriesFromApi = async (): Promise<CategoryItem[]> => {
    return await categoriesRequest<CategoryItem[]>('/categories', { method: 'GET' })
  }

  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await loadCategoriesFromApi()
      categories.value = data
      return data
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось загрузить категории'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refetchCategories = fetchCategories

  const refetchAfterMutation = async () => {
    const data = await loadCategoriesFromApi()
    categories.value = data
  }

  const createCategory = async (payload: CreatePayload) => {
    isLoading.value = true
    error.value = null
    try {
      await categoriesRequest<CreateResponse>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось создать категорию'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось обновить список категорий'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCategory = async (id: number, payload: UpdatePayload) => {
    isLoading.value = true
    error.value = null
    try {
      await categoriesRequest<UpdateResponse>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось обновить категорию'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось обновить список категорий'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteCategory = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      await categoriesRequest(`/categories/${id}`, {
        method: 'DELETE',
      })
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось удалить категорию'
      throw err
    }
    try {
      await refetchAfterMutation()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Не удалось обновить список категорий'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    refetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
