<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb'
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { ExplorerResponse } from '@/types/api'
import { getExplorer } from '@/api/kifus'

const route = useRoute()
const router = useRouter()

const explorer = ref<ExplorerResponse | null>(null)
const loading = ref(true)

const breadcrumbHome = { icon: 'pi pi-home', command: () => navigateToPath(undefined) }
const breadcrumbItems = ref<{ label: string; command: () => void }[]>([])

async function loadExplorer(path?: string) {
  loading.value = true
  explorer.value = await getExplorer(path)
  breadcrumbItems.value = (explorer.value.breadcrumbs || []).map((b) => ({
    label: b.name,
    command: () => navigateToPath(b.path),
  }))
  loading.value = false
}

function navigateToPath(path?: string) {
  if (path) {
    router.push({ path: '/explorer', query: { path } })
  } else {
    router.push('/explorer')
  }
}

onMounted(() => {
  loadExplorer(route.query.path as string | undefined)
})

watch(
  () => route.query.path,
  (newPath) => {
    loadExplorer(newPath as string | undefined)
  },
)
</script>

<template>
  <div class="explorer-page">
    <h1>エクスプローラー</h1>

    <Breadcrumb :home="breadcrumbHome" :model="breadcrumbItems" class="explorer-breadcrumb" />

    <template v-if="explorer && !loading">
      <!-- Folders -->
      <div v-if="explorer.folders.length" class="section">
        <h3>フォルダ</h3>
        <div class="folder-grid">
          <Card
            v-for="folder in explorer.folders"
            :key="folder.path"
            class="folder-card"
            @click="navigateToPath(folder.path)"
          >
            <template #content>
              <div class="folder-content">
                <i class="pi pi-folder folder-icon" />
                <div>
                  <div class="folder-name">{{ folder.name }}</div>
                  <div class="folder-count">{{ folder.count }} 件</div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Files -->
      <div v-if="explorer.files.length" class="section">
        <h3>棋譜ファイル</h3>
        <div class="file-list">
          <div
            v-for="file in explorer.files"
            :key="file.kid"
            class="file-item"
            @click="router.push(`/kifus/${file.kid}`)"
          >
            <i class="pi pi-file file-icon" />
            <span>{{ file.name }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="!explorer.folders.length && !explorer.files.length"
        class="empty-message"
      >
        このフォルダは空です
      </div>
    </template>
  </div>
</template>

<style scoped>
.explorer-page {
  padding: 1rem 0;
}

h1 {
  margin-bottom: 1rem;
}

.explorer-breadcrumb {
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 1.5rem;
}

.section h3 {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color, #6b7280);
  text-transform: uppercase;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.folder-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.folder-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.folder-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.folder-icon {
  font-size: 1.5rem;
  color: var(--p-primary-color, #3b82f6);
}

.folder-name {
  font-weight: 600;
}

.folder-count {
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #6b7280);
}

.file-list {
  display: flex;
  flex-direction: column;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.file-item:hover {
  background-color: var(--p-surface-100, #f3f4f6);
}

.file-icon {
  color: var(--p-text-muted-color, #6b7280);
}

.empty-message {
  text-align: center;
  padding: 3rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>
