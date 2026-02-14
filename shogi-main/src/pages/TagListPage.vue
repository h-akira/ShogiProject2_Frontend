<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import type { Tag } from '@/types/api'
import { getTags, deleteTag } from '@/api/tags'

const router = useRouter()
const tags = ref<Tag[]>([])
const loading = ref(true)
const deleteDialogVisible = ref(false)
const tagToDelete = ref<Tag | null>(null)

onMounted(async () => {
  const res = await getTags()
  tags.value = res.items
  loading.value = false
})

function onRowClick(event: { data: Tag }) {
  router.push(`/tags/${event.data.tid}`)
}

function confirmDelete(tag: Tag) {
  tagToDelete.value = tag
  deleteDialogVisible.value = true
}

async function handleDelete() {
  if (!tagToDelete.value) return
  await deleteTag(tagToDelete.value.tid)
  tags.value = tags.value.filter((t) => t.tid !== tagToDelete.value!.tid)
  deleteDialogVisible.value = false
  tagToDelete.value = null
}
</script>

<template>
  <div class="tag-list-page">
    <div class="page-header">
      <h1>タグ一覧</h1>
      <Button
        label="新規作成"
        icon="pi pi-plus"
        @click="router.push('/tags/new')"
      />
    </div>

    <DataTable
      :value="tags"
      :loading="loading"
      stripedRows
      selectionMode="single"
      @row-click="onRowClick"
      class="tag-table"
    >
      <Column field="name" header="タグ名" sortable />
      <Column field="created" header="作成日" sortable style="width: 160px" />
      <Column field="latest_update" header="更新日" sortable style="width: 160px" />
      <Column header="操作" style="width: 140px">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              icon="pi pi-pencil"
              text
              size="small"
              @click.stop="router.push(`/tags/${data.tid}/edit`)"
            />
            <Button
              icon="pi pi-trash"
              text
              severity="danger"
              size="small"
              @click.stop="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-message">タグがありません</div>
      </template>
    </DataTable>

    <Dialog
      v-model:visible="deleteDialogVisible"
      header="タグの削除"
      :modal="true"
      :closable="true"
    >
      <p>
        タグ「{{ tagToDelete?.name }}」を削除しますか？<br />
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
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
}

.tag-table :deep(tr) {
  cursor: pointer;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--p-text-muted-color, #6b7280);
}
</style>
