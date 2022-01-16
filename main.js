// environment variables
require('dotenv').config();
// discord
const { Client, Intents } = require('discord.js');
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
const { getVoiceConnection } = require('@discordjs/voice');
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

  // auto regen heroes health and mana
  require('./Functions/heroFunctions').recoverHealth(sequelize, Sequelize.DataTypes);
  require('./Functions/heroFunctions').recoverMana(sequelize, Sequelize.DataTypes);
  // check for special days when tomorrow comes
  const specialDaysFunctions = require('./Functions/specialDaysFunctions.js');
  specialDaysFunctions.checkHoliday(rem);
  specialDaysFunctions.checkBirthday(rem, sequelize, Sequelize.DataTypes);
  // update leaderboards
  const leaderboardFunctions = require('./Functions/leaderboardFunctions');
  await leaderboardFunctions.updateHeroLeaderboard(rem, sequelize, Sequelize.DataTypes);
  await leaderboardFunctions.updateStreakLeaderboard(rem, sequelize, Sequelize.DataTypes);
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
  // logs DMs
  const logChannel = await rem.channels.fetch('911494733828857866');
  if (!message.inGuild() && message.author.id != '246034440340373504') 
    await logChannel.send(`${message.author.username.toUpperCase()}: ${message.content}`);

  if (message.content.toLowerCase().includes('thanks rem')) {
    message.channel.send('You\'re welcome!');
    return;
  }
  if (message.content.includes('🙁')) {
    message.react('🙁');
    return;
  }

  let arg = message.content.split(/ +/);
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
  } else if (interaction.isSelectMenu()) {              // select menu interaction
    
  } else if (interaction.isButton()) {                  // button interaction
    // validate the presser of this button
    if (interaction.message?.opponent) {
      if (interaction.member?.nickname.toLowerCase() != interaction.message.opponent.toLowerCase()) {
        await interaction.reply({
          content: 'You are not the opponent of this game',
          ephemeral: true,
        });
        return;
      }
    } else if (interaction.member != interaction.message?.originalMember) {
      await interaction.reply({
        content: 'You cannot interact with this button',
        ephemeral: true,
      });
      return;
    }

    // execute button functions
    const rps = rem.commands.get('rock_paper_scissors');
    const dungeon = rem.commands.get('dungeon');
    switch (interaction.customId) {
      // rps buttons
      case 'rock':
      case 'paper':
      case 'scissors':
        await rps.play(interaction, sequelize, Sequelize.DataTypes);
        break;
      // rpg buttons
      case 'close':                                     // close button
        await interaction.message.delete(interaction);
        break;
      case 'attack':                                    // attack button
        await dungeon.battle(interaction, sequelize, Sequelize.DataTypes);
        break;
      case 'shieldBash':                                // skill buttons
      case 'tripleStrike':
      case 'swordEnhance':
      case 'sixfoldArrow':
      case 'explosiveBolt':
      case 'fireBall':
      case 'assassinate':
      case 'execute':
        // await dungeon.battle(interaction, sequelize, Sequelize.DataTypes, interaction.customId)
        break;
      case 'nextStage':                                 // next stage button
        interaction.message.currentStage++;
        await dungeon.execute(interaction, sequelize, Sequelize.DataTypes);
        break;
      case 'leave':                                     // leave button
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

rem.on('voiceStateUpdate', (oldState, newState) => {
  const voiceConnection = getVoiceConnection(newState.guild.id);
  if (voiceConnection && !newState.channelId && oldState?.channel.members.size == 1) {
    voiceConnection.destroy();
  }
})