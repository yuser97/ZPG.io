import { LOCATIONS } from "./useGameConfig";
import type { LocationKey } from "./useGameConfig";
import type { Character } from "./useCharacter";
import type { GameEvent } from "./useEvents";

export const useTravel = (
  characterRef: Ref<Character>,
  addEvent: (text: string, type: GameEvent["type"]) => void
) => {
  const canTravel = computed(() => {
    return (
      characterRef.value.travelCooldown === 0 &&
      !characterRef.value.isInBattle
    );
  });

  const getAvailableLocations = (): LocationKey[] => {
    return Object.keys(LOCATIONS).filter(
      (loc) => loc !== characterRef.value.location
    ) as LocationKey[];
  };

  const selectNewLocation = (): LocationKey => {
    const char = characterRef.value;

    // Return to city if low health
    if (char.health < char.maxHealth * 0.4 && char.travelCooldown === 0) {
      return "city";
    }

    // Random location (not city)
    const available = getAvailableLocations().filter((loc) => loc !== "city");
    return available[Math.floor(Math.random() * available.length)];
  };

  const travel = (): { newLocation: LocationKey; oldLocation: LocationKey } | null => {
    if (!canTravel.value) return null;

    const previousLocation = characterRef.value.location;
    let newLocation = selectNewLocation();

    // 30% chance to stay in current location
    if (Math.random() < 0.3) {
      newLocation = characterRef.value.location;
    }

    if (newLocation === previousLocation) return null;

    characterRef.value.location = newLocation;
    characterRef.value.travelCooldown = 3 + Math.floor(Math.random() * 3);

    addEvent(
      `🗺️ ${characterRef.value.name} переместился в ${LOCATIONS[newLocation].name}`,
      "info"
    );

    return { newLocation, oldLocation: previousLocation };
  };

  const getLocationEvent = (newLoc: LocationKey): { text: string; isCity: boolean } | null => {
    if (newLoc === "city") {
      return { text: "🏥 Полное восстановление в городе!", isCity: true };
    } else {
      const events = [
        `Чувствует древнюю магию в ${LOCATIONS[newLoc].name}`,
        `Замечает подозрительные следы`,
        `Слышит странные звуки из темноты`,
        `Находит древние письмена на стене`,
        `Встречает странствующего мудреца`,
        `Обнаруживает скрытый природный источник`,
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      return { text: `🌌 ${characterRef.value.name} ${randomEvent}`, isCity: false };
    }
  };

  const forceTravelToCity = () => {
    if (characterRef.value.location !== "city") {
      characterRef.value.location = "city";
      characterRef.value.health = characterRef.value.maxHealth;
      characterRef.value.mana = characterRef.value.maxMana;
      addEvent(
        `❗ ${characterRef.value.name} спешит вернуться в город для лечения!`,
        "info"
      );
    }
  };

  const currentLocation = computed(() => {
    return LOCATIONS[characterRef.value.location];
  });

  return {
    canTravel,
    currentLocation,
    travel,
    getLocationEvent,
    forceTravelToCity,
    getAvailableLocations,
  };
};
