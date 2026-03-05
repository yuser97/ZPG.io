export const ENEMIES = [
  { name: "Гоблин", health: 10, attack: 2 },
  { name: "Орк", health: 20, attack: 4 },
  { name: "Дракон", health: 30, attack: 6 },
] as const;

export const ITEMS = {
  healthPotion: {
    name: "Зелье здоровья",
    effect: { health: 30 },
    price: 15,
    type: "consumable" as const,
  },
  manaPotion: {
    name: "Зелье маны",
    effect: { mana: 40 },
    price: 20,
    type: "consumable" as const,
  },
  scrollFire: {
    name: "Свиток огня",
    effect: { damage: 50 },
    price: 35,
    type: "combat" as const,
  },
  elixir: {
    name: "Эликсир силы",
    effect: { strength: 2 },
    price: 50,
    type: "permanent" as const,
  },
};

export const LOCATIONS = {
  city: {
    name: "Столица Эльдрамир",
    danger: 0,
    description: "Безопасная зона с гильдией авантюристов",
  },
  shadowTunnel: {
    name: "Туннель Теней",
    danger: 1,
    description: "Темный туннель с редкими слабосильными существами",
  },
  hauntedChambers: {
    name: "Призрачные Чертоги",
    danger: 2,
    description: "Заброшенные комнаты, населенные призраками",
  },
  crystalCave: {
    name: "Пещера Кристаллов",
    danger: 1,
    description: "Светящаяся пещера с магическими кристаллами",
  },
  ancientVault: {
    name: "Древний Склеп",
    danger: 3,
    description: "Забытое хранилище с ловушками и сильными врагами",
  },
  forbiddenLabyrinth: {
    name: "Запретный Лабиринт",
    danger: 4,
    description: "Сложный лабиринт с разумными ловушками",
  },
  deepAbyss: {
    name: "Глубокая Бездна",
    danger: 5,
    description: "Опасная зона с сильными существами и неизвестными тайнами",
  },
  hiddenTemple: {
    name: "Скрытый Храм",
    danger: 2,
    description: "Тайное святилище с древними артефактами",
  },
  fungalCavern: {
    name: "Грибковая Пещера",
    danger: 3,
    description: "Пещера, наполненная светящимися грибами и мутантами",
  },
  treasureHorde: {
    name: "Сокровищница",
    danger: 4,
    description: "Зона с богатыми сокровищами, охраняемая могущественными стражами",
  },
};

export const QUEST_TITLES = [
  "Выжить 500 дней в этом мире",
  "Пройти 500 ходов без смертей",
  "500 шагов к величию",
  "Получить 500 очков существования",
  "Продержаться 500 циклов",
  "500 испытаний судьбы",
] as const;

export const WARRIOR_ABILITIES = {
  "Мощный удар": {
    chance: 0.3,
    damageMultiplier: 2.5,
    description: "Шанс 30% нанести критический удар",
  },
  Ярость: {
    chance: 0.2,
    heal: 15,
    description: "Шанс 20% восстановить 15 HP",
  },
};

export const MAGE_ABILITIES = {
  "Огненный шар": {
    chance: 0.4,
    damageMultiplier: 3,
    manaCost: 30,
    description: "Шанс 40% выпустить огненный шар (стоимость 30 маны)",
  },
  Исцеление: {
    chance: 0.25,
    heal: 25,
    manaCost: 20,
    description: "Шанс 25% восстановить 25 HP (стоимость 20 маны)",
  },
};

export type ItemType = (typeof ITEMS)[keyof typeof ITEMS];
export type LocationKey = keyof typeof LOCATIONS;
