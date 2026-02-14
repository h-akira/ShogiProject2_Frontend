<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'

const router = useRouter()

onMounted(() => {
  // Will be: await userManager.signinRedirectCallback()
  // Mock: redirect to home after brief delay
  setTimeout(() => {
    router.replace('/')
  }, 500)
})
</script>

<template>
  <div class="callback-page">
    <ProgressSpinner />
    <p>認証処理中...</p>
  </div>
</template>

<style scoped>
.callback-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
}
</style>
