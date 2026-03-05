<template>
  <div class="rounded-xl border-2 border-red-500/50 bg-red-900/20 p-5">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-bold text-red-400">⚔️ В бою!</h3>
      <span class="animate-pulse text-sm text-red-400">Идёт сражение...</span>
    </div>

    <div v-if="enemy" class="space-y-4">
      <!-- Enemy Info -->
      <div class="rounded-lg bg-panel-bg p-4">
        <div class="mb-2 flex items-center justify-between">
          <h4 class="text-xl font-bold text-yellow-400">{{ enemy.name }}</h4>
          <span class="text-sm text-gray-400">Враг</span>
        </div>

        <!-- Enemy Health Bar -->
        <div class="mb-1 flex justify-between text-sm">
          <span class="text-gray-400">Здоровье:</span>
          <span class="text-red-400">{{ Math.max(0, Math.floor(enemy.health)) }} / {{ Math.floor(enemy.maxHealth) }}</span>
        </div>
        <div class="h-3 w-full rounded-full bg-panel-light">
          <div
            class="h-full rounded-full bg-red-500 transition-all duration-500"
            :style="{ width: `${Math.max(0, Math.min(100, (enemy.health / enemy.maxHealth) * 100))}%` }"
          />
        </div>
      </div>

      <!-- VS Divider -->
      <div class="flex items-center justify-center">
        <span class="text-2xl font-bold text-gray-500">VS</span>
      </div>

      <!-- Player Info in Battle -->
      <div class="rounded-lg bg-panel-bg p-4">
        <div class="mb-2 flex items-center justify-between">
          <h4 class="text-xl font-bold text-primary">{{ playerName }}</h4>
          <span class="text-sm text-gray-400">Вы</span>
        </div>

        <!-- Player Health Bar -->
        <div class="mb-1 flex justify-between text-sm">
          <span class="text-gray-400">Здоровье:</span>
          <span class="text-green-400">{{ Math.floor(playerHealth) }} / {{ playerMaxHealth }}</span>
        </div>
        <div class="h-3 w-full rounded-full bg-panel-light">
          <div
            class="h-full rounded-full bg-green-500 transition-all duration-500"
            :style="{ width: `${Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100))}%` }"
          />
        </div>

        <!-- Player Mana Bar (if Mage) -->
        <div v-if="playerClass === 'Маг'" class="mt-2">
          <div class="mb-1 flex justify-between text-sm">
            <span class="text-gray-400">Мана:</span>
            <span class="text-blue-400">{{ Math.floor(playerMana) }} / {{ playerMaxMana }}</span>
          </div>
          <div class="h-2 w-full rounded-full bg-panel-light">
            <div
              class="h-full rounded-full bg-blue-500 transition-all duration-500"
              :style="{ width: `${Math.max(0, Math.min(100, (playerMana / playerMaxMana) * 100))}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Battle Status -->
      <div class="rounded-lg bg-yellow-500/10 p-3 text-center">
        <p class="text-sm text-yellow-400">
          Бой продолжается... Следующий удар через 15 секунд
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Enemy } from "~/composables/useBattle";

defineProps<{
  enemy: Enemy | null;
  playerName: string;
  playerHealth: number;
  playerMaxHealth: number;
  playerMana: number;
  playerMaxMana: number;
  playerClass: string;
}>();
</script>
