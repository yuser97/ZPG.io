<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
  >
    <div
      class="w-full max-w-md rounded-2xl border-2 border-danger bg-panel-bg p-8 text-center shadow-2xl"
      style="box-shadow: 0 0 20px rgba(255, 68, 68, 0.3)"
    >
      <h2 class="mb-6 text-3xl font-bold text-danger">Герой пал в бою!</h2>
      <p class="mb-6 text-gray-400">Ваш герой был повержен в сражении.</p>

      <div class="mb-6 space-y-2">
        <div class="flex items-center justify-center gap-2 text-red-400">
          <span>💀 -50% монет</span>
        </div>
        <div class="flex items-center justify-center gap-2 text-red-400">
          <span>📉 -1 уровень</span>
        </div>
        <div class="flex items-center justify-center gap-2 text-red-400">
          <span>🎒 Инвентарь очищен</span>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <button
          class="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
          @click="emit('resurrect')"
        >
          Воскресить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits<{
  resurrect: [];
}>();
</script>
