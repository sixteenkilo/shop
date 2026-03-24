import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type AuthUser = {
  id: number
  email: string
  name?: string
}

type AuthPayload = {
  email: string
  password: string
}

type RegisterPayload = AuthPayload & {
  name: string
}

type AuthResponse = {
  user: AuthUser
  accessToken: string
}

const ACCESS_TOKEN_KEY = 'admin_access_token'

export const useAuthStore = defineStore('auth', () => {
  // В dev-режиме используем Vite proxy: /api -> http://localhost:3000
  const apiUrl = import.meta.env.VITE_API_URL || '/api'

  const user = ref<AuthUser | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)

  const setAccessToken = (token: string | null) => {
    accessToken.value = token
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      return
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY)
  }

  const extractErrorMessage = async (response: Response) => {
    try {
      const data = await response.json()
      if (Array.isArray(data.message)) {
        return data.message.join(', ')
      }
      return data.message || data.error || 'Произошла ошибка'
    } catch {
      return 'Произошла ошибка'
    }
  }

  const authRequest = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(await extractErrorMessage(response))
    }

    return response.json()
  }

  const login = async (payload: AuthPayload) => {
    error.value = null
    isLoading.value = true
    try {
      const data = (await authRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as AuthResponse

      user.value = data.user
      setAccessToken(data.accessToken)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось войти'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterPayload) => {
    error.value = null
    isLoading.value = true
    try {
      const data = (await authRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })) as AuthResponse

      user.value = data.user
      setAccessToken(data.accessToken)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось зарегистрироваться'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const refresh = async () => {
    error.value = null
    try {
      const data = (await authRequest('/auth/refresh', {
        method: 'POST',
      })) as AuthResponse

      user.value = data.user
      setAccessToken(data.accessToken)
      return data
    } catch (err) {
      setAccessToken(null)
      user.value = null
      error.value = err instanceof Error ? err.message : 'Сессия истекла'
      throw err
    }
  }

  const fetchMe = async () => {
    if (!accessToken.value) return null

    error.value = null
    try {
      const data = (await authRequest('/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      })) as AuthUser

      user.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не удалось получить пользователя'
      throw err
    }
  }

  const logout = async () => {
    try {
      if (accessToken.value) {
        await authRequest('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.value}`,
          },
        })
      }
    } finally {
      setAccessToken(null)
      user.value = null
      error.value = null
    }
  }

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    refresh,
    fetchMe,
    logout,
    setAccessToken,
  }
})

