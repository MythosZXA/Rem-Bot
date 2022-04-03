const { SlashCommandBuilder } = require("@discordjs/builders");
const { Formatters } = require("discord.js");

function execute(interaction) {
  // get users involved with this receipt
  const nicknames = interaction.options.getString('users').split(',');
  const guildMembers = [];
  nicknames.forEach(nickname => {
    const nicknameMember = interaction.guild.members.cache.find(member =>
       member.nickname?.toLowerCase() === nickname.toLowerCase());
    guildMembers.push(nicknameMember);
  });

  // get receipt data
  const storeName = interaction.options.getString('store');
  const date = interaction.options.getString('date');
  const receiptInput = interaction.options.getString('items');
  const itemsData = receiptInput.split(':');

  // calculate who owes what
  const amountOwed = new Array(guildMembers.length);
  amountOwed.fill(0);
  itemsData.forEach(itemString => {
    const itemData = itemString.split('/');
    const itemBuyers = itemData[1].split(',');
    itemBuyers.forEach(buyerIndex => {
      const amount = parseFloat(itemData[0]) / itemBuyers.length;
      amountOwed[buyerIndex] += amount;
    });
  });
  
  // create display string
  let taggedMembers = '';
  guildMembers.forEach(member => {
    taggedMembers += `${member} `;
  });
  taggedMembers += 'Time to pay up!';
  let displayString = storeName.padEnd(15) + date + '\n\n';
  nicknames.forEach((nickname, index) => {
    displayString += nickname.padEnd(15) + amountOwed[index].toFixed(2) + '\n';
  });

  // send result by replying to command
  interaction.reply(taggedMembers + Formatters.codeBlock(displayString));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('receipt')
    .setDescription('Calculate who owes what')
    .addStringOption(option =>
      option.setName('users')
      .setDescription('nickname1,nickname2,nickname3...')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('store')
      .setDescription('Store name')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
      .setDescription('mm/dd')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('items')
      .setDescription('price1/user#,user#,user#:price2/0,2,3')
      .setRequired(true)),
  execute,
};