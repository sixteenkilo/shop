<template>
  <n-drawer :show="show" :width="502" placement="right" @update:show="onUpdateShow">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form :model="form" label-placement="top">
        <n-form-item label="Название">
          <n-input v-model:value="form.value" placeholder="Введите название категории" />
        </n-form-item>

        <n-form-item label="Slug (URL)">
          <n-input
            v-model:value="form.slug"
            placeholder="Например: smartfony-i-aksessuary"
          />
        </n-form-item>

        <n-form-item label="Описание">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Необязательно"
            :autosize="{ minRows: 2, maxRows: 6 }"
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
import type { CategoryItem } from '@/stores/categories'

const props = defineProps<{
  show: boolean
  editingCategory?: CategoryItem | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'create', payload: { value: string; slug: string; description?: string }): void
  (
    e: 'update',
    payload: {
      id: number
      body: { value: string; slug: string; description?: string }
    },
  ): void
}>()

const form = reactive({
  value: '',
  slug: '',
  description: '',
})

const isEdit = computed(() => !!props.editingCategory)
const drawerTitle = computed(() =>
  isEdit.value ? 'Редактировать категорию' : 'Создать категорию',
)
const primaryLabel = computed(() => (isEdit.value ? 'Сохранить' : 'Создать'))

const resetForm = () => {
  form.value = ''
  form.slug = ''
  form.description = ''
}

const syncFormFromProps = () => {
  if (!props.show) return
  if (props.editingCategory) {
    form.value = props.editingCategory.value
    form.slug = props.editingCategory.slug ?? ''
    form.description = props.editingCategory.description ?? ''
  } else {
    resetForm()
  }
}

watch(
  () => [props.show, props.editingCategory?.id] as const,
  () => {
    if (!props.show) {
      resetForm()
      return
    }
    syncFormFromProps()
  },
)

const onUpdateShow = (value: boolean) => {
  emit('update:show', value)
}

const handleSubmit = () => {
  const value = form.value.trim()
  const slug = form.slug.trim().toLowerCase()
  const descriptionRaw = form.description.trim()

  if (isEdit.value && props.editingCategory) {
    emit('update', {
      id: props.editingCategory.id,
      body: {
        value,
        slug,
        description: descriptionRaw === '' ? '' : descriptionRaw,
      },
    })
  } else {
    emit('create', {
      value,
      slug,
      ...(descriptionRaw !== '' ? { description: descriptionRaw } : {}),
    })
  }
  onUpdateShow(false)
}
</script>
