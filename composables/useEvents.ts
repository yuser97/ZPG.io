export interface GameEvent {
  id: number;
  text: string;
  timestamp: number;
  type?: "info" | "battle" | "loot" | "quest" | "ability" | "trade" | "death";
}

export const useEvents = () => {
  const events = useState<GameEvent[]>("events", () => []);
  let eventIdCounter = 0;

  const addEvent = (
    text: string,
    type: GameEvent["type"] = "info"
  ): GameEvent => {
    const event: GameEvent = {
      id: ++eventIdCounter,
      text,
      timestamp: Date.now(),
      type,
    };

    // Add new events at the TOP
    events.value.unshift(event);

    // Keep only 10 most recent events (remove old ones from bottom)
    if (events.value.length > 10) {
      events.value.pop();
    }

    return event;
  };

  const clearEvents = () => {
    events.value = [];
  };

  const getEventColor = (type: GameEvent["type"]): string => {
    switch (type) {
      case "battle":
        return "text-yellow-400";
      case "loot":
        return "text-amber-400";
      case "quest":
        return "text-purple-400";
      case "ability":
        return "text-cyan-400";
      case "trade":
        return "text-green-400";
      case "death":
        return "text-red-500";
      default:
        return "text-gray-300";
    }
  };

  const getEventIcon = (type: GameEvent["type"]): string => {
    switch (type) {
      case "battle":
        return "⚔️";
      case "loot":
        return "💰";
      case "quest":
        return "📜";
      case "ability":
        return "⚡";
      case "trade":
        return "🏪";
      case "death":
        return "💀";
      default:
        return "📋";
    }
  };

  return {
    events,
    addEvent,
    clearEvents,
    getEventColor,
    getEventIcon,
  };
};
