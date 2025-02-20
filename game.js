
let character = {
    name: '',
    level: 1,
    xp: 0,
    nextLevel: 100,
    strength: 5,
    magic: 5,
    health: 100,
    maxHealth: 100,
    class: 'Новичок',
    isAlive: true,
    coins: 50,
    inventory: [],
    maxInventory: 8,
    mana: 100,
    maxMana: 100,
    isInBattle: false,
    location: 'city',
    travelCooldown: 0,
    currentQuest: null,
    questProgress: 0
};

let enemies = [
    { name: 'Гоблин', health: 10, attack: 2 },
    { name: 'Орк', health: 20, attack: 4 },
    { name: 'Дракон', health: 30, attack: 6 }
];

const items = {
    healthPotion: { name: 'Зелье здоровья', effect: { health: 30 }, price: 15, type: 'consumable' },
    manaPotion: { name: 'Зелье маны', effect: { mana: 40 }, price: 20, type: 'consumable' },
    scrollFire: { name: 'Свиток огня', effect: { damage: 50 }, price: 35, type: 'combat' },
    elixir: { name: 'Эликсир силы', effect: { strength: 2 }, price: 50, type: 'permanent' }
};

const LOCATIONS = {
    city: { name: 'Столица Эльдрамир', danger: 0, description: 'Безопасная зона с гильдией авантюристов' },
    shadowTunnel: { name: 'Туннель Теней', danger: 1, description: 'Темный туннель с редкими слабосильными существами' },
    hauntedChambers: { name: 'Призрачные Чертоги', danger: 2, description: 'Заброшенные комнаты, населенные призраками' },
    crystalCave: { name: 'Пещера Кристаллов', danger: 1, description: 'Светящаяся пещера с магическими кристаллами' },
    ancientVault: { name: 'Древний Склеп', danger: 3, description: 'Забытое хранилище с ловушками и сильными врагами' },
    forbiddenLabyrinth: { name: 'Запретный Лабиринт', danger: 4, description: 'Сложный лабиринт с разумными ловушками' },
    deepAbyss: { name: 'Глубокая Бездна', danger: 5, description: 'Опасная зона с сильными существами и неизвестными тайнами' },
    hiddenTemple: { name: 'Скрытый Храм', danger: 2, description: 'Тайное святилище с древними артефактами' },
    fungalCavern: { name: 'Грибковая Пещера', danger: 3, description: 'Пещера, наполненная светящимися грибами и мутантами' },
    treasureHorde: { name: 'Сокровищница', danger: 4, description: 'Зона с богатыми сокровищами, охраняемая могущественными стражами' }
};


const QUEST_TITLES = [
    "Выжить 500 дней в этом мире",
    "Пройти 500 ходов без смертей",
    "500 шагов к величию",
    "Получить 500 очков существования",
    "Продержаться 500 циклов",
    "500 испытаний судьбы"
];

// Инициализация интервала для перемещений
setInterval(() => {
    if (character.travelCooldown > 0) {
        character.travelCooldown--;
    }
}, 60000);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let gameInterval;

// Основные функции
function startGame() {
    const name = document.getElementById('nameInput').value;
    if (!name) return;
    
    character.name = name;
    document.querySelector('.start').style.display = 'none';
    document.querySelector('.navigation').style.display = 'flex'
    
    gameInterval = setInterval(gameLoop, 10000);
    updateStats();
    addEvent(`Игра началась! ${character.name} начинает приключение.`);
}
character.turnsPassed = 0;
function updateStats() {
    document.getElementById('questPercent').innerHTML = +character.turnsPassed * 100 / 500+'%';
    const statsDiv = document.getElementById('stats');
    const inventory = document.querySelector('#inventory')

    statsDiv.innerHTML = `
        <h3>Персонаж: ${character.name}</h3>
        <p>Уровень: ${character.level} (${character.xp}/${character.nextLevel} XP)</p>
        <p>Класс: ${character.class}</p>
        <p>Монеты: ${character.coins}  </p>
        <p>Сила: ${character.strength}</p>
        <p>Магия: ${character.magic}</p>
        <p>Здоровье: ${character.health}/${character.maxHealth}</p>
        ${character.class === 'Маг' ? `<p>Мана: ${character.mana}/${character.maxMana}</p>` : ''}
        `;
    inventory.innerHTML = `
    <div class="inventory">
        <h4>Инвентарь (${character.inventory.length}/${character.maxInventory}):</h4>
        ${character.inventory.map(item => `<div class="item">${item.name}</div>`).join('')}
    </div>
    `
}

