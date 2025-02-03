let character = {
    location: 'city', // 'city', 'forest', 'mountains'
    travelCooldown: 0,
    name: '',
    level: 1,
    xp: 0,
    nextLevel: 100,
    strength: 5,
    magic: 5,
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    coins: 50,
    class: 'Новичок',
    abilities: [],
    inventory: [],
    maxInventory: 8,
    currentQuest: null,
    questProgress: 0,
    isAlive: true,
    isInBattle: false
};

let enemies = [
    { name: 'Гоблин', health: 20, attack: 5 },
    { name: 'Орк', health: 40, attack: 10 },
    { name: 'Дракон', health: 100, attack: 20 },
    { name: 'Юрец', health: 1000, attack: 50 }
];

function startGame() {
    const name = document.getElementById('nameInput').value;
    if (!name) return;
    
    character.name = name;
    document.getElementById('nameInput').remove();
    document.querySelector('button').remove();
    
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    addEvent(`Игра началась! ${character.name} начинает свое приключение.`);
}


function updateStats() {
    if (!character.isAlive) return;
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <div class="location">
        <p>Локация: ${LOCATIONS[character.location].name}</p>
        <p>Следующее перемещение через: ${character.travelCooldown} ходов</p>
        </div>
        <h3>${character.name}</h3>
        <p>Уровень: ${character.level} (${character.xp}/${character.nextLevel} XP)</p>
        <p>Класс: ${character.class}</p>
        <p>Монеты: ${character.coins} 🪙</p>
        <p>Сила: ${character.strength}</p>
        <p>Магия: ${character.magic}</p>
        <p>Здоровье: ${character.health}/${character.maxHealth}</p>
        ${character.class === 'Маг' ? `<p>Мана: ${character.mana}/${character.maxMana}</p>` : ''}
        <div class="inventory">
    <h4>Инвентарь (${character.inventory.length}/${character.maxInventory}):</h4>
    ${character.inventory.map(item => 
        `<div class="item" data-price="Цена: ${Math.floor(item.price * 0.7)}">
            ${item.name}
        </div>
                <div class="quest">
            <h4>Текущий квест:</h4>
            ${character.currentQuest ? 
                `<p>${formatQuestDescription(character.currentQuest)}</p>
                 <p>Прогресс: ${character.questProgress}/${character.currentQuest.amount}</p>` 
                : '<p>Нет активного квеста</p>'}
        </div>`
    ).join('')}
        </div>
        ${getAbilityDescriptions()}
    `;
}

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

const LOCATIONS = {
    city: {
        name: 'Столица Эльдрамир',
        danger: 0,
        description: 'Безопасная зона с лечебницами и магазинами'
    },
    forest: {
        name: 'Лес Теней',
        danger: 1,
        description: 'Густой лес с слабыми противниками'
    },
    mountains: {
        name: 'Пики Хаоса',
        danger: 3,
        description: 'Опасная зона с сильными врагами'
    }
};

const items = {
    healthPotion: {
        name: 'Зелье здоровья',
        effect: { health: 30 },
        price: 15,
        type: 'consumable'
    },
    manaPotion: {
        name: 'Зелье маны',
        effect: { mana: 40 },
        price: 20,
        type: 'consumable'
    },
    scrollFire: {
        name: 'Свиток огня',
        effect: { damage: 50 },
        price: 35,
        type: 'combat'
    },
    elixir: {
        name: 'Эликсир силы',
        effect: { strength: 2 },
        price: 50,
        type: 'permanent'
    }
};

let gameInterval;

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

function addEvent(text) {
    const eventPanel = document.getElementById('eventPanel');
    const events = eventPanel.getElementsByClassName('event');
    
    // Удаляем самое старое событие если уже есть 10
    if (events.length >= 10) {
        events[0].remove();
    }
    
    // Создаем новое событие
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = text;
    eventPanel.appendChild(eventDiv);
    
    // Авто-скролл к новому событию
    eventPanel.scrollTop = eventPanel.scrollHeight;
    updateQuestProgress(text);
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

function gameLoop() {
    if (!character.isAlive || character.isInBattle) return;

    if (character.travelCooldown <= 0 && Math.random() < 0.25) {
        autoChangeLocation();
    } else {
        character.travelCooldown--;
    }
    
    // Восстановление в городе
    if (character.location === 'city') {
        character.health = Math.min(character.health + 15, character.maxHealth);
        character.mana = Math.min(character.mana + 25, character.maxMana);
    }
    
    // Случайные события в зависимости от локации
    if (character.location !== 'city') {
        const dangerLevel = LOCATIONS[character.location].danger;
        const eventChance = 0.3 + dangerLevel * 0.2;
        
        if (Math.random() < eventChance) {
            handleRandomEvent(dangerLevel);
        }
    }
    
    // Авто-возвращение в город при низком здоровье
    if (character.health < character.maxHealth * 0.3 && character.location !== 'city') {
        addEvent(`❗${character.name} спешит вернуться в город для лечения!`);
        move('city');
        return;
    }
    
    handleQuests();
    updateStats();
}

function autoChangeLocation() {
    const previousLocation = character.location;
    let newLocation;
    
    // Логика выбора новой локации
    if (character.health < character.maxHealth * 0.4) {
        newLocation = 'city'; // Авто-возвращение в город при низком здоровье
    } else {
        const locationKeys = Object.keys(LOCATIONS);
        newLocation = locationKeys.filter(l => l !== 'city')[Math.floor(Math.random() * (locationKeys.length - 1))];
        
        // 30% шанс остаться в текущей локации
        if (Math.random() < 0.3) newLocation = character.location;
    }
    
    // Не перемещаемся, если новая локация совпадает с текущей
    if (newLocation === character.location) return;
    
    character.location = newLocation;
    character.travelCooldown = 3 + Math.floor(Math.random() * 3);
    
    addEvent(`🗺 ${character.name} переместился в ${LOCATIONS[newLocation].name}`);
    updateMapDisplay();
    
    // Специальные события при перемещении
    handleLocationEvent(previousLocation, newLocation);
}

function handleLocationEvent(oldLoc, newLoc) {
    if (newLoc === 'city') {
        addEvent("🏥 Лекарь города немедленно начинает лечение...");
        character.health = character.maxHealth;
        character.mana = character.maxMana;
    } else {
        const dangers = ['слышит странные звуки', 'замечает следы', 'чувствует магическую аномалию'];
        addEvent(`🌲 В ${LOCATIONS[newLoc].name} ${character.name} ${dangers[Math.floor(Math.random() * dangers.length)]}`);
    }
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

function autoUseItems() {
    // Авто-использование зелий здоровья
    if (character.health < character.maxHealth * 0.4) {
        const potion = character.inventory.find(i => i.name === 'Зелье здоровья');
        if (potion) {
            useItem(potion);
            return;
        }
    }
    
    // Авто-использование зелий маны
    if (character.mana < character.maxMana * 0.3 && character.class === 'Маг') {
        const potion = character.inventory.find(i => i.name === 'Зелье маны');
        if (potion) {
            useItem(potion);
        }
    }
}

function useItem(item) {
    const index = character.inventory.indexOf(item);
    if (index > -1) {
        character.inventory.splice(index, 1);
        
        if (item.effect.health) {
            character.health = Math.min(character.health + item.effect.health, character.maxHealth);
            addEvent(`ИСПОЛЬЗОВАН: ${item.name} (+${item.effect.health} HP)`);
        }
        if (item.effect.mana) {
            character.mana = Math.min(character.mana + item.effect.mana, character.maxMana);
            addEvent(`ИСПОЛЬЗОВАН: ${item.name} (+${item.effect.mana} маны)`);
        }
        if (item.effect.strength) {
            character.strength += item.effect.strength;
            addEvent(`ИСПОЛЬЗОВАН: ${item.name} (+${item.effect.strength} силы)`);
        }
        if (character.currentQuest?.type === 'Сбор' && item.name === character.currentQuest.target) {
            character.questProgress++;
        }
    }
    updateStats();
}
function handleQuests() {
    // Принимаем новый квест в городе
    if (character.location === 'city' && !character.currentQuest) {
        generateNewQuest();
    }
    
    // Проверяем выполнение квеста
    if (character.currentQuest) {
        checkQuestProgress();
    }
}

function generateNewQuest() {
    const questTypes = Object.keys(QUESTS);
    const type = questTypes[Math.floor(Math.random() * questTypes.length)];
    const quest = QUESTS[type];
    
    character.currentQuest = {
        type: quest.type,
        target: quest.target[Math.floor(Math.random() * quest.target.length)],
        amount: quest.amount[Math.floor(Math.random() * quest.amount.length)],
        progress: 0,
        reward: {...quest.reward}
    };
    
    addEvent(`📜 Принят новый квест: ${formatQuestDescription(character.currentQuest)}`);
}

function formatQuestDescription(quest) {
    const descriptions = {
        'Убийство': `Победить ${quest.amount} ${quest.target}`,
        'Сбор': `Собрать ${quest.amount} ${quest.target}`,
        'Исследование': `Посетить ${quest.target} ${quest.amount} раз`
    };
    return descriptions[quest.type];
}

function checkQuestProgress() {
    // Проверяем выполнение условий
    let isCompleted = false;
    
    switch(character.currentQuest.type) {
        case 'Убийство':
            isCompleted = (character.questProgress >= character.currentQuest.amount);
            break;
        case 'Сбор':
            const collected = character.inventory.filter(i => i.name === character.currentQuest.target).length;
            isCompleted = (collected >= character.currentQuest.amount);
            break;
        case 'Исследование':
            isCompleted = (character.questProgress >= character.currentQuest.amount);
            break;
    }
    
    // Если квест выполнен
    if (isCompleted) {
        completeQuest();
    }
}

function completeQuest() {
    addEvent(`🎉 Квест выполнен: ${formatQuestDescription(character.currentQuest)}`);
    
    // Выдача наград
    const reward = character.currentQuest.reward;
    if (reward.xp) {
        character.xp += reward.xp;
        addEvent(`Награда: +${reward.xp} XP`);
    }
    if (reward.coins) {
        character.coins += reward.coins;
        addEvent(`Награда: +${reward.coins} монет`);
    }
    if (reward.item) {
        character.inventory.push({...items[Object.keys(items).find(k => items[k].name === reward.item)]});
        addEvent(`Награда: Получен ${reward.item}`);
    }
    
    // Сброс квеста
    character.currentQuest = null;
    character.questProgress = 0;
    
    // Автоматическое возвращение в город
    if (character.location !== 'city') {
        character.location = 'city';
        addEvent("🏃 Герой возвращается в город для получения новой цели");
        updateMapDisplay();
    }
}

function meetTrader() {
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
}

function handleRandomEvent() {
    const events = [
        {
            type: 'battle',
            weight: 0.6,
            action: () => startBattle()
        },
        {
            type: 'treasure',
            weight: 0.3,
            action: () => {
                const coins = 20 + 666 * 15;
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
    if (Math.random() < 0.5) {
        character.strength += 1;
        addEvent(`${character.name} тренируется с мечом! Сила +1.`);
    } else {
        character.magic += 1;
        addEvent(`${character.name} изучает заклинания! Магия +1.`);
    }
}

function calculateDamage(attacker, defender) {
    if (attacker === character) {
        let baseDamage, abilityUsed = false;
        
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
        else {
            baseDamage = character.strength

        }
        
        return Math.round(baseDamage);
    }
    return attacker.attack;
}
function attackCycle(attacker, defender) {
    return new Promise(resolve => {
        setTimeout(() => {
            const isPlayer = attacker === character;
            const damage = calculateDamage(attacker, defender);
            
            defender.health -= damage;
            addEvent(`АТАКА: ${attacker.name} наносит ${damage} урона ${defender.name}!`);
            
            updateStats();
            resolve();
        }, 3000);
    });
}

async function startBattle() {
    const damage = calculateDamage(attacker, defender);
    const scaledEnemies = enemies.map(enemy => ({
        ...enemy,
        health: enemy.health * (1 + 666 * 0.5),
        attack: enemy.attack * (1 + 666 * 0.3)
    }));
    
    const enemy = {...scaledEnemies[Math.floor(Math.random() * scaledEnemies.length)]};
    if (scroll) {
        enemy.health -= damage;
        addEvent(`СВИТОК: ${scroll.name} наносит ${scroll.effect.damage} урона!`);
        character.inventory.splice(character.inventory.indexOf(scroll), 1);
    }

    while (enemy.health > 0 && character.health > 0) {
        // Атака игрока
        await attackCycle(character, enemy);
        if (enemy.health <= 0) break;
        
        // Атака врага
        await attackCycle(enemy, character);
    }

    if (character.health > 0) {
        const xpGain = 1000 * 2;
        character.xp += xpGain;
        addEvent(`ПОБЕДА: ${character.name} получает ${xpGain} XP!`);
        character.health = Math.min(character.health + 20, character.maxHealth);
    } 
    else {
        addEvent(`ПОРАЖЕНИЕ: ${character.name} пал в бою...`);
        character.isAlive = false;
        clearInterval(gameInterval);
        showDeathMenu(); // Показываем меню смерти
    }
    
    character.isInBattle = false;
    updateStats();
}



function checkLevelUp() {
    if (character.xp >= character.nextLevel) {
        character.level++;
        character.xp -= character.nextLevel;
        character.nextLevel = Math.floor(character.nextLevel * 1.5);
        character.maxHealth += 20;
        character.health = character.maxHealth;
        
        if (character.level === 2) {
            character.class = character.strength > character.magic ? 'Воин' : 'Маг';
            addEvent(`Поздравляем! ${character.name} стал ${character.class}!`);
        }
        
        addEvent(`Уровень повышен! Теперь ${character.name} уровень ${character.level}!`);
    }
}

function showDeathMenu() {
    document.getElementById('deathMenu').style.display = 'block';
    document.getElementById('statPanel').style.display = 'none';
    document.getElementById('eventPanel').style.display = 'none';
}

function hideDeathMenu() {
    document.getElementById('deathMenu').style.display = 'none';
    document.getElementById('statPanel').style.display = 'block';
    document.getElementById('eventPanel').style.display = 'block';
}

function restartGame() {
    // Сброс персонажа к начальным значениям
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
        abilities: [],
        isInBattle: false
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
    hideDeathMenu();
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 3000);
    updateStats();
    addEvent(`${character.name} воскрес из мертвых! Потерян 1 уровень и 50% монет.`);
}