// environment variables
require('dotenv').config();
// discord
const { Client } = require('discord.js');
const rem = new Client({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGES',
    'DIRECT_MESSAGES',
  ],
  partials: ['CHANNEL']
});
// sql
const Sequelize = require('sequelize');
const sequelize = new Sequelize('rem', 'root', process.env.sqlPassword, {
	host: 'localhost',
	dialect: 'mysql',
	logging: false,
});
const Hero = require('./Models/hero')(sequelize, Sequelize.DataTypes);
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
rem.on('ready', async () => {
  // set up
  console.log('Rem is online.');
  // rem.user.setActivity('for /help', {type: 'WATCHING'});
  await (await rem.guilds.fetch('773660297696772096')).members.fetch();
  
  // auto regen heroes health and mana
  // require('./Functions/heroFunctions').recoverHealth(sequelize, Sequelize.DataTypes);
  // require('./Functions/heroFunctions').recoverMana(sequelize, Sequelize.DataTypes);

  // update leaderboards on startup
  const leaderboardFunctions = require('./Functions/leaderboardFunctions');
  // await leaderboardFunctions.updateHeroLeaderboard(rem, sequelize, Sequelize.DataTypes);
  await leaderboardFunctions.updateRPSLeaderboard(rem, sequelize, Sequelize.DataTypes);

  // check for special days when tomorrow comes
  const specialDaysFunctions = require('./Functions/specialDaysFunctions.js');
  specialDaysFunctions.checkHoliday(rem);
  specialDaysFunctions.checkBirthday(rem, sequelize, Sequelize.DataTypes);
  // update on new day
  await leaderboardFunctions.checkStreakCondition(rem, sequelize, Sequelize.DataTypes);
});

// add user to database on join
rem.on('guildMemberAdd', async member => {
  if (member.user.bot) return;
  const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);
  try {
    // add userID and username to database
    await Users.create({
      userID: member.id,
      username: member.user.tag,
    });
  } catch(error) {
    console.log(error);
  }
});

// remove user from database on leave
rem.on('guildMemberRemove', async member => {
  if (member.user.bot) return;
  const Users = require('./Models/users')(sequelize, Sequelize.DataTypes);
  try {
    await Users.destroy({ where: { userID: member.id } });
  } catch(error) {
    console.log(error);
  }
})

// prefix commands
rem.on('messageCreate', async message => {
  console.log(`${message.author.username}: ${message.content}`);
  if (message.author.bot) return;
  // log DMs
  const logChannel = await rem.channels.fetch('911494733828857866');
  if (!message.inGuild() && message.author.id != '246034440340373504') 
    await logChannel.send(`${message.author.username.toUpperCase()}: ${message.content}`);
  // misc responses
  if (message.content.toLowerCase().includes('thanks rem')) {
    message.channel.send('You\'re welcome!');
    return;
  }
  if (message.content.includes('🙁')) {
    message.react('🙁');
    return;
  }

  const arg = message.content.split(' ');
  // check if message is a sound command
  if (message.content.includes(':') && arg.length == 2) {
    const mp3Emoji = arg[1].split(':');
    if (arg[0] === '!') require('./Functions/voiceFunctions').play(message, mp3Emoji[1]);
  }
  // check if message is a prefix command
  if (arg[0].toLowerCase() != 'rem,') return;
  const prefixCommands = require('./prefixCommands.js');
  prefixCommands[arg[1].toLowerCase()]?.(message, arg, sequelize, Sequelize.DataTypes);
});

// interactions
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
  } else if (interaction.isSelectMenu()) {              // select menu interactions
    
  } else if (interaction.isButton()) {                  // button interactions
    const interactionMember = interaction.member;
    const originalMember = interaction.message.originalMember;
    const buttonType = interaction.message.buttonType;
    const buttonName = interaction.customId;
    switch(buttonType) {
      case 'dungeon':                                   // dungeon buttons
        const dungeon = rem.commands.get('dungeon');
        // validate dungeon button pressers
        if (interactionMember !== originalMember) {
          await interaction.reply({                     // presser isn't the original member, exit
            content: 'You cannot interact with this button',
            ephemeral: true,
          });
          return;
        }
        // execute button
        switch(buttonName) {
          case 'attack':
            await dungeon.battle(interaction, sequelize, Sequelize.DataTypes);
            break;
          case 'shieldBash':
          case 'tripleStrike':
          case 'swordEnhance':
          case 'sixfoldArrow':
          case 'explosiveBolt':
          case 'fireBall':
          case 'assassinate':
          case 'execute':
            // await dungeon.battle(interaction, sequelize, Sequelize.DataTypes, interaction.customId)
            break;
          case 'nextStage':
            interaction.message.currentStage++;
            await dungeon.execute(interaction, sequelize, Sequelize.DataTypes);
            break;
          case 'leave':
            const { status } = await Hero.findOne({
              attributes: ['status'],
              where: { userID: originalMember.id },
              raw: true,
            });
            if (status === 'Busy') {
              await Hero.update({ status: 'Good' }, { where: { userID: originalMember.id } });
            }
            await interaction.message.delete();
            break;
        }
        break;
      case 'hero':                                      // hero buttons
        // validate dungeon button pressers
        if (interactionMember !== originalMember) {
          await interaction.reply({                     // presser isn't the original member, exit
            content: 'You cannot interact with this button',
            ephemeral: true,
          });
          return;
        }
        // execute button
        switch(buttonName) {
          case 'close':
            await interaction.message.edit({ content: 'deleted' });
            await interaction.message.delete();
            break;
        }
        break;
      case 'rps':                                       // rock-paper-scissors buttons
        const rps = rem.commands.get('rps');
        // validate rps button pressers
        const opponentMember = interaction.message.opponentMember;
        if (interactionMember !== originalMember && interactionMember !== opponentMember) {
          await interaction.reply({                     // presser isn't a participant, exit
            content: 'You are not the opponent of this game',
            ephemeral: true,
          });
          return;
        }
        // execute buttons
        switch(buttonName) {
          case 'rock':
          case 'paper':
          case 'scissors':
            await rps.play(interaction, sequelize, Sequelize.DataTypes);
            break;
          case 'decline':
            await rps.cancelGame(interaction.message);
            break;
        }
        break;
    }
  }
});

// voice activities
rem.on('voiceStateUpdate', (oldState, newState) => {
  const { getVoiceConnection } = require('@discordjs/voice');

  const joinCondition = (!oldState.channelId && newState.channelId);
  const leaveCondition = (oldState.channelId && !newState.channelId);
  const voiceConnection = getVoiceConnection(newState.guild.id);
  // rem leaves voice if she is the last person in voice channel
  if (voiceConnection && leaveCondition && oldState?.channel.members.size == 1) {
    voiceConnection.destroy();
  }
});