<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { createTag } from '@/api/tags'

const router = useRouter()
const name = ref('')
const saving = ref(false)

async function handleSave() {
  if (!name.value.trim()) return
  saving.value = true
  try {
    await createTag({ name: name.value.trim() })
    router.push('/tags')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="tag-create-page">
    <h1>タグ作成</h1>

    <div class="form-grid">
      <div class="form-field">
        <label for="tag-name">タグ名</label>
        <InputText
          id="tag-name"
          v-model="name"
          placeholder="例: 居飛車"
          class="w-full"
          maxlength="127"
        />
        <small>1〜127文字</small>
      </div>

      <div class="form-actions">
        <Button
          label="保存"
          icon="pi pi-save"
          :loading="saving"
          :disabled="!name.trim()"
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
.tag-create-page {
  padding: 1rem 0;
}

h1 {
  margin-bottom: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 400px;
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

.w-full {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