// Cпособности классов
const warriorAbilities = {
    'Мощный удар': {
        chance: 0.3,
        damageMultiplier: 2.5,
        description: 'Шанс 30% нанести критический удар'
    },
    'Ярость': {
        chance: 0.2,
        heal: 15,
        description: 'Шанс 20% восстановить 15 HP'
    }
};

const mageAbilities = {
    'Огненный шар': {
        chance: 0.4,
        damageMultiplier: 3,
        manaCost: 30,
        description: 'Шанс 40% выпустить огненный шар (стоимость 30 маны)'
    },
    'Исцеление': {
        chance: 0.25,
        heal: 25,
        manaCost: 20,
        description: 'Шанс 25% восстановить 25 HP (стоимость 20 маны)'
    }
};

function getAbilityDescriptions() {
    if (character.class === 'Воин') {
        return Object.entries(warriorAbilities).map(([name, config]) => 
            `<p><strong>${name}:</strong> ${config.description}</p>`
        ).join('');
    }
    if (character.class === 'Маг') {
        return Object.entries(mageAbilities).map(([name, config]) => 
            `<p><strong>${name}:</strong> ${config.description}</p>`
        ).join('');
    }
    return '';
}

function addEvent(text) {
    const eventPanel = document.getElementById('eventPanel');
    const events = eventPanel.getElementsByClassName('event');

    // Удаляем самое старое событие если уже есть 10
    if (events.length >= 10) events[0].remove();
    
    // Создаем новое событие
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = text;
    eventPanel.appendChild(eventDiv);

    // Авто-скролл к новому событию
    eventPanel.scrollTop = eventPanel.scrollHeight;
}



function handleRandomEvent() {
        const events = [
            {
                type: 'train',
                weight: 0.65,
                action: () => train()
            },
            {
                type: 'battle',
                weight: 0.5,
                action: () => startBattle()
            },
            {
                type: 'treasure',
                weight: 0.3,
                action: () => {
                    const dangerLevel = LOCATIONS[character.location].danger;
                    const coins = 20 + dangerLevel * 15;
                    character.coins += coins;
                    addEvent(`Найден клад! Получено ${coins} монет`);
                } 
            },
            {
                type: 'trader',
                weight: 0.1,
                action: () => meetTrader()
            }
        ];
        const totalWeight = events.reduce((sum, e) => sum + e.weight, 0);
        const random = Math.random() * totalWeight;
        
        let cumulative = 0;
        for (const event of events) {
            cumulative += event.weight;
            if (random < cumulative) {
                event.action();
                break;
            }
        }
}

// Игровой цикл
const dangerLevel = LOCATIONS[character.location].danger;
function gameLoop() {
    if (!character.isAlive) {
        character.turnsPassed = 0; // Сбрасываем счётчик при смерти
        return;
    }
    if (!character.isAlive || character.isInBattle) return;
    
    if (character.travelCooldown === 0) {
        autoChangeLocation();
    }
    
    // Восстановление в городе
    if (character.location === 'city') {
        character.health = Math.min(character.health + 15, character.maxHealth);
        character.mana = Math.min(character.mana + 25, character.maxMana);
    }
    
    // Случайные события в зависимости от локации
    if (character.location !== 'city') {
        if (Math.random() < 0.3 + dangerLevel * 0.2) handleRandomEvent(dangerLevel);
    }

    // Авто-возвращение в город при низком здоровье
    if (character.health < character.maxHealth * 0.95 && character.location !== 'city') {
        addEvent(`❗${character.name} спешит вернуться в город для лечения!`);
    }
        character.turnsPassed++;
        handleQuests();
        checkLevelUp();
        autoUseItems();
        updateStats();
}

