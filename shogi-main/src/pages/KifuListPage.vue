<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import type { KifuSummary } from '@/types/api'
import { getKifus } from '@/api/kifus'

const router = useRouter()
const kifus = ref<KifuSummary[]>([])
const loading = ref(true)

const firstOrSecondLabel: Record<string, string> = {
  none: '-',
  first: '先手',
  second: '後手',
}

const resultLabel: Record<string, string> = {
  none: '-',
  win: '勝ち',
  lose: '負け',
  sennichite: '千日手',
  jishogi: '持将棋',
}

onMounted(async () => {
  const res = await getKifus()
  kifus.value = res.items
  loading.value = false
})

function onRowClick(event: { data: KifuSummary }) {
  router.push(`/kifus/${event.data.kid}`)
}
</script>

<template>
  <div class="kifu-list-page">
    <div class="page-header">
      <h1>棋譜一覧</h1>
      <Button
        label="新規作成"
        icon="pi pi-plus"
        @click="router.push('/kifus/new')"
      />
    </div>

    <DataTable
      :value="kifus"
      :loading="loading"
      stripedRows
      selectionMode="single"
      @row-click="onRowClick"
      class="kifu-table"
    >
      <Column field="slug" header="スラグ" sortable />
      <Column field="first_or_second" header="先後" sortable style="width: 80px">
        <template #body="{ data }">
          {{ firstOrSecondLabel[data.first_or_second] }}
        </template>
      </Column>
      <Column field="result" header="勝敗" sortable style="width: 80px">
        <template #body="{ data }">
          {{ resultLabel[data.result] }}
        </template>
      </Column>
      <Column header="タグ">
        <template #body="{ data }">
          <div class="tag-chips">
            <Chip v-for="tag in data.tags" :key="tag.tid" :label="tag.name" />
          </div>
        </template>
      </Column>
      <Column field="latest_update" header="更新日時" sortable style="width: 160px" />

      <template #empty>
        <div class="empty-message">棋譜がありません</div>
      </template>
    </DataTable>
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

.tag-chips {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
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
