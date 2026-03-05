import {
  ENEMIES,
  WARRIOR_ABILITIES,
  MAGE_ABILITIES,
  LOCATIONS,
} from "./useGameConfig";
import type { Character } from "./useCharacter";
import type { GameEvent } from "./useEvents";

export interface Enemy {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
}

// Battle turn delay: 15 seconds
const BATTLE_TURN_DELAY = 15000;

export const useBattle = (
  characterRef: Ref<Character>,
  addEvent: (text: string, type: GameEvent["type"]) => void,
  onDeath: () => void
) => {
  const currentEnemy = ref<Enemy | null>(null);
  const isBattling = ref(false);

  const createEnemy = (): Enemy => {
    const baseEnemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
    const dangerLevel = LOCATIONS[characterRef.value.location].danger;
    const playerLevel = characterRef.value.level;

    return {
      name: baseEnemy.name,
      health: baseEnemy.health * dangerLevel * playerLevel,
      maxHealth: baseEnemy.health * dangerLevel * playerLevel,
      attack: baseEnemy.attack * dangerLevel * playerLevel,
    };
  };

  const calculateDamage = (
    attacker: "player" | Enemy,
    defender: "player" | Enemy
  ): { damage: number; abilityUsed?: string } => {
    let damage = 0;
    let abilityUsed: string | undefined;

    if (attacker === "player") {
      // Player attack
      const char = characterRef.value;
      let baseDamage = 0;

      if (char.class === "Воин") {
        baseDamage = char.strength * 2;
        for (const [ability, config] of Object.entries(WARRIOR_ABILITIES)) {
          if (Math.random() < config.chance) {
            if (ability === "Мощный удар") {
              baseDamage *= config.damageMultiplier;
              abilityUsed = ability;
            } else if (
              ability === "Ярость" &&
              char.health < char.maxHealth &&
              config.heal
            ) {
              char.health = Math.min(char.health + config.heal, char.maxHealth);
              abilityUsed = `${ability} (+${config.heal} HP)`;
            }
            if (abilityUsed) break;
          }
        }
      } else if (char.class === "Маг") {
        baseDamage = char.magic * 2;
        for (const [ability, config] of Object.entries(MAGE_ABILITIES)) {
          if (
            Math.random() < config.chance &&
            char.mana >= (config.manaCost || 0)
          ) {
            if (ability === "Огненный шар") {
              baseDamage *= config.damageMultiplier;
              char.mana -= config.manaCost || 0;
              abilityUsed = `${ability} (-${config.manaCost} маны)`;
            } else if (
              ability === "Исцеление" &&
              char.health < char.maxHealth &&
              config.heal
            ) {
              char.health = Math.min(char.health + config.heal, char.maxHealth);
              char.mana -= config.manaCost || 0;
              abilityUsed = `${ability} (+${config.heal} HP, -${config.manaCost} маны)`;
            }
            if (abilityUsed) break;
          }
        }
      } else {
        baseDamage = Math.max(char.strength, char.magic);
      }

      damage = Math.round(baseDamage);
    } else {
      // Enemy attack
      damage = (attacker as Enemy).attack;
    }

    return { damage, abilityUsed };
  };

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const startBattle = async (): Promise<"win" | "lose"> => {
    if (isBattling.value) return "lose";

    isBattling.value = true;
    characterRef.value.isInBattle = true;
    currentEnemy.value = createEnemy();

    const enemy = currentEnemy.value;
    addEvent(`⚔️ БИТВА: ${characterRef.value.name} vs ${enemy.name}!`, "battle");

    // Wait before battle starts
    await sleep(2000);

    while (enemy.health > 0 && characterRef.value.health > 0) {
      // Player attacks - wait 15 seconds
      await sleep(BATTLE_TURN_DELAY);
      
      const playerAttack = calculateDamage("player", "player");
      enemy.health -= playerAttack.damage;

      if (playerAttack.abilityUsed) {
        addEvent(
          `⚡ СПОСОБНОСТЬ: ${characterRef.value.name} использует ${playerAttack.abilityUsed}!`,
          "ability"
        );
      }

      addEvent(
        `⚔️ АТАКА: ${characterRef.value.name} → ${enemy.name} (${playerAttack.damage} урона)`,
        "battle"
      );

      if (enemy.health <= 0) break;

      // Enemy attacks - wait 15 seconds
      await sleep(BATTLE_TURN_DELAY);
      
      const enemyAttack = calculateDamage(enemy, "player");
      characterRef.value.health -= enemyAttack.damage;

      addEvent(
        `🛡️ АТАКА: ${enemy.name} → ${characterRef.value.name} (${enemyAttack.damage} урона)`,
        "battle"
      );

      if (characterRef.value.health <= 0) {
        characterRef.value.isAlive = false;
        characterRef.value.isInBattle = false;
        isBattling.value = false;
        addEvent(`💀 ПОРАЖЕНИЕ: ${characterRef.value.name} погиб!`, "death");
        onDeath();
        return "lose";
      }
    }

    // Victory
    if (enemy.health <= 0) {
      const xpGain = Math.floor(enemy.attack * 2);
      characterRef.value.xp += xpGain;
      characterRef.value.health = Math.min(
        characterRef.value.health + 20,
        characterRef.value.maxHealth
      );
      addEvent(`🎉 ПОБЕДА: Получено ${xpGain} XP!`, "battle");
    }

    characterRef.value.isInBattle = false;
    isBattling.value = false;
    currentEnemy.value = null;

    return "win";
  };

  return {
    currentEnemy: readonly(currentEnemy),
    isBattling: readonly(isBattling),
    startBattle,
    calculateDamage,
  };
};
