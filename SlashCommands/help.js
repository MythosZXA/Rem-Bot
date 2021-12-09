const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

async function execute(interaction) {
  const helpEmbed = new MessageEmbed()
    .setColor(0x19EFF5)
    .setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
    // .setDescription('To call for me, start a command off with \'Rem, \'')
    .addField('Normal Commands',
              `/add_tag
              /timer
              /set_birthday`)
    .addField('RPG Commands',
              `/hero
              /dungeon
              /shop
              /pay`);
  await interaction.reply({
    embeds: [helpEmbed],
    ephemeral: true,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Overview of Rem\'s functionalities'),
  execute,
}