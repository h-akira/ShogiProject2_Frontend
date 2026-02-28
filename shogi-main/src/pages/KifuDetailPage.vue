<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import Dialog from 'primevue/dialog'
import SelectButton from 'primevue/selectbutton'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { ShogiBoard } from 'shogi-board'
import type { KifuDetail } from '@/api/generated/main/model'
import { getKifu, deleteKifu, regenerateShareCode } from '@/api/generated/main/kifus/kifus'
import { createAnalysis, getAnalysis } from '@/api/generated/analysis/analysis/analysis'
import { sideLabel, resultLabel } from '@/utils/labels'
import type { AnalysisResult, ThinkingTime } from '@/api/generated/analysis/model'

const route = useRoute()
const router = useRouter()
const kid = route.params.kid as string

const kifu = ref<KifuDetail | null>(null)
const boardRef = ref<InstanceType<typeof ShogiBoard>>()
const loading = ref(true)
const deleteDialogVisible = ref(false)
const regenerateDialogVisible = ref(false)

// Analysis
const thinkingTime = ref<ThinkingTime>(3000)
const analyzing = ref(false)
const analysisResult = ref<AnalysisResult | null>(null)

const thinkingTimeOptions = [
  { label: '3秒', value: 3000 },
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
]

onMounted(async () => {
  const res = await getKifu(kid)
  if (res.status === 200) {
    kifu.value = res.data
  }
  loading.value = false

  // Load KIF into board after next tick
  setTimeout(() => {
    if (kifu.value?.kif && boardRef.value) {
      boardRef.value.loadKif(kifu.value.kif)
    }
  }, 100)
})

async function handleDelete() {
  await deleteKifu(kid)
  router.push('/kifus')
}

async function handleAnalysis() {
  if (!boardRef.value) return
  const sfen = boardRef.value.getSfen()
  analyzing.value = true
  analysisResult.value = null

  const createRes = await createAnalysis({
    sfen,
    thinking_time: thinkingTime.value,
  })
  if (createRes.status !== 202) return

  const aid = createRes.data.aid

  // Poll for result
  const poll = async () => {
    const res = await getAnalysis(aid)
    if (res.status === 200 && res.data.status === 'running') {
      setTimeout(poll, 2000)
    } else if (res.status === 200) {
      analysisResult.value = res.data
      analyzing.value = false
    }
  }
  poll()
}

function copyShareLink() {
  if (!kifu.value) return
  const url = `${window.location.origin}/shared/${kifu.value.share_code}`
  navigator.clipboard.writeText(url)
}

async function handleRegenerateShareCode() {
  const res = await regenerateShareCode(kid)
  if (res.status === 200 && kifu.value) {
    kifu.value.share_code = res.data.share_code
  }
  regenerateDialogVisible.value = false
}
</script>

<template>
  <div class="kifu-detail-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else-if="kifu">
      <div class="page-header">
        <h1>{{ kifu.slug }}</h1>
        <div class="header-actions">
          <Button
            label="編集"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            @click="router.push(`/kifus/${kid}/edit`)"
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

          <div v-if="kifu.tags.length" class="meta-item">
            <span class="meta-label">タグ</span>
            <div class="tag-chips">
              <Chip
                v-for="tag in kifu.tags"
                :key="tag.tid"
                :label="tag.name"
                class="tag-link"
                @click="router.push(`/tags/${tag.tid}`)"
              />
            </div>
          </div>

          <div v-if="kifu.memo" class="memo-section">
            <span class="meta-label">メモ</span>
            <p class="memo-text">{{ kifu.memo }}</p>
          </div>

          <div v-if="kifu.shared" class="share-section">
            <span class="meta-label">共有リンク</span>
            <div class="share-row">
              <code class="share-code">/shared/{{ kifu.share_code?.slice(0, 12) }}...</code>
              <Button
                icon="pi pi-copy"
                text
                size="small"
                @click="copyShareLink"
              />
              <Button
                icon="pi pi-refresh"
                text
                size="small"
                severity="warning"
                @click="regenerateDialogVisible = true"
              />
            </div>
          </div>

          <!-- AI Analysis -->
          <div class="analysis-section">
            <h3>AI 局面解析</h3>
            <div class="analysis-controls">
              <SelectButton
                v-model="thinkingTime"
                :options="thinkingTimeOptions"
                optionLabel="label"
                optionValue="value"
              />
              <Button
                label="解析"
                icon="pi pi-play"
                :loading="analyzing"
                @click="handleAnalysis"
              />
            </div>

            <div v-if="analyzing" class="analysis-loading">
              <ProgressSpinner style="width: 30px; height: 30px" />
              <span>解析中...</span>
            </div>

            <div v-if="analysisResult?.status === 'completed' && analysisResult.candidates" class="analysis-results">
              <div
                v-for="c in analysisResult.candidates"
                :key="c.rank"
                class="candidate"
              >
                <span class="candidate-rank">#{{ c.rank }}</span>
                <span class="candidate-score">{{ c.score }}</span>
                <span class="candidate-pv">{{ c.pv }}</span>
              </div>
            </div>

            <Message
              v-if="analysisResult?.status === 'failed'"
              severity="error"
            >
              解析に失敗しました
            </Message>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete confirmation -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="棋譜の削除"
      :modal="true"
      :closable="true"
    >
      <p>この棋譜を削除しますか？この操作は取り消せません。</p>
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

    <!-- Regenerate share code confirmation -->
    <Dialog
      v-model:visible="regenerateDialogVisible"
      header="共有コードの再生成"
      :modal="true"
      :closable="true"
    >
      <p>共有コードを再生成しますか？既存の共有リンクは無効になります。</p>
      <template #footer>
        <Button
          label="キャンセル"
          severity="secondary"
          outlined
          @click="regenerateDialogVisible = false"
        />
        <Button
          label="再生成"
          severity="warning"
          @click="handleRegenerateShareCode"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.kifu-detail-page {
  padding: 1rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
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

.memo-text {
  margin: 0;
  white-space: pre-wrap;
}

.share-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.share-code {
  font-size: 0.875rem;
  background: var(--p-surface-100, #f3f4f6);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.analysis-section {
  border-top: 1px solid var(--p-surface-200, #e5e7eb);
  padding-top: 1rem;
}

.analysis-section h3 {
  margin: 0 0 0.75rem;
}

.analysis-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.analysis-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.analysis-results {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.candidate {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--p-surface-50, #f9fafb);
  border-radius: 4px;
  align-items: baseline;
}

.candidate-rank {
  font-weight: 700;
  color: var(--p-primary-color, #3b82f6);
  min-width: 2rem;
}

.candidate-score {
  font-weight: 600;
  min-width: 3rem;
}

.candidate-pv {
  font-size: 0.875rem;
}
</style>
