const {MessageEmbed} = require('discord.js');

module.exports = class hero {
  constructor(hero, message) {
    if(hero != null) {
      this.userID = hero.userID;
      this.color = hero.color;
      this.imageURL = hero.imageURL;
      this.name = hero.name;
      this.level = hero.level;
      this.exp = hero.exp;
      this.gold = hero.gold;
      this.health = hero.health;
      this.mana = hero.mana;
      this.attack = hero.attack;
      this.defense = hero.defense;
      this.crit = hero.crit;
      this.weapon = hero.weapon;
      this.armor = hero.armor;
      this.task = hero.task;
    } else {
      this.userID = message.author.id;
      this.color = 0;
      this.imageURL = '';
      this.name = 'Unnamed';
      this.level = 1;
      this.exp = 0;
      this.gold = 0;
      this.health = 100;
      this.mana = 100;
      this.attack = 10;
      this.defense = 0;
      this.crit = 10;
      this.weapon = 'None';
      this.armor = 'None';
      this.task = false;
    }
  }

  setName(name) {
    this.name = name;
  }
  setColor(color) {
    this.color = color;
  }
  setImage(imageURL) {
    this.imageURL = imageURL;
  }

  gainExp(gainedExp) {
    this.exp += gainedExp;
    let requiredExp = this.level
  }

  createProfile(message) {
    const profile = new MessageEmbed()
      .setColor(this.color)
      .setThumbnail(this.imageURL)
      .setAuthor(message.author.username, message.author.avatarURL())
      .addField(this.name,
                `Level:\t ${this.level}
                Exp:\t ${this.exp}
                :coin:\t Gold: ${this.gold}`,
                false)
      .addField("Stats",
                `:heart: Health:\t ${this.health}
                :blue_circle: Mana:\t ${this.mana}
                :crossed_swords: Attack:\t ${this.attack}
                :shield: Defense:\t ${this.defense}`,
                false)
      .addField('Equipment',
                `Weapon:\t ${this.weapon}
                Armor:\t ${this.armor}`,
                true);
    return profile;
  }
};
