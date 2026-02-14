<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { ShogiBoard } from 'shogi-board'
import type { SharedKifu } from '@/types/api'
import { getSharedKifu } from '@/api/kifus'

const route = useRoute()
const shareCode = route.params.share_code as string

const kifu = ref<SharedKifu | null>(null)
const boardRef = ref<InstanceType<typeof ShogiBoard>>()
const loading = ref(true)
const error = ref(false)

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
  try {
    kifu.value = await getSharedKifu(shareCode)
    loading.value = false

    setTimeout(() => {
      if (kifu.value?.kifu && boardRef.value) {
        boardRef.value.loadKif(kifu.value.kifu)
      }
    }, 100)
  } catch {
    error.value = true
    loading.value = false
  }
})
</script>

<template>
  <div class="shared-kifu-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else-if="error">
      <Message severity="error" :closable="false">
        共有棋譜が見つかりません
      </Message>
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
              <span>{{ firstOrSecondLabel[kifu.first_or_second] }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">勝敗</span>
              <span>{{ resultLabel[kifu.result] }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">作成日</span>
              <span>{{ kifu.created }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">更新日</span>
              <span>{{ kifu.latest_update }}</span>
            </div>
          </div>

          <div v-if="kifu.memo" class="memo-section">
            <span class="meta-label">メモ</span>
            <p class="memo-text">{{ kifu.memo }}</p>
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
</style>
