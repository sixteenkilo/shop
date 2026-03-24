<script setup lang="ts">
import { RouterView } from 'vue-router' 
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <RouterView />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
 