// Боевая система
async function startBattle() {
        character.isInBattle = true;
        const enemy = {...enemies[Math.floor(Math.random() * enemies.length)]};
        enemy.health *= 1 + dangerLevel * 0.5;
        enemy.attack *= 1 + dangerLevel * 0.3;
        setTimeout(() => {
            
            addEvent(`⚔️ БИТВА: ${character.name} vs ${enemy.name}!`);
        }, 15000);
        
        // if () {
        //     enemy.health -= scroll.effect.damage;
        //     addEvent(`🔥 СВИТОК: ${scroll.name} наносит ${scroll.effect.damage} урона!`);
        //     character.inventory.splice(character.inventory.indexOf(scroll), 1);
        // }
        // const scroll = character.inventory.find(i => i.type === 'combat');

    while (enemy.health > 0 && character.health > 0) {
         // Атака игрока
        await attackCycle(character, enemy);
         // Атака врага
        if (enemy.health <= 0) break;
        await attackCycle(enemy, character);
    }

    if (character.health > 0) {
        const xpGain = Math.floor(enemy.attack * 2);
        character.xp += xpGain;
        setTimeout(() => {
            addEvent(`🎉 ПОБЕДА: Получено ${xpGain} XP!`);
        }, 5000);
        character.health = Math.min(character.health + 20, character.maxHealth);
    } else {
        setTimeout(() => {     
            addEvent(`💀 ПОРАЖЕНИЕ: ${character.name} погиб!`);
        }, 5000);
        character.isAlive = false;
        clearInterval(gameInterval);
        showDeathMenu(); // Показываем меню смерти
    }
    character.isInBattle = false;
    updateStats();
}

function attackCycle(attacker, defender) {
    return new Promise(resolve => {
        setTimeout(() => {
            const damage = calculateDamage(attacker, defender);
            defender.health -= damage;
            addEvent(`⚡ АТАКА: ${attacker.name} → ${defender.name} (${damage} урона)`);
            updateStats();
            resolve();
        }, 20000);
    });
}

function calculateDamage(attacker, defender) {
    if (attacker === character) {
        let baseDamage = character.class === 'Воин' ? 
            character.strength * 2 : 
            character.class === 'Маг' ? 
            character.magic * 2 : 
            Math.max(character.strength, character.magic);
            let abilityUsed = false;
        
            if (character.class === 'Воин') {
                baseDamage = character.strength * 2;
                // Проверка способностей воина
                for (const [ability, config] of Object.entries(warriorAbilities)) {
                    if (Math.random() < config.chance) {
                        if (ability === 'Мощный удар') {
                            baseDamage *= config.damageMultiplier;
                            addEvent(`СПОСОБНОСТЬ: ${character.name} использует ${ability}!`);
                            abilityUsed = true;
                        } else if (ability === 'Ярость' && character.health < character.maxHealth) {
                            character.health = Math.min(character.health + config.heal, character.maxHealth);
                            addEvent(`СПОСОБНОСТЬ: ${character.name} использует ${ability} (+${config.heal} HP)!`);
                            abilityUsed = true;
                        }
                        if (abilityUsed) break;
                    }
                }
            } 
            if (character.class === 'Маг') {
                baseDamage = character.magic * 2;
                // Проверка способностей мага
                for (const [ability, config] of Object.entries(mageAbilities)) {
                    if (Math.random() < config.chance && character.mana >= config.manaCost) {
                        if (ability === 'Огненный шар') {
                            baseDamage *= config.damageMultiplier;
                            character.mana -= config.manaCost;
                            addEvent(`СПОСОБНОСТЬ: ${character.name} вызывает ${ability}! (Мана -${config.manaCost})`);
                            abilityUsed = true;
                        } else if (ability === 'Исцеление' && character.health < character.maxHealth) {
                            character.health = Math.min(character.health + config.heal, character.maxHealth);
                            character.mana -= config.manaCost;
                            addEvent(`СПОСОБНОСТЬ: ${character.name} использует ${ability}! (+${config.heal} HP, Мана -${config.manaCost})`);
                            abilityUsed = true;
                        }
                        if (abilityUsed) break;
                    }
                }
            }
        return Math.round(baseDamage);
    }
    return attacker.attack;
}

