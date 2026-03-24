<template>
  <n-drawer :show="show" :width="440" placement="right" @update:show="onUpdateShow">
    <n-drawer-content title="Создать роль" closable>
      <n-form :model="form" label-placement="top">
        <n-form-item label="Код роли">
          <n-input v-model:value="form.value" placeholder="Например: MANAGER" />
        </n-form-item>

        <n-form-item label="Описание">
          <n-input
            v-model:value="form.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            placeholder="Краткое описание роли"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button @click="onUpdateShow(false)">Отмена</n-button>
          <n-button type="primary" @click="handleCreate">Создать</n-button>
        </n-space>
      </n-form>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'create', payload: { value: string; description?: string }): void
}>()

const form = reactive({
  value: '',
  description: '',
})

const onUpdateShow = (value: boolean) => {
  emit('update:show', value)
}

const handleCreate = () => {
  emit('create', {
    value: form.value,
    description: form.description || undefined,
  })
  onUpdateShow(false)
}
</script>

