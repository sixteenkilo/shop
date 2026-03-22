<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <header>
            <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

            <div class="wrapper">
              <HelloWorld msg="You did it!" />

              <n-space class="nav" justify="center" align="center">
                <RouterLink v-slot="{ navigate }" to="/" custom>
                  <n-button quaternary type="primary" @click="navigate">Home</n-button>
                </RouterLink>
                <RouterLink v-slot="{ navigate }" to="/about" custom>
                  <n-button quaternary type="primary" @click="navigate">About</n-button>
                </RouterLink>
              </n-space>
            </div>
          </header>

          <RouterView />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.nav {
  width: 100%;
  margin-top: 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  .nav {
    justify-content: flex-start !important;
    margin-left: -1rem;
    font-size: 1rem;
    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
