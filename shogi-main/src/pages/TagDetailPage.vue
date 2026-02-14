<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressSpinner from 'primevue/progressspinner'
import type { TagDetail } from '@/types/api'
import { getTag } from '@/api/tags'

const route = useRoute()
const router = useRouter()
const tid = route.params.tid as string

const tag = ref<TagDetail | null>(null)
const loading = ref(true)

onMounted(async () => {
  tag.value = await getTag(tid)
  loading.value = false
})

function onRowClick(event: { data: { kid: string } }) {
  router.push(`/kifus/${event.data.kid}`)
}
</script>

<template>
  <div class="tag-detail-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else-if="tag">
      <h1>タグ: {{ tag.name }}</h1>
      <p class="tag-meta">
        {{ tag.kifu_count }} 件の棋譜
      </p>

      <DataTable
        :value="tag.kifus"
        stripedRows
        selectionMode="single"
        @row-click="onRowClick"
        class="kifu-table"
      >
        <Column field="slug" header="スラグ" sortable />
        <Column field="created" header="作成日" sortable style="width: 160px" />
        <Column field="latest_update" header="更新日" sortable style="width: 160px" />

        <template #empty>
          <div class="empty-message">このタグが付与された棋譜はありません</div>
        </template>
      </DataTable>
    </template>
  </div>
</template>

<style scoped>
.tag-detail-page {
  padding: 1rem 0;
}

h1 {
  margin-bottom: 0.25rem;
}

.tag-meta {
  color: var(--p-text-muted-color, #6b7280);
  margin-bottom: 1.5rem;
}

.kifu-table :deep(tr) {
  cursor: pointer;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>
