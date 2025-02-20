import { character, showDeathMenu} from './character.js';
import { enemies, startBattle, attackCycle, calculateDamage } from './combat.js';

export const enemies = [
    { name: 'Гоблин', health: 10, attack: 2 },
    { name: 'Орк', health: 20, attack: 4 },
    { name: 'Дракон', health: 30, attack: 6 }
];

// Боевая система
export async function startBattle() {
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

export function attackCycle(attacker, defender) {
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

export function calculateDamage(attacker, defender) {
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