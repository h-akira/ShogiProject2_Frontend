<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { getTag, updateTag } from '@/api/tags'

const route = useRoute()
const router = useRouter()
const tid = route.params.tid as string

const name = ref('')
const saving = ref(false)
const loading = ref(true)

onMounted(async () => {
  const tag = await getTag(tid)
  name.value = tag.name
  loading.value = false
})

async function handleSave() {
  if (!name.value.trim()) return
  saving.value = true
  try {
    await updateTag(tid, { name: name.value.trim() })
    router.push('/tags')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="tag-edit-page">
    <template v-if="loading">
      <ProgressSpinner />
    </template>

    <template v-else>
      <h1>タグ編集</h1>

      <div class="form-grid">
        <div class="form-field">
          <label for="tag-name">タグ名</label>
          <InputText
            id="tag-name"
            v-model="name"
            class="w-full"
            maxlength="127"
          />
        </div>

        <div class="form-actions">
          <Button
            label="更新"
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
    </template>
  </div>
</template>

<style scoped>
.tag-edit-page {
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

.w-full {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
