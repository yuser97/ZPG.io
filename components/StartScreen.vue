<template>
  <div class="flex min-h-screen flex-col items-center justify-center p-4">
    <div class="w-full max-w-md rounded-xl bg-panel-bg p-8 shadow-xl">
      <h1 class="mb-6 text-center text-3xl font-bold text-primary">
        Автономный герой
      </h1>
      <p class="mb-6 text-center text-gray-400">
        Введите имя вашего героя, чтобы начать приключение
      </p>
      <div class="flex flex-col gap-4">
        <input
          v-model="name"
          type="text"
          placeholder="Введите имя"
          class="rounded-lg border border-panel-light bg-panel-light px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          @keyup.enter="handleStart"
        />
        <button
          :disabled="!name.trim()"
          class="rounded-lg bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleStart"
        >
          Начать игру
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const name = ref("");

const emit = defineEmits<{
  start: [name: string];
}>();

const handleStart = () => {
  if (name.value.trim()) {
    emit("start", name.value.trim());
  }
};
</script>
