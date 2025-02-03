
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
    { name: 'Гоблин', health: 10, attack: 5 },
    { name: 'Орк', health: 30, attack: 10 },
    { name: 'Дракон', health: 65, attack: 20 }
];

const items = {
    healthPotion: { name: 'Зелье здоровья', effect: { health: 30 }, price: 15, type: 'consumable' },
    manaPotion: { name: 'Зелье маны', effect: { mana: 40 }, price: 20, type: 'consumable' },
    scrollFire: { name: 'Свиток огня', effect: { damage: 50 }, price: 35, type: 'combat' },
    elixir: { name: 'Эликсир силы', effect: { strength: 2 }, price: 50, type: 'permanent' }
};

const LOCATIONS = {
    city: { name: 'Столица Эльдрамир', danger: 0, description: 'Безопасная зона с гильдией авантюристов' },
    forest: { name: 'Лес Теней', danger: 1, description: 'Густой лес со слабыми противниками' },
    mountains: { name: 'Пики Хаоса', danger: 3, description: 'Опасная зона с сильными врагами' }
};

const QUESTS = {
    slay: {
        type: 'Убийство',
        target: ['Гоблин', 'Орк', 'Дракон'],
        amount: [3, 5, 7],
        reward: { xp: 150, coins: 50 }
    },
    collect: {
        type: 'Сбор',
        target: ['Зелье здоровья', 'Свиток огня'],
        amount: [2, 4],
        reward: { item: 'Эликсир силы' }
    },
    explore: {
        type: 'Исследование',
        target: ['Лес Теней', 'Пики Хаоса'],
        amount: [5, 8],
        reward: { xp: 200, coins: 100 }
    }
};

// Инициализация интервала для перемещений
setInterval(() => {
    if (character.travelCooldown > 0) {
        character.travelCooldown--;
        updateMapDisplay();
    }
}, 3000);

let gameInterval;

// Основные функции
function startGame() {
    const name = document.getElementById('nameInput').value;
    if (!name) return;
    
    character.name = name;
    document.getElementById('nameInput').remove();
    document.querySelector('button').remove();
    document.getElementById('GameStart').style.display = 'none';
    
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    addEvent(`Игра началась! ${character.name} начинает приключение.`);
}

