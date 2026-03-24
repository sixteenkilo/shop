<script setup lang="ts">
import { RouterView } from 'vue-router'
import { dateRuRU, ruRU } from 'naive-ui'
</script>

<template>
  <n-config-provider :locale="ruRU" :date-locale="dateRuRU">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <RouterView />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
 