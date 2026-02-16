<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import { useAuth } from '@/auth/auth'

const router = useRouter()
const { isAuthenticated, login } = useAuth()
</script>

<template>
  <div class="home-page">
    <!-- Logged out -->
    <template v-if="!isAuthenticated">
      <div class="hero">
        <h1>将棋棋譜管理</h1>
        <p class="hero-description">
          あなたの棋譜を安全に保管・整理し、AI局面解析で棋力向上を支援します。
        </p>
        <div class="hero-actions">
          <Button label="ログイン" icon="pi pi-sign-in" @click="login" />
          <Button
            label="今すぐ始める"
            icon="pi pi-user-plus"
            severity="secondary"
            outlined
            @click="login"
          />
        </div>
      </div>
    </template>

    <!-- Logged in -->
    <template v-else>
      <h1>ダッシュボード</h1>
      <div class="dashboard-cards">
        <Card class="dashboard-card" @click="router.push('/kifus')">
          <template #header>
            <div class="card-icon">
              <i class="pi pi-home" />
            </div>
          </template>
          <template #title>マイページ</template>
          <template #subtitle>最近の棋譜を確認・管理</template>
        </Card>

        <Card class="dashboard-card" @click="router.push('/explorer')">
          <template #header>
            <div class="card-icon">
              <i class="pi pi-folder" />
            </div>
          </template>
          <template #title>エクスプローラー</template>
          <template #subtitle>フォルダ階層で棋譜を閲覧</template>
        </Card>

        <Card class="dashboard-card" @click="router.push('/tags')">
          <template #header>
            <div class="card-icon">
              <i class="pi pi-tags" />
            </div>
          </template>
          <template #title>タグ一覧</template>
          <template #subtitle>タグで棋譜を分類・検索</template>
        </Card>

        <Card class="dashboard-card" @click="router.push('/kifus/new')">
          <template #header>
            <div class="card-icon">
              <i class="pi pi-plus" />
            </div>
          </template>
          <template #title>棋譜作成</template>
          <template #subtitle>新しい棋譜を登録</template>
        </Card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-page {
  padding: 2rem 0;
}

.hero {
  text-align: center;
  padding: 4rem 1rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--p-text-muted-color, #6b7280);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

h1 {
  margin-bottom: 1.5rem;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.dashboard-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0;
  font-size: 2rem;
  color: var(--p-primary-color, #3b82f6);
}
</style>
