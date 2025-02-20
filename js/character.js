
export const character = {
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

// Система уровней
export function checkLevelUp() {
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
};

// Система смерти
export function showDeathMenu() {
    document.getElementById('deathMenu').style.display = 'block';
};

export function hideDeathMenu() {
    document.getElementById('deathMenu').style.display = 'none';
    document.getElementById('statPanel').style.display = 'block';
    document.getElementById('eventPanel').style.display = 'block';
};


export function resurrectHero() {
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
};