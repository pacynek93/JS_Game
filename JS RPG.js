class BaseCharacter {
    constructor(name, health, skills = { attack: 0, sneak: 0, persuade: 0 }) {
        this.name = name;
        this.maxHealth = health;
        this.currentHealth = health;
        this.isIncapacitated = false;
        this.barriers = {
            attack: 10,
            sneak: 10,
            persuade: 10
        };
        this.skills = skills;
    }
    attack() {
        return Math.floor(Math.random() * 20) + 1 + this.skills.attack;
    };
    dealDamage() {
        return Math.floor(Math.random() * (this.equippedWeapon.maxDamage - this.equippedWeapon.minDamage + 1)) + this.equippedWeapon.minDamage;
    };
    persuade() {
        return Math.floor(Math.random() * 20) + 1 + this.skills.persuasion;
    };
    sneak() {
        return Math.floor(Math.random() * 20) + 1 + this.skills.sneak;
    };
};
class Hero extends BaseCharacter {
    constructor(name, health, gender, race, role, skills,
        weapon = {
            name: `None`,
            minDamage: null,
            maxDamage: null
        }, armor = {
            name: `None`,
            attackBarrierBonus: null
        }) {
        super(name, health, skills);
        this.gender = gender;
        this.race = race;
        this.characterRole = role;
        this.equippedWeapon = weapon;
        this.equippedArmor = armor;
    };
    levelUp(skill) {
        this.maxHealth += Math.floor(Math.random() * 6) + 1;
        this.skills[skill] += 1;
    };
    equipNewWeapon(newWeapon) {
        this.equippedWeapon = newWeapon;
    };
    equipNewArmor(newArmor) {
        this.equippedArmor = newArmor;
        if (this.equippedArmor.attackBarrierBonus) {
            this.barriers.attack -= this.equippedArmor.attackBarrierBonus;
        }
        if (newArmor.attackBarrierBonus) {
            this.barriers.attack += newArmor.attackBarrierBonus;
        }
    };
    rest() {
        this.currentHealth = this.maxHealth;
        this.isIncapacitated = false;
    };
};
const checkClass = (hero, characterClass) => {
    let lowerCharacterClass = characterClass.toLowerCase();
    switch (lowerCharacterClass) {
        case `warrior`:
            hero.skills.attack += 3;
            hero.skills.sneak--;
            break;
        case `ranger`:
            hero.skills.attack++;
            hero.skills.persuade++;
            hero.skills.sneak++;
            break;
        case `rogue`:
            hero.skills.sneak += 3;
            hero.skills.attack--;
            break;
        default:
            characterClass = prompt(`"${characterClass}" is not a valid class. Please choose one of these: Warrior, Ranger, Rogue`);
            hero.characterRole = characterClass;
            checkClass(hero, characterClass);
            break;
    }
};
const checkRace = (hero, race) => {
    let lowerCaseRace = race.toLowerCase();
    switch (lowerCaseRace) {
        case `human`:
            break;
        case `elf`:
            hero.skills.persuade++;
            hero.barriers.persuade++;
            hero.skills.attack--;
            hero.barriers.sneak--;
            break;
        case `dwarf`:
            hero.skills.attack++;
            hero.barriers.attack++;
            hero.skills.sneak--;
            hero.barriers.persuade--;
            break;
        case `halfling`:
            hero.skills.sneak++;
            hero.barriers.sneak++;
            hero.skills.attack--;
            hero.barriers.persuade--;
            break;
        default:
            race = prompt(`${race} is not a valid race. Please choose one of the following: Human, Elf, Dwarf, Halfling`);
            hero.race = race;
            checkRace(hero, race);
            break;
    }
};
class Monster extends BaseCharacter {
    constructor(name, health, attackBarrier, persuasionBarrier, sneakBarrier, skills, minDamage, maxDamage) {
        super(name, health, skills);

        this.barriers.attackBarrier = attackBarrier;
        this.barriers.persuade = persuasionBarrier;
        this.barriers.sneak = sneakBarrier;
        this.equippedWeapon = {
            minDamage: minDamage,
            maxDamage: maxDamage
        }

    };
};
//Encounters