// Система квестов
function handleQuests() {
    // Принимаем новый квест в городе
    if (character.location === 'city' && !character.currentQuest) {
        generateNewQuest();
    }
    if(character.location !== 'city' && !character.currentQuest){
        addEvent(`Герой должен вернуться в город!`);
    }
    
    // Проверяем выполнение квеста
    if (character.currentQuest) {
        checkQuestProgress();
    }
}

function generateNewQuest() {
    character.turnsPassed = 0;
    character.totalTurnsNeeded = 500;
    character.currentQuest = {
        title: QUEST_TITLES[Math.floor(Math.random() * QUEST_TITLES.length)],
        type: 'Автоматическое'
    };
    document.getElementById('currentQuestTitle').textContent = character.currentQuest.title; 
        addEvent(`📜 Новое задание: "${character.currentQuest.title}"`);
}


function completeQuest() {
    setTimeout(() => {
        addEvent(`🎉 Задание "${character.currentQuest.title}" выполнено!`);
        character.coins += 200;
        character.xp += 500;
        addEvent(`Награда: +500 XP и 200 монет`);

        
        // Принимаем новый квест в городе
        if (character.location === 'city' ) {
            generateNewQuest();
        }
        if(character.location !== 'city' ){
            addEvent("🏃♂️ Герой возвращается в город за новым заданием");
            character.location = 'city'
            updateMapDisplay();
            if (character.location === 'city' ) {
                generateNewQuest();
                autoChangeLocation();
            }
        }
        updateStats();
        checkLevelUp();
        updateStats();
        
    }, 3000);
}


function checkQuestProgress() {
    setTimeout(() => {     
        // Проверка наличия активного квеста
        if (!character.currentQuest) {
            console.log("Нет активного задания");
            return false;
        }
        
        // Проверка условия выполнения
        const isCompleted = character.turnsPassed >= 500;
        // Дополнительные проверки (пример)
        if (isCompleted) {
            character.turnsPassed = 0
            completeQuest();
        }
        
        return isCompleted;
    }, 5000);
}


// Система перемещений
function autoChangeLocation() {
    setTimeout(() => {
        if (character.isInBattle === false){
            const previousLocation = character.location;
            let newLocation;
            
            // Логика выбора новой локации
                if (character.health < character.maxHealth * 0.4 && character.travelCooldown === 0) {
                    newLocation = 'city'; // Авто-возвращение в город при низком здоровье
                } else {
                    const locationKeys = Object.keys(LOCATIONS);
                    newLocation = locationKeys.filter(l => l !== 'city')[Math.floor(Math.random() * (locationKeys.length - 1))];
                    
                    // 30% шанс остаться в текущей локации
                    if (Math.random() < 0.3) newLocation = character.location;
                }
                
            // Не перемещаемся, если новая локация совпадает с текущей
            if (newLocation === character.location) return;
            
        if(character.travelCooldown === 0)
            character.location = newLocation;
            character.travelCooldown = 3 + Math.floor(Math.random() * 3);
            
            addEvent(` ${character.name} переместился в ${LOCATIONS[newLocation].name}`);
            updateMapDisplay();
            
            // Специальные события при перемещении
            handleLocationEvent(previousLocation, newLocation);
        }
        if (character.isInBattle === true){
            addEvent(` ${character.name} Пытался скрыться от врага, но не удачно!`); 
        }
    }, 27000);
}

function handleLocationEvent(oldLoc , newLoc) {
    setTimeout(() => {
        if (newLoc === 'city') {
            addEvent("🏥 Полное восстановление в городе!");
            character.health = character.maxHealth;
            character.mana = character.maxMana;
        } else {
            const events = [
                `Чувствует древнюю магию в ${LOCATIONS[newLoc].name}`,
                `Замечает подозрительные следы`,
                `Слышит странные звуки из темноты`,
                `Находит древние письмена на стене`,
                `Встречает странствующего мудреца`,
                `Обнаруживает скрытый природный источник`
            ];
            addEvent(`🌌 ${character.name} ${events[Math.floor(Math.random() * events.length)]}`);
        }
        
    }, 15000);
}

