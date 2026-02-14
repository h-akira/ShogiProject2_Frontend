<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { ShogiBoard } from 'shogi-board'
import type { KifuCreateRequest, Tag } from '@/types/api'
import { createKifu } from '@/api/kifus'
import { getTags } from '@/api/tags'

const router = useRouter()
const boardRef = ref<InstanceType<typeof ShogiBoard>>()

const slug = ref('')
const memo = ref('')
const firstOrSecond = ref('none')
const result = ref('none')
const share = ref(false)
const selectedTagIds = ref<string[]>([])
const kifText = ref('')
const inputMode = ref<'board' | 'text'>('board')
const saving = ref(false)
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

getTags().then((res) => {
  tags.value = res.items
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

    const req: KifuCreateRequest = {
      slug: slug.value,
      kifu: kifuStr,
      memo: memo.value,
      first_or_second: firstOrSecond.value as KifuCreateRequest['first_or_second'],
      result: result.value as KifuCreateRequest['result'],
      share: share.value,
      tag_ids: selectedTagIds.value,
    }

    const created = await createKifu(req)
    router.push(`/kifus/${created.kid}`)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="kifu-create-page">
    <h1>棋譜作成</h1>

    <div class="form-grid">
      <div class="form-field">
        <label for="slug">スラグ</label>
        <InputText
          id="slug"
          v-model="slug"
          placeholder="例: 2025/01/vs-tanaka"
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
          placeholder="対局の感想や分析コメント"
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
          placeholder="KIF形式の棋譜データを貼り付け"
        />
      </div>

      <div class="form-actions">
        <Button
          label="保存"
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
  </div>
</template>

<style scoped>
.kifu-create-page {
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
