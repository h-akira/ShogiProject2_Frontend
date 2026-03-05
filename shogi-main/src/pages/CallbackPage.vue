<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import { exchangeCodeForTokens } from '@/auth/auth'

const router = useRouter()
const error = ref(false)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (!code) {
    error.value = true
    return
  }

  const success = await exchangeCodeForTokens(code)
  if (success) {
    router.replace('/')
  } else {
    error.value = true
  }
})
</script>

<template>
  <div class="callback-page">
    <template v-if="error">
      <p>認証に失敗しました。もう一度ログインしてください。</p>
      <router-link to="/">トップページへ</router-link>
    </template>
    <template v-else>
      <ProgressSpinner />
      <p>認証処理中...</p>
    </template>
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
