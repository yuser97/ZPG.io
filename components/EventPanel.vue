<template>
  <div class="flex h-full flex-col rounded-xl bg-panel-bg p-5">
    <h3 class="mb-4 text-lg font-semibold text-primary">События</h3>

    <div
      ref="eventContainer"
      class="flex-1 space-y-2 overflow-y-auto pr-2"
      style="max-height: calc(100vh - 200px)"
    >
      <div
        v-for="event in events"
        :key="event.id"
        class="animate-fade-in rounded-lg bg-panel-light p-3 text-sm"
      >
        <div class="flex items-start gap-2">
          <span class="text-lg">{{ getEventIcon(event.type) }}</span>
          <p :class="getEventColor(event.type)">{{ event.text }}</p>
        </div>
        <p class="mt-1 text-right text-xs text-gray-600">
          {{ formatTime(event.timestamp) }}
        </p>
      </div>

      <div v-if="events.length === 0" class="py-8 text-center text-gray-500">
        <p>Пока нет событий...</p>
        <p class="mt-1 text-sm">Игра началась! События появятся здесь.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameEvent } from "~/composables/useEvents";

const props = defineProps<{
  events: GameEvent[];
}>();

const eventContainer = ref<HTMLDivElement>();

// Auto-scroll to TOP when new events added (since new events appear at top)
watch(
  () => props.events.length,
  () => {
    nextTick(() => {
      if (eventContainer.value) {
        eventContainer.value.scrollTop = 0;
      }
    });
  }
);

const getEventIcon = (type: GameEvent["type"]): string => {
  switch (type) {
    case "battle":
      return "⚔️";
    case "loot":
      return "💰";
    case "quest":
      return "📜";
    case "ability":
      return "⚡";
    case "trade":
      return "🏪";
    case "death":
      return "💀";
    default:
      return "📋";
  }
};

const getEventColor = (type: GameEvent["type"]): string => {
  switch (type) {
    case "battle":
      return "text-yellow-400";
    case "loot":
      return "text-amber-400";
    case "quest":
      return "text-purple-400";
    case "ability":
      return "text-cyan-400";
    case "trade":
      return "text-green-400";
    case "death":
      return "text-red-500";
    default:
      return "text-gray-300";
  }
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
</script>
