<template>
  <n-layout has-sider class="layout">
    <Aside />

    <n-layout class="layout-content">
      <Header />

      <n-layout-content content-style="padding: 20px" class="layout-content-inner">
        <n-card>
          <RouterView />
        </n-card>
      </n-layout-content>

      <Footer />
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Aside from '@/components/layout/Aside.vue'
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: #f5f7fb;
}

.layout-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-content-inner {
  flex: 1;
}
</style>