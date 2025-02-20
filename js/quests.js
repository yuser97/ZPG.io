import { character, checkLevelUp} from './character.js';
import {  autoChangeLocation, updateMapDisplay } from './location.js';

export const QUEST_TITLES = [
    "Выжить 500 дней в этом мире",
    "Пройти 500 ходов без смертей",
    "500 шагов к величию",
    "Получить 500 очков существования",
    "Продержаться 500 циклов",
    "500 испытаний судьбы"
];

// Система квестов
export function handleQuests() {
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

export function generateNewQuest() {
    character.turnsPassed = 0;
    character.totalTurnsNeeded = 500;
    character.currentQuest = {
        title: QUEST_TITLES[Math.floor(Math.random() * QUEST_TITLES.length)],
        type: 'Автоматическое'
    };
    document.getElementById('currentQuestTitle').textContent = character.currentQuest.title; 
        addEvent(`📜 Новое задание: "${character.currentQuest.title}"`);
}


export function completeQuest() {
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


export function checkQuestProgress() {
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