<template>
  <PageTitle
    title="Категории"
    btnTitle="Добавить категорию"
    @action="openCreateDrawer"
  />

  <CreateCategoryDrawer
    v-model:show="stateCreate"
    @create="handleCreate"
  />
  <CreateCategoryDrawer
    v-model:show="stateEdit"
    :editing-category="editingCategory"
    @update="handleUpdate"
  />

  <n-alert v-if="categoriesStore.error" type="error" class="mb-12" :bordered="false">
    {{ categoriesStore.error }}
  </n-alert>

  <n-data-table
    :columns="columns"
    :data="categoriesStore.categories"
    :loading="categoriesStore.isLoading"
  />
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue'
import type { DataTableColumns } from 'naive-ui'
import { NButton, NIcon, NPopconfirm, NSpace } from 'naive-ui'
import { PencilOutline, TrashOutline } from '@vicons/ionicons5'
import PageTitle from '@/components/pageTitle.vue'
import CreateCategoryDrawer from '@/components/categories/CreateCategoryDrawer.vue'
import { useCategoriesStore, type CategoryItem } from '@/stores/categories'

const stateCreate = ref(false)
const stateEdit = ref(false)
const editingCategory = ref<CategoryItem | null>(null)

const categoriesStore = useCategoriesStore()

watch(stateEdit, (show) => {
  if (!show) editingCategory.value = null
})

const openCreateDrawer = () => {
  stateCreate.value = true
}

const handleCreate = async (payload: { value: string; slug: string; description?: string }) => {
  await categoriesStore.createCategory(payload)
}

const openEdit = (row: CategoryItem) => {
  editingCategory.value = row
  stateEdit.value = true
}

type UpdateEventPayload = {
  id: number
  body: { value: string; slug: string; description?: string }
}

const handleUpdate = async (payload: UpdateEventPayload) => {
  await categoriesStore.updateCategory(payload.id, payload.body)
}

const handleDelete = async (id: number) => {
  await categoriesStore.deleteCategory(id)
}

const DELETE_CONFIRM_TEXT = 'Удалить эту категорию?'

function iconButton(icon: typeof PencilOutline) {
  return () => h(NIcon, { component: icon })
}

function renderActionsCell(
  row: CategoryItem,
  onEdit: (row: CategoryItem) => void,
  onDelete: (id: number) => void,
) {
  const editButton = h(
    NButton,
    {
      size: 'small',
      type: 'warning',
      onClick: () => onEdit(row),
    },
    {
      icon: iconButton(PencilOutline),
      default: () => 'Изменить',
    },
  )

  const deleteButton = h(
    NPopconfirm,
    {
      positiveText: 'Удалить',
      negativeText: 'Отмена',
      onPositiveClick: () => onDelete(row.id),
    },
    {
      trigger: () =>
        h(
          NButton,
          { size: 'small', type: 'error' },
          {
            icon: iconButton(TrashOutline),
            default: () => 'Удалить',
          },
        ),
      default: () => DELETE_CONFIRM_TEXT,
    },
  )

  return h(NSpace, { size: 'small', wrap: false }, { default: () => [editButton, deleteButton] })
}

function buildColumns(params: {
  onEdit: (row: CategoryItem) => void
  onDelete: (id: number) => void
}): DataTableColumns<CategoryItem> {
  const { onEdit, onDelete } = params

  return [
    { title: 'ID', key: 'id' },
    { title: 'Название', key: 'value' },
    {
      title: 'Slug',
      key: 'slug',
      render: (row) => row.slug || '—',
    },
    {
      title: 'Описание',
      key: 'description',
      render: (row) => row.description || '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (row) => renderActionsCell(row, onEdit, onDelete),
    },
  ]
}

const columns = computed(() =>
  buildColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
  }),
)

onMounted(async () => {
  await categoriesStore.fetchCategories()
})
</script>

<style scoped>
.mb-12 {
  margin-bottom: 12px;
}
</style>
