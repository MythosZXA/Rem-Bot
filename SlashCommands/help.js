const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');

async function execute(interaction) {
  const helpEmbed = new MessageEmbed()
    .setColor(0x19EFF5)
    .setThumbnail('https://i.imgur.com/oO1SZAs.jpg')
    // .setDescription('To call for me, start a command off with \'Rem, \'')
    .addField('Prefix Commands',
              `Remind [me/person] [message] in [hh:mm:ss]`)
    .addField('Slash Commands',
              `/timer`);

  await interaction.reply({
    embeds: [helpEmbed],
    ephemeral: true
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Overview of Rem\'s functionalities'),
  execute,
}