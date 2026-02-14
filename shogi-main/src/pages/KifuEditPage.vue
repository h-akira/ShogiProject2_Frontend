<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import ProgressSpinner from 'primevue/progressspinner'
import { ShogiBoard } from 'shogi-board'
import type { KifuDetail, KifuUpdateRequest, Tag } from '@/types/api'
import { getKifu, updateKifu } from '@/api/kifus'
import { getTags } from '@/api/tags'

const route = useRoute()
const router = useRouter()
const kid = route.params.kid as string
const boardRef = ref<InstanceType<typeof ShogiBoard>>()

const kifu = ref<KifuDetail | null>(null)
const slug = ref('')
const memo = ref('')
const firstOrSecond = ref('none')
const result = ref('none')
const share = ref(false)
const selectedTagIds = ref<string[]>([])
const kifText = ref('')
const inputMode = ref<'board' | 'text'>('board')
const saving = ref(false)
const loading = ref(true)
const tags = ref<Tag[]>([])

const firstOrSecondOptions = [
  { label: 'なし', value: 'none' },
  { label: '先手', value: 'first' },
  { label: '後手', value: 'second' },
]

const resultOptions = [
  { label: 'なし', value: 'none' },
  { label: '勝ち', value: 'win' },
  { label: '負け', value: 'lose' },
  { label: '千日手', value: 'sennichite' },
  { label: '持将棋', value: 'jishogi' },
]

const inputModeOptions = [
  { label: '将棋盤', value: 'board' },
  { label: 'テキスト', value: 'text' },
]

const tagOptions = computed(() =>
  tags.value.map((t) => ({ label: t.name, value: t.tid })),
)

onMounted(async () => {
  const [kifuData, tagRes] = await Promise.all([getKifu(kid), getTags()])
  kifu.value = kifuData
  tags.value = tagRes.items

  slug.value = kifuData.slug.replace(/\.kif$/, '')
  memo.value = kifuData.memo
  firstOrSecond.value = kifuData.first_or_second
  result.value = kifuData.result
  share.value = kifuData.share
  selectedTagIds.value = kifuData.tags.map((t) => t.tid)
  kifText.value = kifuData.kifu

  loading.value = false

  // Load KIF into board
  if (kifuData.kifu) {
    setTimeout(() => {
      boardRef.value?.loadKif(kifuData.kifu)
      boardRef.value?.switchToInput()
    }, 100)
  }
})

async function handleSave() {
  saving.value = true
  try {
    let kifuStr = ''
    if (inputMode.value === 'board') {
      kifuStr = boardRef.value?.getKif() ?? ''
    } else {
      kifuStr = kifText.value
    }

    const req: KifuUpdateRequest = {
      slug: slug.value,
      kifu: kifuStr,
      memo: memo.value,
      first_or_second: firstOrSecond.value as KifuUpdateRequest['first_or_second'],
      result: result.value as KifuUpdateRequest['result'],
      share: share.value,
      tag_ids: selectedTagIds.value,
    }

    await updateKifu(kid, req)
    router.push(`/kifus/${kid}`)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="kifu-edit-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else>
      <h1>棋譜編集</h1>

      <div class="form-grid">
        <div class="form-field">
          <label for="slug">スラグ</label>
          <InputText
            id="slug"
            v-model="slug"
            class="w-full"
          />
          <small>パス区切り「/」で階層化可能。.kif は自動付与</small>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="first-or-second">先後</label>
            <Select
              id="first-or-second"
              v-model="firstOrSecond"
              :options="firstOrSecondOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="result">勝敗</label>
            <Select
              id="result"
              v-model="result"
              :options="resultOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="tags">タグ</label>
          <MultiSelect
            id="tags"
            v-model="selectedTagIds"
            :options="tagOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="タグを選択"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="memo">メモ</label>
          <Textarea
            id="memo"
            v-model="memo"
            rows="3"
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label>共有</label>
          <div class="toggle-row">
            <ToggleSwitch v-model="share" />
            <span>{{ share ? '有効' : '無効' }}</span>
          </div>
        </div>

        <div class="form-field">
          <label>棋譜入力方式</label>
          <SelectButton
            v-model="inputMode"
            :options="inputModeOptions"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        <div v-if="inputMode === 'board'" class="board-container">
          <ShogiBoard ref="boardRef" initialMode="input" />
        </div>

        <div v-else class="form-field">
          <label for="kif-text">KIF テキスト</label>
          <Textarea
            id="kif-text"
            v-model="kifText"
            rows="15"
            class="w-full kif-textarea"
          />
        </div>

        <div class="form-actions">
          <Button
            label="更新"
            icon="pi pi-save"
            :loading="saving"
            @click="handleSave"
          />
          <Button
            label="キャンセル"
            severity="secondary"
            outlined
            @click="router.back()"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kifu-edit-page {
  padding: 1rem 0;
}

h1 {
  margin-bottom: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 800px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field label {
  font-weight: 600;
  font-size: 0.875rem;
}

.form-field small {
  color: var(--p-text-muted-color, #6b7280);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.w-full {
  width: 100%;
}

.kif-textarea {
  font-family: monospace;
}

.board-container {
  max-width: 500px;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
}
</style>
