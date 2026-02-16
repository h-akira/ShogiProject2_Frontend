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
const totalCount = ref(0)

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
  totalCount.value = res.items.length
  kifus.value = res.items
    .sort((a, b) => b.latest_update.localeCompare(a.latest_update))
    .slice(0, 10)
  loading.value = false
})

function onRowClick(event: { data: KifuSummary }) {
  router.push(`/kifus/${event.data.kid}`)
}

function onTagClick(tid: string) {
  router.push(`/tags/${tid}`)
}
</script>

<template>
  <div class="kifu-list-page">
    <div class="page-header">
      <h1>マイページ</h1>
      <Button
        label="新規作成"
        icon="pi pi-plus"
        @click="router.push('/kifus/new')"
      />
    </div>

    <div v-if="!loading" class="summary-section">
      <div class="summary-card">
        <span class="summary-value">{{ totalCount }}</span>
        <span class="summary-label">保存棋譜数</span>
      </div>
    </div>

    <h2>最近の更新</h2>

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
            <Chip
              v-for="tag in data.tags"
              :key="tag.tid"
              :label="tag.name"
              class="tag-link"
              @click.stop="onTagClick(tag.tid)"
            />
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

.summary-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  border: 1px solid #d4c5a9;
  border-radius: 8px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #8b4513;
}

.summary-label {
  font-size: 0.875rem;
  color: #5a5a5a;
}

h2 {
  margin-bottom: 1rem;
}

.tag-chips {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag-link {
  cursor: pointer;
}

.tag-link:hover {
  opacity: 0.8;
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
