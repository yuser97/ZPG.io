import type { Character } from "./useCharacter";
import type { GameEvent } from "./useEvents";

export const useTraining = (
  characterRef: Ref<Character>,
  addEvent: (text: string, type: GameEvent["type"]) => void
) => {
  const train = () => {
    // Only train if we have space for improvement (not maxed out)
    const char = characterRef.value;
    
    if (Math.random() < 0.5) {
      char.strength += 1;
      addEvent(
        `💪 ${char.name} тренируется с мечом! Сила +1 (всего: ${char.strength})`,
        "info"
      );
    } else {
      char.magic += 1;
      addEvent(
        `✨ ${char.name} изучает заклинания! Магия +1 (всего: ${char.magic})`,
        "info"
      );
    }
  };

  return {
    train,
  };
};
