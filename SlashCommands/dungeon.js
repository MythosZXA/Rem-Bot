const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

async function execute(interaction, sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const Monster = require('../Models/monsters')(sequelize, DataTypes);
  const hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  const monster = await Monster.findOne({ where: { monsterID: 1 }, raw: true });
  const battleEmbed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle('Floor 1')
    .addField('Hero',
    `♥️ ${hero.health}
    🔷 ${hero.mana}`,
    true)
    .addField('VS', '---\n---', true)
    .addField(monster.name,
      `♥️ ${monster.health}`,
    true);
  const actionRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('attack')
          .setLabel('Attack')
          .setStyle('PRIMARY')
      );
  await interaction.reply({
    embeds: [battleEmbed],
    components: [actionRow],
  });
  const message = await interaction.fetchReply();
  message.monster = monster;
}

async function attack(interaction, sequelize, DataTypes) {
  let message = interaction.message;
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const monster = message.monster;

  const actionRow = message.components[0];
  monster.health -= 10;
  await Hero.increment(
    { health: -monster.attack },
    { where: { userID: interaction.user.id } }
  );
  const hero = await Hero.findOne({ where: { userID: interaction.user.id }, raw: true });
  const battleEmbed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle('Floor 1')
    .addField('Hero',
    `♥️ ${hero.health}
    🔷 ${hero.mana}`,
    true)
    .addField('VS', '---\n---', true)
    .addField(monster.name,
      `♥️ ${monster.health}`,
    true);
  await interaction.update({
    embeds: [battleEmbed],
    components: [actionRow],
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dungeons')
    .setDescription('Run a dungeon (solo)')
    .addNumberOption(option =>
      option.setName('dungeon')
        .setDescription('Dungeon #')
        .setRequired(true)
        .addChoice('1', 1)),
    execute,
    attack,
}