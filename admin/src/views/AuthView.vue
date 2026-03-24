<template>
  <div class="auth-page">
    <n-card class="auth-card" :bordered="false">
      <n-tabs v-model:value="activeTab" type="line" animated>
        <n-tab-pane name="login" tab="Авторизация">
          <n-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-placement="top"
          >
            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="loginForm.email"
                placeholder="you@example.com"
                type="text"
              />
            </n-form-item>

            <n-form-item label="Пароль" path="password">
              <n-input
                v-model:value="loginForm.password"
                placeholder="Введите пароль"
                type="password"
                show-password-on="mousedown"
              />
            </n-form-item>

            <n-button
              type="primary"
              block
              :loading="isSubmitting"
              @click="handleLogin"
            >
              Войти
            </n-button>
          </n-form>
        </n-tab-pane>

        <n-tab-pane name="register" tab="Регистрация">
          <n-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-placement="top"
          >
            <n-form-item label="Имя" path="name">
              <n-input
                v-model:value="registerForm.name"
                placeholder="Введите имя"
                type="text"
              />
            </n-form-item>

            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="registerForm.email"
                placeholder="you@example.com"
                type="text"
              />
            </n-form-item>

            <n-form-item label="Пароль" path="password">
              <n-input
                v-model:value="registerForm.password"
                placeholder="Введите пароль"
                type="password"
                show-password-on="mousedown"
              />
            </n-form-item>

            <n-button
              type="primary"
              block
              :loading="isSubmitting"
              @click="handleRegister"
            >
              Зарегистрироваться
            </n-button>
          </n-form>
        </n-tab-pane>
      </n-tabs>

      <n-alert v-if="authStore.error" class="error-alert" type="error" :bordered="false">
        {{ authStore.error }}
      </n-alert>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()
const activeTab = ref<'login' | 'register'>('login')
const loginFormRef = ref<FormInst | null>(null)
const registerFormRef = ref<FormInst | null>(null)
const isSubmitting = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
})

const baseEmailRules = [
  { required: true, message: 'Введите email', trigger: ['blur', 'input'] },
  { type: 'email' as const, message: 'Некорректный email', trigger: ['blur', 'input'] },
]

const basePasswordRules = [
  { required: true, message: 'Введите пароль', trigger: ['blur', 'input'] },
  { min: 6, message: 'Минимум 6 символов', trigger: ['blur', 'input'] },
]

const loginRules: FormRules = {
  email: baseEmailRules,
  password: basePasswordRules,
}

const registerRules: FormRules = {
  name: [
    { required: true, message: 'Введите имя', trigger: ['blur', 'input'] },
    { min: 2, message: 'Минимум 2 символа', trigger: ['blur', 'input'] },
  ],
  email: baseEmailRules,
  password: basePasswordRules,
}

const goHome = async () => {
  await router.replace('/home')
}

const handleLogin = async () => {
  await loginFormRef.value?.validate()
  isSubmitting.value = true
  try {
    await authStore.login(loginForm)
    message.success('Успешный вход')
    await goHome()
  } finally {
    isSubmitting.value = false
  }
}

const handleRegister = async () => {
  await registerFormRef.value?.validate()
  isSubmitting.value = true
  try {
    await authStore.register(registerForm)
    message.success('Регистрация успешна')
    await goHome()
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await authStore.refresh()
    await goHome()
  } catch {
    // Нет активной сессии: остаемся на странице auth.
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.error-alert {
  margin-top: 16px;
}
</style>