function updateMapDisplay() {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <strong>${LOCATIONS[character.location].name}</strong>
        <p>${LOCATIONS[character.location].description}</p>
        <p>Опасность: ${'★'.repeat(LOCATIONS[character.location].danger)}</p>
        <p>Следующее перемещение через: ${character.travelCooldown} ходов</p>
    `;
}

// Система предметов
function autoUseItems() {
    // Авто-использование зелий здоровья
    if (character.health < character.maxHealth * 0.5) {
        const potion = character.inventory.find(i => i.name === 'Зелье здоровья');
        if (potion) useItem(potion);
    }
    
    // Авто-использование зелий маны
    if (character.mana < character.maxMana * 0.4 && character.class === 'Маг') {
        const potion = character.inventory.find(i => i.name === 'Зелье маны');
        if (potion) useItem(potion);
    }
}

function useItem(item) {
    const index = character.inventory.indexOf(item);
    if (index > -1) {
        character.inventory.splice(index, 1);
        
        if (item.effect.health) {
            character.health = Math.min(character.health + item.effect.health, character.maxHealth);
            addEvent(`🧪 Использовано: ${item.name} (+${item.effect.health} HP)`);
        }
        if (item.effect.mana) {
            character.mana = Math.min(character.mana + item.effect.mana, character.maxMana);
            addEvent(`🧪 Использовано: ${item.name} (+${item.effect.mana} маны)`);
        }
        if (item.effect.strength) {
            character.strength += item.effect.strength;
            addEvent(`⚡ Использовано: ${item.name} (+${item.effect.strength} силы)`);
        }
        
        updateStats();
    }
}

//Торговля
function meetTrader() {
    setTimeout(() => {
        const itemKeys = Object.keys(items);
        const randomItem = items[itemKeys[Math.floor(Math.random() * itemKeys.length)]];
        const price = Math.floor(randomItem.price * (1 + Math.random() * 0.5));
        
        addEvent(`ТОРГОВЕЦ: Предлагает ${randomItem.name} за ${price} монет`);
        
        // Автоматическая покупка
        if (shouldBuyItem(randomItem, price)) {
            // Продаем предметы если нужно место/деньги
            while (character.coins < price || character.inventory.length >= character.maxInventory) {
                if (!sellWorstItem()) break;
            }
            
            if (character.coins >= price && character.inventory.length < character.maxInventory) {
                character.coins -= price;
                character.inventory.push({...randomItem});
                addEvent(`АВТО-ПОКУПКА: Приобретен ${randomItem.name}`);
            }
        }      
    }, 20000);
}
function shouldBuyItem(item, price) {
    const inventoryCount = character.inventory.filter(i => i.name === item.name).length;
    
    // Приоритеты покупки
    const buyPriorities = {
        'Зелье здоровья': character.health < character.maxHealth * 0.6,
        'Зелье маны': character.mana < character.maxMana * 0.5 && character.class === 'Маг',
        'Эликсир силы': true, // Всегда покупать
        'Свиток огня': character.inventory.filter(i => i.name === 'Свиток огня').length < 2
    };
    
    return (buyPriorities[item.name] || false) && 
           price <= character.coins * 0.75 &&
           inventoryCount < 3;
}

function sellWorstItem() {
    if (character.inventory.length === 0) return false;
    
    // Приоритеты продажи (от наименее полезного)
    const sellPriority = [
        'Свиток огня',
        'Зелье маны',
        'Зелье здоровья',
        'Эликсир силы'
    ];
    
    // Находим худший предмет
    let worstItem;
    for (const itemType of sellPriority) {
        worstItem = character.inventory.find(i => i.name === itemType);
        if (worstItem) break;
    }
    
    if (!worstItem) worstItem = character.inventory[0];
    
    // Продаем предмет
    const sellPrice = Math.floor(worstItem.price * 0.7);
    character.coins += sellPrice;
    character.inventory.splice(character.inventory.indexOf(worstItem), 1);
    addEvent(`АВТО-ПРОДАЖА: Продан ${worstItem.name} за ${sellPrice} монет`);
    
    return true;
}

function findItem() {
    const rand = Math.random();
    if (rand < 0.4) {
        const coins = Math.floor(Math.random() * 30) + 10;
        character.coins += coins;
        addEvent(`${character.name} нашел ${coins} монет!`);
    } else {
        // Автоматически продаем если нет места
        if (character.inventory.length >= character.maxInventory) {
            if (sellWorstItem()) {
                addEvent(`${character.name} автоматически продал предмет чтобы освободить место!`);
            }
            return;
        }
        
        const itemKeys = Object.keys(items);
        const foundItem = items[itemKeys[Math.floor(Math.random() * itemKeys.length)]];
        character.inventory.push({...foundItem});
        addEvent(`${character.name} нашел ${foundItem.name}!`);
    }
}

function train() {
    setTimeout(() => {     
        if (Math.random() < 0.5) {
            character.strength += 1;
            addEvent(`${character.name} тренируется с мечом! Сила +1.`);
        } else {
            character.magic += 1;
            addEvent(`${character.name} изучает заклинания! Магия +1.`);
        }
    }, 20000);
}

// Система уровней
function checkLevelUp() {
    if (character.xp >= character.nextLevel) {
        character.level++;
        character.xp -= character.nextLevel;
        character.nextLevel = Math.floor(character.nextLevel * 1.5);
        character.maxHealth += 20;
        character.health = character.maxHealth;
        
        if (character.level === 2) {
            character.class = character.strength > character.magic ? 'Воин' : 'Маг';
            setTimeout(() => {   
                addEvent(`🎓 Новый класс: ${character.class}!`);
            }, 4000);
        }
        setTimeout(() => { 
            addEvent(`✨ Уровень повышен! Теперь уровень ${character.level}`);
        }, 3000);
        updateStats();
    }
}

// Система смерти
function showDeathMenu() {
    document.getElementById('deathMenu').style.display = 'block';
}

function hideDeathMenu() {
    document.getElementById('deathMenu').style.display = 'none';
    document.getElementById('statPanel').style.display = 'block';
    document.getElementById('eventPanel').style.display = 'block';
}

function restartGame() {
    character = {
        name: character.name,
        level: 1,
        xp: 0,
        nextLevel: 100,
        strength: 5,
        magic: 5,
        health: 100,
        maxHealth: 100,
        class: 'Новичок',
        isAlive: true,
        coins: 50,
        inventory: [],
        maxInventory: 8,
        mana: 100,
        maxMana: 100,
        isInBattle: false,
        location: 'city',
        travelCooldown: 0,
        currentQuest: null,
        questProgress: 0
    };
    
    // Очистка событий
    document.getElementById('eventPanel').innerHTML = '';
    
    hideDeathMenu();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    addEvent(`Игра началась заново! ${character.name} возвращается к жизни.`);
}

function resurrectHero() {
    // Штрафы за воскрешение
    character.coins = Math.floor(character.coins * 0.5);
    character.level = Math.max(1, character.level - 1);
    character.xp = 0;
    character.nextLevel = 100 * Math.pow(1.5, character.level - 1);

    // Восстановление характеристик
    character.health = character.maxHealth;
    character.isAlive = true;
    character.inventory = [];
    
    // Обновление интерфейса
    document.getElementById('deathMenu').style.display = 'none';
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    setTimeout(() => { 
        addEvent("⚡ Воскрешение! Потерян 1 уровень и 50% монет");
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.navigation button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Обработчик клика по кнопкам
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Убираем активный класс у всех кнопок и контента
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Добавляем активный класс выбранной кнопке и соответствующему контенту
            tab.classList.add('active');
            const targetTab = tab.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Инициализация: показываем первую вкладку
    tabs[0].click();
});