import { character} from './character.js';

export const LOCATIONS = {
    city: { name: 'Столица Эльдрамир', danger: 0, description: 'Безопасная зона с гильдией авантюристов' },
    forest: { name: 'Лес Теней', danger: 1, description: 'Густой лес со слабыми противниками' },
    mountains: { name: 'Пики Хаоса', danger: 3, description: 'Опасная зона с сильными врагами' },
    valley: { name: 'Долина Вечного Цветения', danger: 1, description: 'Живописная долина с магическими растениями' },
    ruins: { name: 'Руины Древней Империи', danger: 2,description: 'Остатки забытой цивилизации, полные тайн' },
    lake: { name: 'Озеро Хрустальных Вод', danger: 3, description: 'Мерцающие воды с целебными свойствами' },
    enchantedForest: { name: 'Лес Шепчущих Деревьев', danger: 4,description: 'Древний лес с разумными растениями' },
    canyon: { name: 'Каньон Песчаных Бурь', danger: 5,description: 'Бескрайние песчаные просторы с тайнами' }
};

// Система перемещений
export function autoChangeLocation() {
    setTimeout(() => {
        if (character.travelCooldown > 0) return;
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

export function handleLocationEvent(oldLoc , newLoc) {
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

export function updateMapDisplay() {
    const locationInfo = document.getElementById('locationInfo');
    locationInfo.innerHTML = `
        <strong>${LOCATIONS[character.location].name}</strong>
        <p>${LOCATIONS[character.location].description}</p>
        <p>Опасность: ${'★'.repeat(LOCATIONS[character.location].danger)}</p>
        <p>Следующее перемещение через: ${character.travelCooldown} ходов</p>
    `;
}