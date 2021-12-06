// environment variables
require('dotenv').config();
// discord
const { Client, Intents } = require('discord.js');
const rem = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
// sql
const Sequelize = require('sequelize');
const sequelize = new Sequelize('rem', 'root', process.env.sqlPassword, {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
});
require('./Models/users')(sequelize, Sequelize.DataTypes);
require('./Models/currencyShop')(sequelize, Sequelize.DataTypes);
require('./Models/userItems')(sequelize, Sequelize.DataTypes);
require('./Models/hero')(sequelize, Sequelize.DataTypes);
require('./Models/monsters')(sequelize, Sequelize.DataTypes);
require('./Models/dungeons')(sequelize, Sequelize.DataTypes);
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

  // sync mysql
  sequelize.sync();

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
    if (interaction.customId == 'attack') {             // attack button
      if (interaction.user.id != interaction.message.author.id) return;
      const dungeons = rem.commands.get('dungeons');
      await dungeons.attack(interaction, sequelize, Sequelize.DataTypes);
    }
  }
});