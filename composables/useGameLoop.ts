import { LOCATIONS, ITEMS } from "./useGameConfig";
import type { Character } from "./useCharacter";
import type { GameEvent } from "./useEvents";
import type { LocationKey } from "./useGameConfig";

// Random delay between min and max milliseconds
const getRandomDelay = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

// Sleep helper
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const useGameLoop = (
  characterRef: Ref<Character>,
  addEvent: (text: string, type: GameEvent["type"]) => void,
  options: {
    onBattle: () => Promise<"win" | "lose">;
    onTravel: () => { newLocation: LocationKey; oldLocation: LocationKey } | null;
    onLocationEvent: (loc: LocationKey) => { text: string; isCity: boolean } | null;
    onQuestCheck: () => "completed" | "in_progress" | null;
    onQuestComplete: () => boolean;
    onQuestGenerate: () => { title: string; type: string } | null;
    onAutoUseItems: () => Array<{ type: string; value: number; name: string }>;
    onTraderMeet: () => void;
    onTrain: () => void;
  }
) => {
  const isRunning = ref(false);
  const gameTimeout = ref<number | null>(null);
  const cooldownInterval = ref<number | null>(null);

  const scheduleNextTurn = () => {
    if (!isRunning.value) return;
    
    const delay = getRandomDelay(10000, 30000); // 10-30 seconds between turns
    gameTimeout.value = window.setTimeout(async () => {
      await processTurn();
      scheduleNextTurn();
    }, delay);
  };

  const start = () => {
    if (isRunning.value) return;

    isRunning.value = true;
    scheduleNextTurn();

    // Cooldown tick (every minute)
    cooldownInterval.value = window.setInterval(() => {
      if (characterRef.value.travelCooldown > 0) {
        characterRef.value.travelCooldown--;
      }
    }, 60000);
  };

  const stop = () => {
    isRunning.value = false;
    if (gameTimeout.value) {
      clearTimeout(gameTimeout.value);
      gameTimeout.value = null;
    }
    if (cooldownInterval.value) {
      clearInterval(cooldownInterval.value);
      cooldownInterval.value = null;
    }
  };

  const processTurn = async () => {
    const char = characterRef.value;

    if (!char.isAlive || char.isInBattle) return;

    // Step 1: Check/generate quest (first, before travel)
    if (!char.currentQuest && char.location === "city") {
      options.onQuestGenerate();
      await sleep(getRandomDelay(5000, 10000));
    }

    // Step 2: Travel (with delay before location event)
    if (char.travelCooldown === 0) {
      const travelResult = options.onTravel();
      if (travelResult) {
        // Wait 10-20 seconds after travel before location event
        await sleep(getRandomDelay(10000, 20000));
        
        // Handle location event
        const locationEvent = options.onLocationEvent(travelResult.newLocation);
        if (locationEvent) {
          addEvent(locationEvent.text, "info");
          if (locationEvent.isCity) {
            char.health = char.maxHealth;
            char.mana = char.maxMana;
          }
        }
        
        // Wait again after location event
        await sleep(getRandomDelay(8000, 15000));
      }
    }

    // Step 3: City regeneration (only if in city)
    if (char.location === "city") {
      char.health = Math.min(char.health + 15, char.maxHealth);
      char.mana = Math.min(char.mana + 25, char.maxMana);
    }

    // Step 4: Random events (outside city only)
    if (char.location !== "city") {
      const dangerLevel = LOCATIONS[char.location].danger;
      if (Math.random() < 0.3 + dangerLevel * 0.2) {
        await handleRandomEvent();
      }
    }

    // Step 5: Check for low health return to city
    if (char.health < char.maxHealth * 0.95 && char.location !== "city") {
      await sleep(getRandomDelay(8000, 15000));
      addEvent(
        `❗ ${char.name} спешит вернуться в город для лечения!`,
        "info"
      );
      char.location = "city";
      char.health = char.maxHealth;
      char.mana = char.maxMana;
      await sleep(getRandomDelay(5000, 10000));
      
      // City restoration event
      addEvent("🏥 Полное восстановление в городе!", "info");
      await sleep(getRandomDelay(5000, 10000));
    }

    // Step 6: Increment turns and check quest
    char.turnsPassed++;
    const questStatus = options.onQuestCheck();

    if (questStatus === "completed") {
      await sleep(getRandomDelay(5000, 10000));
      addEvent(
        `🎉 Задание "${char.currentQuest?.title}" выполнено!`,
        "quest"
      );
      options.onQuestComplete();
      await sleep(getRandomDelay(3000, 8000));
      addEvent(`Награда: +500 XP и 200 монет`, "quest");

      // Generate new quest if in city
      await sleep(getRandomDelay(5000, 10000));
      if (char.location === "city") {
        options.onQuestGenerate();
      } else {
        addEvent("🏃 Герой возвращается в город за новым заданием", "quest");
        char.location = "city";
        await sleep(getRandomDelay(5000, 10000));
        options.onQuestGenerate();
      }
    }

    // Step 7: Auto-use items (at the end)
    const usedItems = options.onAutoUseItems();
    for (const item of usedItems) {
      await sleep(getRandomDelay(3000, 6000));
      addEvent(`🧪 Использовано: ${item.name} (+${item.value} ${item.type})`, "info");
    }
  };

  const handleRandomEvent = async () => {
    const rand = Math.random();
    
    // Higher chance for battles in dangerous areas
    const dangerLevel = LOCATIONS[characterRef.value.location].danger;
    const battleChance = 0.4 + dangerLevel * 0.15;
    const trainChance = 0.3;
    const treasureChance = 0.2;
    const traderChance = 0.1;
    
    if (rand < battleChance) {
      addEvent(`👾 Враг замечен! Начинается бой...`, "battle");
      await sleep(getRandomDelay(5000, 10000));
      await options.onBattle();
    } else if (rand < battleChance + trainChance) {
      await sleep(getRandomDelay(5000, 10000));
      options.onTrain();
    } else if (rand < battleChance + trainChance + treasureChance) {
      await sleep(getRandomDelay(5000, 10000));
      const coins = 20 + dangerLevel * 15;
      characterRef.value.coins += coins;
      addEvent(`💰 Найден клад! Получено ${coins} монет`, "loot");
    } else if (rand < battleChance + trainChance + treasureChance + traderChance) {
      await sleep(getRandomDelay(5000, 10000));
      options.onTraderMeet();
    }
  };

  const restart = () => {
    stop();
    const name = characterRef.value.name;
    characterRef.value = {
      name,
      level: 1,
      xp: 0,
      nextLevel: 100,
      strength: 5,
      magic: 5,
      health: 100,
      maxHealth: 100,
      class: "Новичок",
      isAlive: true,
      coins: 50,
      inventory: [],
      maxInventory: 8,
      mana: 100,
      maxMana: 100,
      isInBattle: false,
      location: "city",
      travelCooldown: 0,
      currentQuest: null,
      questProgress: 0,
      turnsPassed: 0,
      totalTurnsNeeded: 500,
    };
    start();
  };

  onUnmounted(() => {
    stop();
  });

  return {
    isRunning: readonly(isRunning),
    start,
    stop,
    restart,
    processTurn,
  };
};
