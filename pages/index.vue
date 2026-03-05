<template>
  <div>
    <!-- Start Screen -->
    <StartScreen v-if="!isGameStarted" @start="startGame" />

    <!-- Game Screen -->
    <div v-else class="container mx-auto p-4">
      <!-- Navigation Tabs -->
      <nav class="mb-4 flex gap-2 overflow-x-auto rounded-lg bg-panel-bg p-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:bg-panel-light hover:text-white',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="grid gap-4 lg:grid-cols-[350px_1fr]">
        <!-- Left Panel -->
        <div class="space-y-4">
          <!-- Battle Panel (shown when in battle, regardless of tab) -->
          <BattlePanel
            v-if="character.isInBattle"
            :enemy="battle.currentEnemy.value"
            :player-name="character.name"
            :player-health="character.health"
            :player-max-health="character.maxHealth"
            :player-mana="character.mana"
            :player-max-mana="character.maxMana"
            :player-class="character.class"
          />

          <!-- Character -->
          <CharacterPanel
            v-if="activeTab === 'character'"
            :character="character"
          />

          <!-- Inventory -->
          <InventoryPanel
            v-if="activeTab === 'inventory'"
            :inventory="character.inventory"
            :max-inventory="character.maxInventory"
          />

          <!-- Quest -->
          <QuestPanel
            v-if="activeTab === 'quest'"
            :current-quest="character.currentQuest"
            :progress="questProgressPercent"
            :turns-passed="character.turnsPassed"
          />

          <!-- Map -->
          <MapPanel
            v-if="activeTab === 'mapPanel'"
            :location-key="character.location"
            :travel-cooldown="character.travelCooldown"
            :is-in-battle="character.isInBattle"
          />
        </div>

        <!-- Right Panel - Events -->
        <EventPanel :events="events" />
      </div>
    </div>

    <!-- Death Modal -->
    <DeathModal
      :is-visible="!character.isAlive && isGameStarted"
      @resurrect="handleResurrect"
    />
  </div>
</template>

<script setup lang="ts">
// Composables
const { character, isGameStarted, questProgressPercent, startGame: startCharacterGame } = useCharacter();
const { events, addEvent } = useEvents();

// Inventory composable
const inventory = useInventory(character);

// Quests composable
const quests = useQuests(character);

// Training composable
const training = useTraining(character, addEvent);

// Travel composable
const travel = useTravel(character, addEvent);
const { currentLocation } = travel;

// Battle composable
const battle = useBattle(character, addEvent, () => {
  gameLoop.stop();
});

// Trader composable
const trader = useTrader(character, addEvent, {
  shouldBuyItem: inventory.shouldBuyItem,
  sellWorstItem: inventory.sellWorstItem,
  addItem: inventory.addItem,
});

// Game Loop
const gameLoop = useGameLoop(character, addEvent, {
  onBattle: battle.startBattle,
  onTravel: travel.travel,
  onLocationEvent: travel.getLocationEvent,
  onQuestCheck: quests.checkQuestProgress,
  onQuestComplete: quests.completeQuest,
  onQuestGenerate: quests.generateNewQuest,
  onAutoUseItems: inventory.autoUseItems,
  onTraderMeet: trader.meetTrader,
  onTrain: training.train,
});

// UI State
const activeTab = ref("character");
const tabs = [
  { id: "character", label: "Персонаж" },
  { id: "inventory", label: "Инвентарь" },
  { id: "quest", label: "Задание" },
  { id: "mapPanel", label: "Локация" },
];

// Methods
const startGame = (name: string) => {
  startCharacterGame(name);
  addEvent(`Игра началась! ${name} начинает приключение.`);
  
  // Generate first quest
  nextTick(() => {
    quests.generateNewQuest();
    gameLoop.start();
  });
};

const handleResurrect = () => {
  const char = useCharacter();
  char.resurrectHero();
  addEvent("⚡ Воскрешение! Потерян 1 уровень и 50% монет", "death");
  
  // Generate new quest if needed
  if (!character.value.currentQuest) {
    quests.generateNewQuest();
  }
  
  gameLoop.start();
};

// Watch for level up
watch(
  () => character.value.xp,
  (newXp, oldXp) => {
    if (newXp > oldXp && character.value.xp >= character.value.nextLevel) {
      // Level up happened
      setTimeout(() => {
        addEvent(`✨ Уровень повышен! Теперь уровень ${character.value.level}`, "quest");
      }, 100);
      
      if (character.value.level === 2) {
        setTimeout(() => {
          addEvent(`🎓 Новый класс: ${character.value.class}!`, "quest");
        }, 500);
      }
    }
  }
);

// Watch for quest generation
watch(
  () => character.value.currentQuest,
  (newQuest, oldQuest) => {
    if (newQuest && (!oldQuest || newQuest.title !== oldQuest.title)) {
      addEvent(`📜 Новое задание: "${newQuest.title}"`, "quest");
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  gameLoop.stop();
});
</script>
