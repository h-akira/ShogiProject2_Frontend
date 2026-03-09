<script setup lang="ts">
defineProps<{
  moveCount: number
}>()

defineEmits<{
  undo: []
  reset: []
}>()
</script>

<template>
  <div class="input-controls">
    <button :disabled="moveCount <= 0" @click="$emit('undo')" title="一手戻す">一手戻す</button>
    <button :disabled="moveCount <= 0" @click="$emit('reset')" title="リセット" class="reset-btn">リセット</button>
  </div>
</template>

<style scoped>
.input-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-controls button {
  padding: 4px 12px;
  border: 1px solid #d4c5a9;
  border-radius: 4px;
  background: #fff;
  color: #2c2c2c;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
}

.input-controls button:hover:not(:disabled) {
  background: #f5efe5;
}

.input-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reset-btn {
  border-color: #c00 !important;
  color: #c00 !important;
}

.reset-btn:hover:not(:disabled) {
  background: #fee !important;
}
</style>
