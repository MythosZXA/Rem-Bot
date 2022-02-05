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
const leaderboardFunctions = require('./Functions/leaderboardFunctions');
const specialDaysFunctions = require('./Functions/specialDaysFunctions.js');
const prefixCommands = require('./prefixCommands.js');
// sql
const { Heroes, Users } = require('./sequelize');
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

let logChannel;

// start up
rem.login(process.env.token);
rem.on('ready', async () => {
  // set up
  console.log('Rem is online.');
  // rem.user.setActivity('for /help', {type: 'WATCHING'});
  (await rem.guilds.fetch('773660297696772096')).members.fetch();                 // caches users for easier access
  logChannel = await rem.channels.fetch('911494733828857866');
  // auto regen heroes' health and mana
  require('./Functions/heroFunctions').recoverHealth();
  require('./Functions/heroFunctions').recoverMana();

  // update leaderboards on startup
  // leaderboardFunctions.updateHeroLeaderboard(rem, sequelize, Sequelize.DataTypes);
  leaderboardFunctions.updateGamblingLeaderboard(rem);

  // check for special days when tomorrow comes
  specialDaysFunctions.checkHoliday(rem);
  specialDaysFunctions.checkBirthday(rem);
  // update on new day
  leaderboardFunctions.checkStreakCondition(rem);

  rem.commands.get('roulette').start(rem);
});

// add user to database on join
rem.on('guildMemberAdd', member => {
  if (member.user.bot) return;                                                    // bot joined, exit
  try {
    // add userID and username to database
    Users.create({
      userID: member.id,
      username: member.user.tag,
    });
  } catch(error) {
    console.log(error);
  }
});

// remove user from database on leave
rem.on('guildMemberRemove', async member => {
  if (member.user.bot) return;                                                    // bot left, exit
  try {
    // delete from database
    Users.destroy({ where: { userID: member.id } });
  } catch(error) {
    console.log(error);
  }
})

// prefix commands
rem.on('messageCreate', message => {
  console.log(`${message.author.username}: ${message.content}`);
  if (message.author.bot) return;
  // log DMs
  if (!message.inGuild() && message.author.id != '246034440340373504') 
    logChannel.send(`${message.author.username.toUpperCase()}: ${message.content}`);
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
  prefixCommands[arg[1].toLowerCase()]?.(message, arg);
});

// interactions
rem.on('interactionCreate', async interaction => {
  if (interaction.isApplicationCommand()) {             // slash commands
    // logChannel.send(`${interaction.user.tag} used: ${interaction.commandName} (${interaction.commandId})`);
    const command = rem.commands.get(interaction.commandName);
    if (!command) return;                               // if there isn't a file with the command name
    // execute command, catch error if unsuccessful
    try {
      command.execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply({ 
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
    switch (buttonType) {
      case '13':                                        // 13 buttons
        const thirteenCmds = rem.commands.get('13');
        // validate 13 button pressers
        if (interactionMember !== originalMember) {
          interaction.reply({
            content: 'You cannot interact with this button',
            ephemeral: true,
          });
          return;
        }
        switch (buttonName) {
          case 'undo':
            thirteenCmds.undo(interaction);
            break;
        }
        break;
      case 'dungeon':                                   // dungeon buttons
        const dungeon = rem.commands.get('dungeon');
        // validate dungeon button pressers
        if (interactionMember !== originalMember) {
          interaction.reply({                           // presser isn't the original member, exit
            content: 'You cannot interact with this button',
            ephemeral: true,
          });
          return;
        }
        // execute button
        switch (buttonName) {
          case 'attack':
            dungeon.battle(interaction, sequelize, Sequelize.DataTypes);
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
            dungeon.execute(interaction, sequelize, Sequelize.DataTypes);
            break;
          case 'leave':
            const { status } = await Heroes.findOne({
              attributes: ['status'],
              where: { userID: originalMember.id },
              raw: true,
            });
            // hero left dungeon, no longer busy
            if (status === 'Busy') {
              Heroes.update({ status: 'Good' }, { where: { userID: originalMember.id } });
            }
            interaction.message.delete();
            break;
        }
        break;
      case 'hero':                                      // hero buttons
        const heroCmds = rem.commands.get('hero');
        // validate dungeon button pressers
        if (interactionMember !== originalMember) {
          interaction.reply({                           // presser isn't the original member, exit
            content: 'You cannot interact with this button',
            ephemeral: true,
          });
          return;
        }
        // execute button     
        switch (buttonName) {
          case 'explore':
            heroCmds.explore(interaction);
            break;
          case 'quest':
            heroCmds.quest(interaction);
            break;
          case 'travel':
            heroCmds.travel(interaction);
            break;
          case 'close':
            interaction.message.edit('deleted').then(message => message.delete());
            break;
          case 'attack':
            const monster = interaction.message.monster;
            heroCmds.simulateBattle(interaction, monster);
            break;
          case 'back':
            interaction.update({
              embeds: [interaction.message.heroEmbed],
              components: [interaction.message.actionRow],
            });
            break;
          case 'escort':
          case 'move':
            heroCmds.move(interaction);
            break;
        }
        break;
      case 'rps':                                       // rock-paper-scissors buttons
        const rpsCmds = rem.commands.get('rps');
        // validate rps button pressers
        const opponentMember = interaction.message.opponentMember;
        if (interactionMember !== originalMember || interactionMember !== opponentMember) {
          interaction.reply({                           // presser isn't a participant, exit
            content: 'You are not the opponent of this game',
            ephemeral: true,
          });
          return;
        }
        // execute buttons
        switch (buttonName) {
          case 'rock':
          case 'paper':
          case 'scissors':
            rpsCmds.play(interaction);
            break;
          case 'decline':
            // validate rps button pressers
            if (interactionMember === originalMember) { // presser is requester, exit
              interaction.reply({
                content: 'You cannot decline your own game',
                ephemeral: true,
              });
              return;
            }
            // opponent cancels
            rpsCmds.cancelGame(interaction.message);
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