function updateStats() {
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <h3>Персонаж: ${character.name}</h3>
        <p>Уровень: ${character.level} (${character.xp}/${character.nextLevel} XP)</p>
        <p>Класс: ${character.class}</p>
        <p>Монеты: ${character.coins} 🪙</p>
        <p>Сила: ${character.strength}</p>
        <p>Магия: ${character.magic}</p>
        <p>Здоровье: ${character.health}/${character.maxHealth}</p>
        ${character.class === 'Маг' ? `<p>Мана: ${character.mana}/${character.maxMana}</p>` : ''}
        <div class="inventory">
            <h4>Инвентарь (${character.inventory.length}/${character.maxInventory}):</h4>
            ${character.inventory.map(item => `<div class="item">${item.name}</div>`).join('')}
        </div>
        <div class="quest">
            <h4>Квест:</h4>
            ${character.currentQuest ? 
                `<p>${getQuestDescription(character.currentQuest)}</p>
                 <p>Прогресс: ${character.questProgress}/${character.currentQuest.amount}</p>` 
                : '<p>Нет активного квеста</p>'}
        </div>
    `;
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
    
    if (events.length >= 10) events[0].remove();
    
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = text;
    eventPanel.appendChild(eventDiv);
    eventPanel.scrollTop = eventPanel.scrollHeight;
}


function getRandom() {
    return Math.random() * (4 - 1) + 1;
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
function gameLoop() {
    if (!character.isAlive || character.isInBattle) return;
    
    if (character.travelCooldown === 0) {
        autoChangeLocation();
    }
    
    if (character.location === 'city') {
        character.health = Math.min(character.health + 15, character.maxHealth);
        character.mana = Math.min(character.mana + 25, character.maxMana);
    }
    
    if (character.location !== 'city') {
        const dangerLevel = LOCATIONS[character.location].danger;
        if (Math.random() < 0.3 + dangerLevel * 0.2) handleRandomEvent(dangerLevel);
    }
    
        handleQuests();
        checkLevelUp();
        autoUseItems();
        updateStats();
}

// Боевая система
async function startBattle(dangerLevel = 1) {
        character.isInBattle = true;
        const enemy = {...enemies[Math.floor(Math.random() * enemies.length)]};
        enemy.health *= 1 + dangerLevel * 0.5;
        enemy.attack *= 1 + dangerLevel * 0.3;
        setTimeout(() => {
            
            addEvent(`⚔️ БИТВА: ${character.name} vs ${enemy.name}!`);
        }, 3000);
    
        const scroll = character.inventory.find(i => i.type === 'combat');
    if (scroll) {
        enemy.health -= scroll.effect.damage;
        addEvent(`🔥 СВИТОК: ${scroll.name} наносит ${scroll.effect.damage} урона!`);
        character.inventory.splice(character.inventory.indexOf(scroll), 1);
    }

    while (enemy.health > 0 && character.health > 0) {
        await attackCycle(character, enemy);
        if (enemy.health <= 0) break;
        await attackCycle(enemy, character);
    }

    if (character.health > 0) {
        const xpGain = Math.floor(enemy.attack * 2);
        character.xp += xpGain;
        setTimeout(() => {
            addEvent(`🎉 ПОБЕДА: Получено ${xpGain} XP!`);
        }, 3000);
        character.health = Math.min(character.health + 20, character.maxHealth);
    } else {
        setTimeout(() => {     
            addEvent(`💀 ПОРАЖЕНИЕ: ${character.name} погиб!`);
        }, 3000);
        character.isAlive = false;
        clearInterval(gameInterval);
        showDeathMenu();
    }
    character.isInBattle = false;
}

function attackCycle(attacker, defender) {
    return new Promise(resolve => {
        setTimeout(() => {
            const damage = calculateDamage(attacker, defender);
            defender.health -= damage;
            addEvent(`⚡ АТАКА: ${attacker.name} → ${defender.name} (${damage} урона)`);
            updateStats();
            resolve();
        }, 6000);
    });
}

function calculateDamage(attacker, defender) {
    if (attacker === character) {
        let baseDamage = character.class === 'Воин' ? 
            character.strength * 2 : 
            character.class === 'Маг' ? 
            character.magic * 2 : 
            Math.max(character.strength, character.magic);
        
        if (character.class === 'Воин' && Math.random() < 0.3) {
            baseDamage *= 2.5;
            addEvent(`💥 СПОСОБНОСТЬ: Мощный удар!`);
        }
        if (character.class === 'Маг' && Math.random() < 0.4 && character.mana >= 30) {
            baseDamage *= 3;
            character.mana -= 30;
            addEvent(`🔥 СПОСОБНОСТЬ: Огненный шар!`);
        }
        return Math.round(baseDamage);
    }
    return attacker.attack;
}

// Система квестов
function handleQuests() {
    if (character.location === 'city' && !character.currentQuest) {
        generateNewQuest();
    }
    checkQuestProgress();
}

function generateNewQuest() {
    const questTypes = Object.keys(QUESTS);
    const type = questTypes[Math.floor(Math.random() * questTypes.length)];
    const quest = QUESTS[type];
    
    character.currentQuest = {
        type: quest.type,
        target: quest.target[Math.floor(Math.random() * quest.target.length)],
        amount: quest.amount[Math.floor(Math.random() * quest.amount.length)],
        reward: {...quest.reward}
    };
    
    addEvent(`📜 Принят квест: ${getQuestDescription(character.currentQuest)}`);
}
function updateQuestProgress(eventText) {
    if (!character.currentQuest) return;
    
    // Обновление прогресса для квестов на убийство
    if (character.currentQuest.type === 'Убийство' && 
        eventText.includes('побеждает') && 
        eventText.includes(character.currentQuest.target)) {
        character.questProgress++;
    }
    
    // Обновление прогресса для исследовательских квестов
    if (character.currentQuest.type === 'Исследование' && 
        eventText.includes(character.currentQuest.target)) {
        character.questProgress++;
    }
}

function getQuestDescription(quest) {
    const descriptions = {
        'Убийство': `Уничтожить ${quest.amount} ${quest.target}`,
        'Сбор': `Собрать ${quest.amount} ${quest.target}`,
        'Исследование': `Посетить ${quest.target} ${quest.amount} раз`
    };
    return descriptions[quest.type];
}

function checkQuestProgress() {
    if (!character.currentQuest) return;
    
    let completed = false;
    switch(character.currentQuest.type) {
        case 'Убийство':
            completed = character.questProgress >= character.currentQuest.amount;
            break;
        case 'Сбор':
            const count = character.inventory.filter(i => i.name === character.currentQuest.target).length;
            completed = count >= character.currentQuest.amount;
            break;
        case 'Исследование':
            completed = character.questProgress >= character.currentQuest.amount;
            break;
    }
    
    if (completed) completeQuest();
}

function completeQuest() {
    addEvent(`🎖️ Квест выполнен: ${getQuestDescription(character.currentQuest)}`);
    
    const reward = character.currentQuest.reward;
    if (reward.xp) character.xp += reward.xp;
    if (reward.coins) character.coins += reward.coins;
    if (reward.item) {
        character.inventory.push({...items[Object.keys(items).find(k => items[k].name === reward.item)]});
        addEvent(`Получена награда: ${reward.item}`);
    }
    
    character.currentQuest = null;
    character.questProgress = 0;
    
    if (character.location !== 'city') {
        character.location = 'city';
        addEvent("🏃♂️ Герой возвращается в город за новым заданием");
        updateStats();
    }
}

// Система перемещений
function autoChangeLocation() {
    setTimeout(() => {
        const prevLocation = character.location;
        let newLocation;
        
        if (character.health < character.maxHealth * 0.4) {
            newLocation = 'city';
        } else {
            const locations = Object.keys(LOCATIONS).filter(l => l !== 'city');
            newLocation = locations[Math.floor(Math.random() * locations.length)];
            if (Math.random() < 0.3) newLocation = prevLocation;
        }
        
        if (newLocation !== prevLocation && character.travelCooldown === 0) {
            character.location = newLocation;
            character.travelCooldown = 3 + Math.floor(Math.random() * 4);
            addEvent(`🗺️ Перемещение: ${LOCATIONS[newLocation].name}`);
            handleLocationEvent(prevLocation, newLocation);
            updateMapDisplay();
        }      
    }, 3000);
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
                `Слышит странные звуки из темноты`
            ];
            addEvent(`🌌 ${character.name} ${events[Math.floor(Math.random() * events.length)]}`);
        }
        
    }, 3000);
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
    if (character.health < character.maxHealth * 0.5) {
        const potion = character.inventory.find(i => i.name === 'Зелье здоровья');
        if (potion) useItem(potion);
    }
    
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
    }, 3000);
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
    }, 3000);
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
            addEvent(`🎓 Новый класс: ${character.class}!`);
        }
        
        addEvent(`✨ Уровень повышен! Теперь уровень ${character.level}`);
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
    
    document.getElementById('eventPanel').innerHTML = '';
    document.getElementById('deathMenu').style.display = 'none';
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    addEvent("🔄 Игра перезапущена!");
}

function resurrectHero() {
    character.coins = Math.floor(character.coins * 0.5);
    character.level = Math.max(1, character.level - 1);
    character.xp = 0;
    character.nextLevel = 100 * Math.pow(1.5, character.level - 1);
    character.health = character.maxHealth;
    character.isAlive = true;
    character.inventory = [];
    
    document.getElementById('deathMenu').style.display = 'none';
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    setTimeout(() => { 
        addEvent("⚡ Воскрешение! Потерян 1 уровень и 50% монет");
    }, 3000);
}

