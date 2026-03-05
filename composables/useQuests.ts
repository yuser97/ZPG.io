import { QUEST_TITLES } from "./useGameConfig";
import type { Character } from "./useCharacter";

export const useQuests = (characterRef: Ref<Character>) => {
  const generateNewQuest = (): { title: string; type: string } | null => {
    if (characterRef.value.location !== "city") return null;

    characterRef.value.turnsPassed = 0;
    characterRef.value.totalTurnsNeeded = 500;
    const quest = {
      title: QUEST_TITLES[Math.floor(Math.random() * QUEST_TITLES.length)],
      type: "Автоматическое",
    };
    characterRef.value.currentQuest = quest;
    return quest;
  };

  const completeQuest = (): boolean => {
    if (!characterRef.value.currentQuest) return false;

    characterRef.value.coins += 200;
    characterRef.value.xp += 500;
    characterRef.value.turnsPassed = 0;

    return true;
  };

  const checkQuestProgress = (): "completed" | "in_progress" | null => {
    if (!characterRef.value.currentQuest) return null;

    if (characterRef.value.turnsPassed >= 500) {
      return "completed";
    }
    return "in_progress";
  };

  const abandonQuest = () => {
    characterRef.value.currentQuest = null;
    characterRef.value.turnsPassed = 0;
  };

  const questProgressPercent = computed(() => {
    return Math.min(100, (characterRef.value.turnsPassed * 100) / 500);
  });

  return {
    generateNewQuest,
    completeQuest,
    checkQuestProgress,
    abandonQuest,
    questProgressPercent,
  };
};
