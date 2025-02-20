import { character, checkLevelUp, showDeathMenu, hideDeathMenu, resurrectHero } from './character.js';
import { enemies, startBattle, attackCycle, calculateDamage } from './combat.js';
import { items, autoUseItems, useItem, meetTrader, shouldBuyItem, sellWorstItem, findItem, train} from './items.js';
import { LOCATIONS, autoChangeLocation, handleLocationEvent, updateMapDisplay } from './location.js';
import { QUEST_TITLES, handleQuests, generateNewQuest, checkQuestProgress } from './quests.js';

setInterval(() => {
    if (character.travelCooldown > 0) {
        character.travelCooldown--;
    }
}, 30000);

export let gameInterval;

// Основные функции
export function startGame() {
    const name = document.getElementById('nameInput').value;
    if (!name) return;
    
    character.name = name;
    document.getElementById('nameInput').remove();
    document.querySelector('button').remove();
    document.getElementById('GameStart').style.display = 'none';
    
    gameInterval = setInterval(gameLoop, 30000);
    updateStats();
    addEvent(`Игра началась! ${character.name} начинает приключение.`);
};
character.turnsPassed = 0;
export function updateStats() {
    document.getElementById('questPercent').innerHTML = +character.turnsPassed * 100 / 500+'%';
    const statsDiv = document.getElementById('stats');
    const inventory = document.querySelector('#inventory')

    statsDiv.innerHTML = `
        <h3>Персонаж: ${character.name}</h3>
        <p>Уровень: ${character.level} (${character.xp}/${character.nextLevel} XP)</p>
        <p>Класс: ${character.class}</p>
        <p>Монеты: ${character.coins} 🪙</p>
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
};

// Cпособности классов
export const warriorAbilities = {
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

export const mageAbilities = {
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

export function getAbilityDescriptions() {
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
};

export function addEvent(text) {
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
};



export function handleRandomEvent() {
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
};

// Игровой цикл
export function gameLoop() {
    const dangerLevel = LOCATIONS[character.location].danger;
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
        if (Math.random() < 0.3 + dangerLevel * 0.2) handleRandomEvent();
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
};

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
