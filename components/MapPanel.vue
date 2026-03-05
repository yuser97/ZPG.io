<template>
  <div class="rounded-xl bg-panel-bg p-5">
    <h3 class="mb-4 text-lg font-semibold text-primary">Локация</h3>

    <div class="rounded-lg bg-panel-light p-4">
      <h4 class="mb-2 font-semibold text-white">{{ currentLocation.name }}</h4>
      <p class="mb-3 text-sm text-gray-400">{{ currentLocation.description }}</p>

      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-gray-500">Опасность:</span>
          <span class="text-yellow-400">{{ "★".repeat(currentLocation.danger) || "✓ Безопасно" }}</span>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-gray-500">Перемещение через:</span>
          <span :class="travelCooldown > 0 ? 'text-yellow-400' : 'text-green-400'">
            {{ travelCooldown > 0 ? `${travelCooldown} ходов` : "Готово" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Status Info -->
    <div class="mt-4 space-y-2 text-xs text-gray-500">
      <div v-if="isInBattle" class="flex items-center gap-2 text-red-400">
        <span>⚔️</span>
        <span>В бою!</span>
      </div>
      <div v-else-if="travelCooldown > 0" class="flex items-center gap-2 text-yellow-400">
        <span>⏳</span>
        <span>Отдыхает...</span>
      </div>
      <div v-else class="flex items-center gap-2 text-green-400">
        <span>🚶</span>
        <span>Готов к путешествию</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LOCATIONS } from "~/composables/useGameConfig";
import type { LocationKey } from "~/composables/useGameConfig";

const props = defineProps<{
  locationKey: LocationKey;
  travelCooldown: number;
  isInBattle: boolean;
}>();

const currentLocation = computed(() => LOCATIONS[props.locationKey]);
</script>
