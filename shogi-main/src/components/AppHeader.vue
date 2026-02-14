<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import { useAuth } from '@/auth/auth'

const router = useRouter()
const { isAuthenticated, user, login, logout } = useAuth()

const menuItems = computed(() => {
  if (!isAuthenticated.value) return []
  return [
    {
      label: '棋譜一覧',
      icon: 'pi pi-list',
      command: () => router.push('/kifus'),
    },
    {
      label: 'エクスプローラー',
      icon: 'pi pi-folder',
      command: () => router.push('/explorer'),
    },
    {
      label: 'タグ一覧',
      icon: 'pi pi-tags',
      command: () => router.push('/tags'),
    },
  ]
})

function handleLogout() {
  logout()
  router.push('/')
}
</script>

<template>
  <Menubar :model="menuItems" class="app-header">
    <template #start>
      <router-link to="/" class="app-logo">
        <span class="app-logo-text">将棋棋譜管理</span>
      </router-link>
    </template>
    <template #end>
      <div class="header-end">
        <template v-if="isAuthenticated">
          <Button
            :label="user?.username"
            icon="pi pi-user"
            text
            @click="router.push('/profile')"
          />
          <Button
            label="ログアウト"
            icon="pi pi-sign-out"
            severity="secondary"
            text
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <Button
            label="ログイン"
            icon="pi pi-sign-in"
            @click="login"
          />
        </template>
      </div>
    </template>
  </Menubar>
</template>

<style scoped>
.app-header {
  margin-bottom: 1.5rem;
}

.app-logo {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.app-logo-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.header-end {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>
