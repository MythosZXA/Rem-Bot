// environment variables
require('dotenv').config();
// discord
const { Client, Intents } = require('discord.js');
const rem = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
// aws
const AWS = require("aws-sdk");
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
// sequelize

// set commands
const fs = require('fs');
const { default: Collection } = require('@discordjs/collection');
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./SlashCommands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./SlashCommands/${file}`);
  rem.commands.set(command.data.name, command);
}
// global variables
const prefix = 'Rem';
let userMap = new Map();
let gymMap = new Map();


// start up
rem.login(process.env.token);
rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for \'Rem, help\'', {type: 'WATCHING'});

  // update maps with aws files
  const mapFunctions = require('./Functions/mapFunctions');
  mapFunctions.createUserMap(s3, userMap);
  mapFunctions.createGymMap(s3, gymMap);

  // check for birthdays when tomorrow comes
  const birthdayFunctions = require('./Functions/birthdayFunctions.js');
  console.log(`Hours until midnight: ${birthdayFunctions.getSecsToMidnight() / 60 / 60}`);
  birthdayFunctions.checkBirthdayTomorrow(rem, userMap, birthdayFunctions.getSecsToMidnight());
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
  const commands = require('./prefixCommands.js');
  const gymCommands = require('./gymCommands.js');
  commands[arg[1]]?.(message, arg, userMap, s3);
  gymCommands[arg[1]]?.(message, gymMap, arg, s3);
});

// slash commands
rem.on('interactionCreate', async interaction => {
  if (interaction.isApplicationCommand()) {       // slash commands
    const logChannel = await rem.channels.fetch('911494733828857866');
    await logChannel.send(`${interaction.user.tag} used command: ${interaction.commandName}`);
    const command = rem.commands.get(interaction.commandName);
    if (!command) return;                         // if there isn't a file with the command name

    // execute command, catch error if unsuccessful
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'There was an error while executing this command!',
        ephemeral: true 
      });
    }
  } else if (interaction.isSelectMenu()) {        // select menu interaction
    if (interaction.customId == 'selectTimer') {  // timer select menu
      const logChannel = await rem.channels.fetch('911494733828857866');
      await logChannel.send(`${interaction.user.tag} selected: ${interaction.values[0]}`)
      
      const timer = require('./SlashCommands/timer');
      await timer.setTimer(interaction);
    }
  }
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});