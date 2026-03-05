<template>
  <div class="rounded-xl bg-panel-bg p-5">
    <h3 class="mb-4 text-lg font-semibold text-primary">
      Инвентарь ({{ inventory.length }}/{{ maxInventory }})
    </h3>

    <div v-if="inventory.length === 0" class="py-4 text-center text-gray-500">
      Инвентарь пуст
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in inventory"
        :key="index"
        class="flex items-center justify-between rounded-lg bg-panel-light px-3 py-2 text-sm"
      >
        <span>{{ item.name }}</span>
        <span class="text-xs text-gray-500">{{ getItemTypeLabel(item.type) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemType } from "~/composables/useGameConfig";

defineProps<{
  inventory: ItemType[];
  maxInventory: number;
}>();

const getItemTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    consumable: "Расходуемое",
    combat: "Боевое",
    permanent: "Постоянное",
  };
  return labels[type] || type;
};
</script>
