<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import { ShogiBoard } from 'shogi-board'
import type { KifuCreateRequest, Tag, Side, Result } from '@/api/generated/main/model'
import { createKifu } from '@/api/generated/main/kifus/kifus'
import { getTags } from '@/api/generated/main/tags/tags'

const router = useRouter()
const boardRef = ref<InstanceType<typeof ShogiBoard>>()

const slug = ref('')
const memo = ref('')
const side = ref<Side>('none')
const result = ref<Result>('none')
const shared = ref(false)
const selectedTagIds = ref<string[]>([])
const kifText = ref('')
const inputMode = ref<'board' | 'text'>('board')
const saving = ref(false)
const errorMessage = ref('')
const tags = ref<Tag[]>([])

const sideOptions = [
  { label: 'なし', value: 'none' },
  { label: '先手', value: 'sente' },
  { label: '後手', value: 'gote' },
]

const resultOptions = [
  { label: 'なし', value: 'none' },
  { label: '勝ち', value: 'win' },
  { label: '負け', value: 'loss' },
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
  if (res.status === 200) {
    tags.value = res.data.tags
  }
})

async function handleSave() {
  errorMessage.value = ''
  saving.value = true
  try {
    let kifStr = ''
    if (inputMode.value === 'board') {
      kifStr = boardRef.value?.getKif() ?? ''
    } else {
      kifStr = kifText.value
    }

    const req: KifuCreateRequest = {
      slug: slug.value,
      kif: kifStr,
      memo: memo.value,
      side: side.value,
      result: result.value,
      shared: shared.value,
      tag_ids: selectedTagIds.value,
    }

    const res = await createKifu(req)
    if (res.status === 201) {
      router.push(`/kifus/${res.data.kid}`)
    } else if (res.status === 409) {
      errorMessage.value = '同じ名前の棋譜が既に存在します'
    }
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
          <label for="side">先後</label>
          <Select
            id="side"
            v-model="side"
            :options="sideOptions"
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
          <ToggleSwitch v-model="shared" />
          <span>{{ shared ? '有効' : '無効' }}</span>
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

      <Message v-if="errorMessage" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>

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
