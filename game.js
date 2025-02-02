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
    isInBattle: false
};

let gameInterval;
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
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <h3>${character.name}</h3>
        <p>Уровень: ${character.level} (${character.xp}/${character.nextLevel} XP)</p>
        <p>Класс: ${character.class}</p>
        <p>Сила: ${character.strength}</p>
        <p>Магия: ${character.magic}</p>
        <p>Здоровье: ${character.health}/${character.maxHealth}</p>
    `;
}

function addEvent(text) {
    const eventPanel = document.getElementById('eventPanel');
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = text;
    eventPanel.appendChild(eventDiv);
    eventPanel.scrollTop = eventPanel.scrollHeight;
}

function gameLoop() {
    if (!character.isAlive || character.isInBattle) return;
    
    // Случайные события
    const random = Math.random();
    if (random < 0.3) {
        findItem();
    } else if (random < 0.6) {
        train();
    } else {
        startBattle();
    }
    
    checkLevelUp();
    updateStats();
}

function findItem() {
    const xpGain = Math.floor(Math.random() * 20) + 10;
    character.xp += xpGain;
    addEvent(`${character.name} нашел магический артефакт! Получено ${xpGain} XP.`);
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

async function startBattle() {
    character.isInBattle = true;
    const enemy = {...enemies[Math.floor(Math.random() * enemies.length)]};
    addEvent(`БИТВА: ${character.name} встречает ${enemy.name}!`);

    while (enemy.health > 0 && character.health > 0) {
        // Атака игрока
        await attackCycle(character, enemy);
        if (enemy.health <= 0) break;
        
        // Атака врага
        await attackCycle(enemy, character);
    }

    if (character.health > 0) {
        const xpGain = enemy.health * 2;
        character.xp += xpGain;
        addEvent(`ПОБЕДА: ${character.name} получает ${xpGain} XP!`);
        character.health = Math.min(character.health + 20, character.maxHealth);
    } else {
        addEvent(`ПОРАЖЕНИЕ: ${character.name} пал в бою...`);
        character.isAlive = false;
        clearInterval(gameInterval);
    }
    
    character.isInBattle = false;
    updateStats();
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

function calculateDamage(attacker, defender) {
    if (attacker === character) {
        return character.class === 'Воин' ? 
            character.strength * 2 : 
            character.class === 'Маг' ? 
            character.magic * 2 : 
            Math.max(character.strength, character.magic);
    }


    return attacker.attack; 
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