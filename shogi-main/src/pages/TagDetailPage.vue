<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import type { TagDetail } from '@/types/api'
import { getTag, deleteTag } from '@/api/tags'

const route = useRoute()
const router = useRouter()
const tid = route.params.tid as string

const tag = ref<TagDetail | null>(null)
const loading = ref(true)
const deleteDialogVisible = ref(false)

onMounted(async () => {
  tag.value = await getTag(tid)
  loading.value = false
})

function onRowClick(event: { data: { kid: string } }) {
  router.push(`/kifus/${event.data.kid}`)
}

async function handleDelete() {
  await deleteTag(tid)
  router.push('/tags')
}
</script>

<template>
  <div class="tag-detail-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else-if="tag">
      <div class="page-header">
        <div>
          <h1>タグ: {{ tag.name }}</h1>
          <p class="tag-meta">
            {{ tag.kifu_count }} 件の棋譜
          </p>
        </div>
        <div class="header-actions">
          <Button
            label="編集"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            @click="router.push(`/tags/${tid}/edit`)"
          />
          <Button
            label="削除"
            icon="pi pi-trash"
            severity="danger"
            outlined
            @click="deleteDialogVisible = true"
          />
        </div>
      </div>

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

    <!-- Delete confirmation -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="タグの削除"
      :modal="true"
      :closable="true"
    >
      <p>
        タグ「{{ tag?.name }}」を削除しますか？<br />
        棋譜に付与されている関連データも同時に削除されます。
      </p>
      <template #footer>
        <Button
          label="キャンセル"
          severity="secondary"
          outlined
          @click="deleteDialogVisible = false"
        />
        <Button
          label="削除"
          severity="danger"
          @click="handleDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.tag-detail-page {
  padding: 1rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.page-header h1 {
  margin: 0 0 0.25rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.tag-meta {
  color: var(--p-text-muted-color, #6b7280);
  margin: 0;
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
