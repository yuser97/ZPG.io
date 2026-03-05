import { LOCATIONS, ITEMS, ENEMIES, QUEST_TITLES } from "./useGameConfig";
import type { ItemType, LocationKey } from "./useGameConfig";

export interface Character {
  name: string;
  level: number;
  xp: number;
  nextLevel: number;
  strength: number;
  magic: number;
  health: number;
  maxHealth: number;
  class: string;
  isAlive: boolean;
  coins: number;
  inventory: ItemType[];
  maxInventory: number;
  mana: number;
  maxMana: number;
  isInBattle: boolean;
  location: LocationKey;
  travelCooldown: number;
  currentQuest: { title: string; type: string } | null;
  questProgress: number;
  turnsPassed: number;
  totalTurnsNeeded: number;
}

const defaultCharacter = (): Character => ({
  name: "",
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
});

export const useCharacter = () => {
  const character = useState<Character>("character", () => defaultCharacter());
  const isGameStarted = useState("isGameStarted", () => false);

  const startGame = (name: string) => {
    if (!name) return;
    character.value.name = name;
    isGameStarted.value = true;
  };

  const resetCharacter = () => {
    const name = character.value.name;
    character.value = {
      ...defaultCharacter(),
      name,
    };
  };

  const resurrectHero = () => {
    character.value.coins = Math.floor(character.value.coins * 0.5);
    character.value.level = Math.max(1, character.value.level - 1);
    character.value.xp = 0;
    character.value.nextLevel = 100 * Math.pow(1.5, character.value.level - 1);
    character.value.health = character.value.maxHealth;
    character.value.isAlive = true;
    character.value.inventory = [];
    character.value.mana = character.value.maxMana;
  };

  const levelUp = () => {
    if (character.value.xp >= character.value.nextLevel) {
      character.value.level++;
      character.value.xp -= character.value.nextLevel;
      character.value.nextLevel = Math.floor(character.value.nextLevel * 1.5);
      character.value.maxHealth += 20;
      character.value.health = character.value.maxHealth;

      if (character.value.level === 2) {
        character.value.class =
          character.value.strength > character.value.magic ? "Воин" : "Маг";
      }
      return true;
    }
    return false;
  };

  const addXp = (amount: number) => {
    character.value.xp += amount;
    return levelUp();
  };

  const addCoins = (amount: number) => {
    character.value.coins += amount;
  };

  const takeDamage = (damage: number) => {
    character.value.health = Math.max(0, character.value.health - damage);
    if (character.value.health <= 0) {
      character.value.isAlive = false;
      character.value.isInBattle = false;
      return true;
    }
    return false;
  };

  const heal = (amount: number) => {
    character.value.health = Math.min(
      character.value.maxHealth,
      character.value.health + amount
    );
  };

  const restoreMana = (amount: number) => {
    character.value.mana = Math.min(
      character.value.maxMana,
      character.value.mana + amount
    );
  };

  const increaseStat = (stat: "strength" | "magic", amount: number) => {
    character.value[stat] += amount;
  };

  const setLocation = (location: LocationKey) => {
    character.value.location = location;
  };

  const decreaseTravelCooldown = () => {
    if (character.value.travelCooldown > 0) {
      character.value.travelCooldown--;
    }
  };

  const setTravelCooldown = (cooldown: number) => {
    character.value.travelCooldown = cooldown;
  };

  const setBattleState = (inBattle: boolean) => {
    character.value.isInBattle = inBattle;
  };

  const incrementTurns = () => {
    character.value.turnsPassed++;
  };

  const resetTurns = () => {
    character.value.turnsPassed = 0;
  };

  const questProgressPercent = computed(() => {
    return Math.min(100, (character.value.turnsPassed * 100) / 500);
  });

  const dangerLevel = computed(() => {
    return LOCATIONS[character.value.location].danger;
  });

  return {
    character,
    isGameStarted,
    questProgressPercent,
    dangerLevel,
    startGame,
    resetCharacter,
    resurrectHero,
    addXp,
    addCoins,
    takeDamage,
    heal,
    restoreMana,
    increaseStat,
    setLocation,
    decreaseTravelCooldown,
    setTravelCooldown,
    setBattleState,
    incrementTurns,
    resetTurns,
  };
};
