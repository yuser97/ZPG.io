import { character} from './character.js';

export const items = {
    healthPotion: { name: 'Зелье здоровья', effect: { health: 30 }, price: 15, type: 'consumable' },
    manaPotion: { name: 'Зелье маны', effect: { mana: 40 }, price: 20, type: 'consumable' },
    scrollFire: { name: 'Свиток огня', effect: { damage: 50 }, price: 35, type: 'combat' },
    elixir: { name: 'Эликсир силы', effect: { strength: 2 }, price: 50, type: 'permanent' }
};

// Система предметов
export function autoUseItems() {
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

export function useItem(item) {
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
export function meetTrader() {
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
export function shouldBuyItem(item, price) {
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

export function sellWorstItem() {
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

export function findItem() {
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

export function train() {
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