<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { ShogiBoard } from 'shogi-board'
import type { SharedKifuDetail } from '@/api/generated/main/model'
import { getSharedKifu } from '@/api/generated/main/shared/shared'
import { sideLabel, resultLabel } from '@/utils/labels'

const route = useRoute()
const shareCode = route.params.shareCode as string

const kifu = ref<SharedKifuDetail | null>(null)
const boardRef = ref<InstanceType<typeof ShogiBoard>>()
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const res = await getSharedKifu(shareCode)
    if (res.status === 200) {
      kifu.value = res.data
    } else {
      error.value = true
    }
    loading.value = false

    setTimeout(() => {
      if (kifu.value?.kif && boardRef.value) {
        boardRef.value.loadKif(kifu.value.kif)
      }
    }, 100)
  } catch {
    error.value = true
    loading.value = false
  }
})

function copyKif() {
  if (!kifu.value?.kif) return
  navigator.clipboard.writeText(kifu.value.kif)
}
</script>

<template>
  <div class="shared-kifu-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else-if="error">
      <Message severity="error" :closable="false"> 共有棋譜が見つかりません </Message>
    </template>

    <template v-else-if="kifu">
      <h1>共有棋譜</h1>

      <div class="detail-layout">
        <div class="board-section">
          <ShogiBoard ref="boardRef" initialMode="playback" />
        </div>

        <div class="info-section">
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">先後</span>
              <span>{{ sideLabel[kifu.side] }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">勝敗</span>
              <span>{{ resultLabel[kifu.result] }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">作成日</span>
              <span>{{ kifu.created_at }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新日</span>
              <span>{{ kifu.updated_at }}</span>
            </div>
          </div>

          <div v-if="kifu.memo" class="memo-section">
            <span class="meta-label">メモ</span>
            <p class="memo-text">{{ kifu.memo }}</p>
          </div>

          <div v-if="kifu.kif" class="kif-section">
            <div class="kif-header">
              <span class="meta-label">棋譜</span>
              <Button icon="pi pi-copy" label="コピー" size="small" outlined @click="copyKif" />
            </div>
            <pre class="kif-text">{{ kifu.kif }}</pre>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.shared-kifu-page {
  padding: 1rem 0;
}

h1 {
  margin-bottom: 1.5rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

.board-section {
  max-width: 500px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color, #6b7280);
  text-transform: uppercase;
}

.memo-text {
  margin: 0;
  white-space: pre-wrap;
}

.kif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kif-text {
  margin: 0.25rem 0 0;
  padding: 0.5rem;
  background: var(--p-surface-50, #f9fafb);
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}
</style>
