import { ITEMS } from "./useGameConfig";
import type { ItemType } from "./useGameConfig";
import type { Character } from "./useCharacter";

export const useInventory = (characterRef: Ref<Character>) => {
  const addItem = (item: ItemType): boolean => {
    if (characterRef.value.inventory.length >= characterRef.value.maxInventory) {
      return false;
    }
    characterRef.value.inventory.push({ ...item });
    return true;
  };

  const removeItem = (index: number): ItemType | null => {
    if (index >= 0 && index < characterRef.value.inventory.length) {
      return characterRef.value.inventory.splice(index, 1)[0];
    }
    return null;
  };

  const findItem = (name: string): ItemType | undefined => {
    return characterRef.value.inventory.find((i) => i.name === name);
  };

  const findItemIndex = (name: string): number => {
    return characterRef.value.inventory.findIndex((i) => i.name === name);
  };

  const useItem = (
    item: ItemType
  ): { type: string; value: number; name: string } | null => {
    const index = characterRef.value.inventory.indexOf(item);
    if (index === -1) return null;

    characterRef.value.inventory.splice(index, 1);

    if (item.effect.health) {
      return {
        type: "health",
        value: item.effect.health,
        name: item.name,
      };
    }
    if (item.effect.mana) {
      return {
        type: "mana",
        value: item.effect.mana,
        name: item.name,
      };
    }
    if (item.effect.strength) {
      return {
        type: "strength",
        value: item.effect.strength,
        name: item.name,
      };
    }
    return null;
  };

  const sellItem = (index: number): number => {
    const item = characterRef.value.inventory[index];
    if (!item) return 0;

    const sellPrice = Math.floor(item.price * 0.7);
    characterRef.value.coins += sellPrice;
    characterRef.value.inventory.splice(index, 1);
    return sellPrice;
  };

  const sellWorstItem = (): { name: string; price: number } | null => {
    if (characterRef.value.inventory.length === 0) return null;

    const sellPriority = [
      "Свиток огня",
      "Зелье маны",
      "Зелье здоровья",
      "Эликсир силы",
    ];

    let worstItemIndex = -1;
    for (const itemType of sellPriority) {
      worstItemIndex = findItemIndex(itemType);
      if (worstItemIndex !== -1) break;
    }

    if (worstItemIndex === -1) worstItemIndex = 0;

    const item = characterRef.value.inventory[worstItemIndex];
    const price = sellItem(worstItemIndex);

    return { name: item.name, price };
  };

  const hasSpace = computed(() => {
    return characterRef.value.inventory.length < characterRef.value.maxInventory;
  });

  const inventoryCount = computed(() => {
    return characterRef.value.inventory.length;
  });

  const shouldBuyItem = (item: ItemType, price: number): boolean => {
    const inventoryCount = characterRef.value.inventory.filter(
      (i) => i.name === item.name
    ).length;

    const buyPriorities: Record<string, boolean> = {
      "Зелье здоровья":
        characterRef.value.health < characterRef.value.maxHealth * 0.6,
      "Зелье маны":
        characterRef.value.mana < characterRef.value.maxMana * 0.5 &&
        characterRef.value.class === "Маг",
      "Эликсир силы": true,
      "Свиток огня":
        characterRef.value.inventory.filter((i) => i.name === "Свиток огня")
          .length < 2,
    };

    return (
      (buyPriorities[item.name] || false) &&
      price <= characterRef.value.coins * 0.75 &&
      inventoryCount < 3
    );
  };

  const autoUseItems = (): Array<{
    type: string;
    value: number;
    name: string;
  }> => {
    const used: Array<{ type: string; value: number; name: string }> = [];

    // Health potion
    if (characterRef.value.health < characterRef.value.maxHealth * 0.5) {
      const potion = findItem("Зелье здоровья");
      if (potion) {
        const result = useItem(potion);
        if (result) used.push(result);
      }
    }

    // Mana potion
    if (
      characterRef.value.mana < characterRef.value.maxMana * 0.4 &&
      characterRef.value.class === "Маг"
    ) {
      const potion = findItem("Зелье маны");
      if (potion) {
        const result = useItem(potion);
        if (result) used.push(result);
      }
    }

    return used;
  };

  return {
    addItem,
    removeItem,
    findItem,
    findItemIndex,
    useItem,
    sellItem,
    sellWorstItem,
    hasSpace,
    inventoryCount,
    shouldBuyItem,
    autoUseItems,
  };
};
