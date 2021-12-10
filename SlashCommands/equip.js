const { SlashCommandBuilder } = require("@discordjs/builders");


async function execute(interaction) {

}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Equip a piece of equipment from your inventory'),
  execute,
}