const persuasionEncounter = (heroes, enemies) => {
    let persuasionBarrier = 0;
    let persuasionPower = 0;
    enemies.forEach(enemy => {
        persuasionBarrier += enemy.barriers.persuade;
    });
    heroes.forEach(hero => {
        persuasionPower += hero.persuade();
    });
    return persuasionPower >= persuasionBarrier;
};
const sneakEncounter = (heroes, enemies) => {
    let sneakBarrier = 0;
    let sneakPower = 0;
    enemies.forEach(enemy => {
        sneakBarrier += enemy.barriers.sneak;
    });
    heroes.forEach(hero => {
        sneakPower += hero.sneak();
    });
    return sneakPower >= sneakBarrier;
};
const fightEncounter = (heroes, enemies, heroesFirst) => {
    let fighting = true;
    let totalHeroes = heroes.length;
    let totalEnemies = enemies.length;
    while (fighting) {
        if (heroesFirst) {
            totalEnemies -= teamAttack(heroes, enemies);
            totalHeroes -= teamAttack(enemies, heroes);
        } else {
            totalHeroes -= teamAttack(enemies, heroes);
            totalEnemies -= teamAttack(heroes, enemies);
        }
        if (totalHeroes === 0) {
            console.log(`All heroes are incapacitated.`);
            return false;
        }
        if (totalEnemies === 0) {
            console.log(`All enemies have been defeated.`);
            return true;
        }
    }
};
function teamAttack(attackers, defenders) {
    let totalIncapacitated = 0;
    let totalAvailableDefenders = 0;
    defenders.forEach(defender => {
        if (!defender.isIncapacitated) {
            totalAvailableDefenders++;
        }
    });
    attackers.forEach(attacker => {
        if (attacker.isIncapacitated || totalAvailableDefenders === 0) {
            return;
        }
        let target, randomTargetIndex;
        while (!target) {
            randomTargetIndex = Math.floor(Math.random() * defenders.length);
            if (!defenders[randomTargetIndex].isIncapacitated) {
                target = defenders[randomTargetIndex];
            }
        }
        if (attacker.attack() >= target.barriers.attack) {
            let damage = attacker.dealDamage();
            target.currentHealth -= damage;
            console.log(`${attacker.name} (${attacker.currentHealth}) hit ${target.name} (${target.currentHealth}) dealing ${damage} damage!`);
            if (target.currentHealth <= 0) {
                console.log(`${target.name} is incapacitated!`);
                target.isIncapacitated = true;
                totalIncapacitated++;
                totalAvailableDefenders--;

            }
        } else {
            console.log(`${attacker.name} missed!`);
        }
    });
    return totalIncapacitated;
};
const decisionMaker = (answer) => {
    let lowerAnswer = answer.toLowerCase();

    let result;

    switch (lowerAnswer) {
        case `attack`:
            result = fightEncounter(heroParty, enemies, true);
            break;
        case `sneak`:
            result = sneakEncounter(heroParty, enemies);
            break;
        case `persuade`:
            result = persuasionEncounter(heroParty, enemies);
            break;
        default:
            return decisionMaker(prompt(`Please make sure you spell the choice correctly. Attack, Sneak, or Persuade?`));
            break;
    }
    return result;
}


//Story
let name = prompt("What is the name of your character?");
let gender = prompt("What gender is your character?");
let race = prompt("What race is your character? (Human, Elf, Dwarf, Halfling)");
let characterRole = prompt("What class is your character? (Warrior, Ranger, Rogue)");
const mainHero = new Hero(name, 10, gender, race, characterRole);
const heroParty = [mainHero];
checkRace(mainHero, mainHero.race);
checkClass(mainHero, mainHero.characterRole);
console.log(
    `${mainHero.name} had been dreaming of adventure for years. Finally, the day had come.
 ${mainHero.name} had been accepted to train as one of the ${mainHero.race} king's
 champions. Heart beating furiously in anticipation, ${mainHero.name} entered the palace's
 training grounds.
 
 A burly man stood in the center of the grounds surrounded by people that looked just as 
 amazed as ${mainHero.name} felt. Feeling that was the right place to be, ${mainHero.name}
 joined the group.
 
 "You're late," the burly man huffed. "Go get yourself one of those," he said, nodding toward
 a weapon rack on the side of the grounds.`
);
mainHero.equipNewWeapon({
    name: prompt(`Which weapon do you choose? (Sword, Staff, Dagger, Bow)`),
    minDamage: 1,
    maxDamage: 6
});
console.log(
    `As ${mainHero.name} pulled the ${mainHero.equippedWeapon.name} from the rack, an attendant
 walked over and proffered some leather armor. ${mainHero.name} hesitated a moment, then noticed 
 that the rest of the trainees were wearing something similar. ${mainHero.name} allowed the attendant
 to assist in donning the armor, then hurried back to the group.`
);
mainHero.equipNewArmor({
    name: `Leather`,
    attackBarrierBonus: 3
});
console.log(
    `They had split into three groups. One sparring, one in a part of the grounds littered with
 things to hide behind apparently practicing their sneaking skills, and the last group seemed
 to be haggling with some merchants from the city's market.`
);
console.log(`After a few hours, all three groups were brought together.`);
console.log(`"All right," The captain of the King's Guard called. "You have learned the basics, now it is time to test your mettle!.
You will be taken, one at a time, and tested. You must understand: if you fail, you will be dead. Is that clear?"`);
console.log(`The group shared uncomfortable glances. "If you choose not to test," the captain continued, "you will be escorted from
the palace. Those of you who succeed, will be allowed to progress to real champion training."`);
console.log(`This time, there was a murmur of excitement. A short while later, only one man left. Eventually, your name is called.
Steeling yourself, you follow the guard into the palace and down a set of stair. You stop at a door with two guard standing at attention.
You are instructed that you must go to the far end of the dungeon and retrieve a special coin. If you return with it, you will progress.`);
console.log(`One of the guards opens the door, and you are allowed in. As soon as you get in, the door closes behind you. By the flickering
torchlight coming from the walls, you can see that all of the cells in the dungeon are open, and broken bits of furniture are littered
throughout the room. You hear a sound and manage to catch a glimpse of a goblin ripping into a fluffed chair.`);
let enemies = [new Monster(`Goblin`, 2, 7, 10, 5, { attack: 0, sneak: 0, persuade: 0 }, 1, 2)];
let answer = prompt(`What do you do? Attack, Sneak, or Persuade?`);
let victorious = decisionMaker(answer);
if (victorious) {
    console.log(`You succeeded in your ${answer} encounter. You leveled up you ${answer} skill!`);
    mainHero.levelUp(answer.toLowerCase());
} else {
    console.log(`You died...`);
}
// Adding a leveled up hero to your party.
const talrand = new Hero(`Talrand`, 20, `Male`, `Human`, `Warrior`,
    { attack: 6, sneak: 2, persuade: 1 },
    { name: `Broadsword`, minDamage: 2, maxDamage: 8 },
    { name: `Chain mail`, attackBarrierBonus: 5 });
checkClass(talrand, talrand.characterRole);
checkRace(talrand, talrand.race);
heroParty.push(talrand);