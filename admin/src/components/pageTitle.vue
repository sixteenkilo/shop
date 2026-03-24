<template>
  <n-space justify="space-between" align="center">
    <h1 class="title">{{ title }}</h1>
    <n-button class="btn" type="primary" @click="emit('action')">
      <template #icon>
        <n-icon>
          <AddOutline />
        </n-icon>
      </template>
      {{ btnTitle }}
    </n-button>
  </n-space>
</template>


<script lang="ts" setup>
import { NButton, NIcon, NSpace } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

defineProps<{
  title: string
  btnTitle: string
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>