<template>
  <n-drawer :show="show" :width="502" placement="right" @update:show="onUpdateShow">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form :model="form" label-placement="top">
        <n-form-item label="Имя">
          <n-input v-model:value="form.name" placeholder="Введите имя" />
        </n-form-item>

        <n-form-item label="Email">
          <n-input v-model:value="form.email" placeholder="Введите email" />
        </n-form-item>

        <n-form-item :label="isEdit ? 'Новый пароль' : 'Пароль'">
          <n-input
            v-model:value="form.password"
            type="password"
            :placeholder="isEdit ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'"
            show-password-on="mousedown"
          />
        </n-form-item>

        <n-form-item label="Роли">
          <n-select
            v-model:value="form.roleIds"
            multiple
            clearable
            filterable
            placeholder="Выберите роли"
            :options="props.roleOptions"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button @click="onUpdateShow(false)">Отмена</n-button>
          <n-button type="primary" @click="handleSubmit">{{ primaryLabel }}</n-button>
        </n-space>
      </n-form>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { UserItem } from '@/stores/users'

const props = defineProps<{
  show: boolean
  roleOptions: Array<{ label: string; value: number }>
  editingUser?: UserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (
    e: 'create',
    payload: { name: string; email: string; password: string; roleIds?: number[] },
  ): void
  (
    e: 'update',
    payload: {
      id: number
      body: { name: string; email: string; password?: string; roleIds: number[] }
    },
  ): void
}>()

const form = reactive({
  name: '',
  email: '',
  password: '',
  roleIds: [] as number[],
})

const isEdit = computed(() => !!props.editingUser)
const drawerTitle = computed(() => (isEdit.value ? 'Редактировать пользователя' : 'Создать пользователя'))
const primaryLabel = computed(() => (isEdit.value ? 'Сохранить' : 'Создать'))

const resetForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.roleIds = []
}

const syncFormFromProps = () => {
  if (!props.show) return
  if (props.editingUser) {
    form.name = props.editingUser.name
    form.email = props.editingUser.email
    form.password = ''
    form.roleIds = props.editingUser.roles?.map((r) => r.id) ?? []
  } else {
    resetForm()
  }
}

watch(
  () => [props.show, props.editingUser?.id] as const,
  () => {
    if (!props.show) {
      resetForm()
      return
    }
    syncFormFromProps()
  },
  { immediate: true },
)

const onUpdateShow = (value: boolean) => {
  emit('update:show', value)
}

const handleSubmit = () => {
  if (isEdit.value && props.editingUser) {
    emit('update', {
      id: props.editingUser.id,
      body: {
        name: form.name,
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        roleIds: form.roleIds,
      },
    })
    onUpdateShow(false)
    return
  }

  emit('create', {
    name: form.name,
    email: form.email,
    password: form.password,
    roleIds: form.roleIds.length ? form.roleIds : undefined,
  })
  onUpdateShow(false)
}
</script>

