<template>
  <div class="rounded-xl bg-panel-bg p-5">
    <h3 class="mb-4 text-xl font-bold text-primary">
      Персонаж: {{ character.name }}
    </h3>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-400">Уровень:</span>
        <span
          >{{ character.level }} ({{ character.xp }}/{{
            character.nextLevel
          }} XP)</span
        >
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Класс:</span>
        <span class="font-medium">{{ character.class }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Монеты:</span>
        <span class="text-amber-400">{{ character.coins }} 🪙</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Сила:</span>
        <span>{{ character.strength }}</span>
      </div>

      <div class="flex justify-between">
        <span class="text-gray-400">Магия:</span>
        <span>{{ character.magic }}</span>
      </div>

      <!-- Health Bar -->
      <div class="pt-2">
        <div class="mb-1 flex justify-between text-xs">
          <span class="text-gray-400">Здоровье:</span>
          <span>{{ character.health }}/{{ character.maxHealth }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-panel-light">
          <div
            class="h-full rounded-full bg-red-500 transition-all duration-300"
            :style="{ width: `${(character.health / character.maxHealth) * 100}%` }"
          />
        </div>
      </div>

      <!-- Mana Bar (for Mage) -->
      <div v-if="character.class === 'Маг'" class="pt-1">
        <div class="mb-1 flex justify-between text-xs">
          <span class="text-gray-400">Мана:</span>
          <span>{{ character.mana }}/{{ character.maxMana }}</span>
        </div>
        <div class="h-2 w-full rounded-full bg-panel-light">
          <div
            class="h-full rounded-full bg-blue-500 transition-all duration-300"
            :style="{ width: `${(character.mana / character.maxMana) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Class Abilities -->
    <div
      v-if="character.class === 'Воин' || character.class === 'Маг'"
      class="mt-4 rounded-lg bg-panel-light p-3"
    >
      <h4 class="mb-2 text-sm font-semibold text-primary">Способности:</h4>
      <div class="space-y-1 text-xs text-gray-400">
        <template v-if="character.class === 'Воин'">
          <p><strong class="text-yellow-400">Мощный удар:</strong> Шанс 30% нанести критический удар (x2.5)</p>
          <p><strong class="text-yellow-400">Ярость:</strong> Шанс 20% восстановить 15 HP</p>
        </template>
        <template v-if="character.class === 'Маг'">
          <p><strong class="text-cyan-400">Огненный шар:</strong> Шанс 40% выпустить огненный шар (30 маны)</p>
          <p><strong class="text-cyan-400">Исцеление:</strong> Шанс 25% восстановить 25 HP (20 маны)</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Character } from "~/composables/useCharacter";

defineProps<{
  character: Character;
}>();
</script>
