import { ITEMS } from "./useGameConfig";
import type { Character } from "./useCharacter";
import type { GameEvent } from "./useEvents";

export const useTrader = (
  characterRef: Ref<Character>,
  addEvent: (text: string, type: GameEvent["type"]) => void,
  inventory: {
    shouldBuyItem: (item: (typeof ITEMS)[keyof typeof ITEMS], price: number) => boolean;
    sellWorstItem: () => { name: string; price: number } | null;
    addItem: (item: (typeof ITEMS)[keyof typeof ITEMS]) => boolean;
  }
) => {
  const meetTrader = () => {
    const itemKeys = Object.keys(ITEMS) as Array<keyof typeof ITEMS>;
    const randomItem = ITEMS[itemKeys[Math.floor(Math.random() * itemKeys.length)]];
    const price = Math.floor(randomItem.price * (1 + Math.random() * 0.5));

    addEvent(`🏪 ТОРГОВЕЦ: Предлагает ${randomItem.name} за ${price} монет`, "trade");

    // Auto-buy logic
    if (inventory.shouldBuyItem(randomItem, price)) {
      // Sell items if needed
      while (
        characterRef.value.coins < price ||
        characterRef.value.inventory.length >= characterRef.value.maxInventory
      ) {
        const sold = inventory.sellWorstItem();
        if (!sold) break;
        addEvent(`💰 АВТО-ПРОДАЖА: Продан ${sold.name} за ${sold.price} монет`, "trade");
      }

      if (
        characterRef.value.coins >= price &&
        characterRef.value.inventory.length < characterRef.value.maxInventory
      ) {
        characterRef.value.coins -= price;
        inventory.addItem(randomItem);
        addEvent(`🛒 АВТО-ПОКУПКА: Приобретен ${randomItem.name}`, "trade");
      }
    }
  };

  return {
    meetTrader,
  };
};
