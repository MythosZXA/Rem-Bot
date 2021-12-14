// environment variables
require('dotenv').config();
// discord
const { Client, Intents } = require('discord.js');
const rem = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS
]});
// sql
const Sequelize = require('sequelize');
const sequelize = new Sequelize('rem', 'root', process.env.sqlPassword, {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
});
// set commands
const fs = require('fs');
const { default: Collection } = require('@discordjs/collection');
const { INET } = require('sequelize');
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./SlashCommands/${file}`);
  rem.commands.set(command.data.name, command);
}

// start up
rem.login(process.env.token);
rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for /help', {type: 'WATCHING'});
  
  require('./Functions/heroFunctions').recoverHealth(sequelize, Sequelize.DataTypes);
  require('./Functions/heroFunctions').recoverMana(sequelize, Sequelize.DataTypes);

  // check for birthdays when tomorrow comes
  const birthdayFunctions = require('./Functions/birthdayFunctions.js');
  console.log(`Hours until midnight: ${birthdayFunctions.getSecsToMidnight() / 60 / 60}`);
  birthdayFunctions.checkBirthdayTomorrow(rem, sequelize, Sequelize.DataTypes, birthdayFunctions.getSecsToMidnight());
});

// prefix commands
rem.on('messageCreate', message => {
  console.log(message.author.username + ': ' + message.content);
  if (message.author.bot) return;

  if (message.content.toLowerCase().includes('thanks rem')) {
    message.channel.send('You\'re welcome!');
    return;
  }
  if (message.content.includes('🙁')) {
    message.react('🙁');
    return;
  }

  let arg = message.content.toLowerCase().split(/ +/);
  if (arg[0] != 'rem,') return;
  const prefixCommands = require('./prefixCommands.js');
  prefixCommands[arg[1]]?.(message, arg);
});

// slash commands
rem.on('interactionCreate', async interaction => {
  const logChannel = await rem.channels.fetch('911494733828857866');
  if (interaction.isApplicationCommand()) {             // slash commands
    await logChannel.send(`${interaction.user.tag} used: ${interaction.commandName} (${interaction.commandId})`);
    const command = rem.commands.get(interaction.commandName);
    if (!command) return;                               // if there isn't a file with the command name

    // execute command, catch error if unsuccessful
    try {
      await command.execute(interaction, sequelize, Sequelize.DataTypes);
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'There was an error while executing this command. Let Toan know!',
        ephemeral: true 
      });
    }
  } else if (interaction.isSelectMenu()) {              // select menu interaction
    if (interaction.customId == 'selectTimer') {        // timer select menu
      await logChannel.send(`${interaction.user.tag} selected: ${interaction.values[0]}`)
      const timer = rem.commands.get('timer');
      await timer.setTimer(interaction);
    }
  } else if (interaction.isButton()) {                  // button interaction
    if (interaction.user != interaction.message.originalUser) return;
    const dungeon = rem.commands.get('dungeon');
    switch (interaction.customId) {
      case 'close':                                     // close button
        await interaction.message.delete();
        break;
      case 'attack':                                    // attack button
        await dungeon.attack(interaction, sequelize, Sequelize.DataTypes);
        break;
      case 'nextStage':                                 // next stage button
        interaction.message.currentStage++;
        await dungeon.execute(interaction, sequelize, Sequelize.DataTypes);
        break;
      case 'leave':                                     // leave button
        const Hero = require('./Models/hero')(sequelize, Sequelize.DataTypes);
        const { status } = await Hero.findOne({
          attributes: ['status'],
          where: { userID: interaction.user.id },
          raw: true,
        });
        if (status == 'Busy') {
          await Hero.update({ status: 'Good' }, { where: { userID: interaction.user.id } });
        }
        await interaction.message.delete();
        break;
    }
  }
});