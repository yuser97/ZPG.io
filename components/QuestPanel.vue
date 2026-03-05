<template>
  <div class="rounded-xl bg-panel-bg p-5">
    <h3 class="mb-4 text-lg font-semibold text-primary">Текущее задание</h3>

    <div v-if="!currentQuest" class="py-4 text-center text-gray-500">
      <p>Нет активного задания</p>
      <p class="mt-1 text-sm">Вернитесь в город, чтобы получить задание</p>
    </div>

    <div v-else>
      <p class="mb-3 text-green-400">{{ currentQuest.title }}</p>

      <!-- Progress Bar -->
      <div class="mb-2 flex justify-between text-xs text-gray-400">
        <span>Прогресс:</span>
        <span>{{ Math.round(progress) }}%</span>
      </div>
      <div class="h-3 w-full rounded-full bg-panel-light">
        <div
          class="h-full rounded-full bg-primary transition-all duration-500"
          :style="{ width: `${Math.min(100, progress)}%` }"
        />
      </div>
      <p class="mt-2 text-center text-sm text-gray-500">
        {{ Math.min(turnsPassed, 500) }} / 500 ходов
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentQuest: { title: string; type: string } | null;
  progress: number;
  turnsPassed: number;
}>();
</script>
