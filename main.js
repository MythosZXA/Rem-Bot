// environment variables
require('dotenv').config();
// discord
const { Client, Intents } = require('discord.js');
const rem = new Client({ intents: [Intents.FLAGS.GUILDS] });
// aws
const AWS = require("aws-sdk");
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const fs = require('fs');
// files
const commands = require('./commands.js');
const genshinCommands = require('./genshinCommands.js');
const gymCommands = require('./gymCommands.js');
const profile = require('./profile.js');
const rpgCommands = require('./rpgCommands.js');
const userClass = require('./Class/userClass.js');
const gymClass = require('./Class/gymClass.js');


// global variables
const prefix = 'Rem';
let userMap = new Map();
let gymMap = new Map();
let rpgProfiles = new Map();

// set commands
const { default: Collection } = require('@discordjs/collection');
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./Commands/${file}`);
  rem.commands.set(command.data.name, command);
}

// rem main
rem.login(process.env.token);

rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for \'Rem, help\'', {type: 'WATCHING'});

  // update maps with files
  createUserMap(userMap);
  createGymMap(gymMap);
  // update rpg profiles
  // fs.readFile('./JSON/rpgProfiles.json', (error, data) => {
  //   if (error) throw error;
  //   let rpgProfilesTable = JSON.parse(data);
  //   rpgProfilesTable.table.forEach(hero => rpgProfiles.set(hero.userID, new profile(hero)));
  // });
  // console.log('RPG profiles updated');

  // check for birthdays when tomorrow comes
  console.log(`Hours until midnight: ${getSecsToMidnight() / 60 / 60}`);
  checkBirthdayTomorrow(userMap, getSecsToMidnight());
});

rem.on('message',(message) => {
  console.log(message.author.username + ': ' + message.content);
  if(message.author.bot)
    return;

  if(message.content.toLowerCase().includes('thanks rem')) {
    message.channel.send('You\'re welcome!');
    return;
  }
  if(message.content.includes('😦')) {
    message.channel.send('😦');
    return;
  }

  let arg = message.content.toLowerCase().split(/ +/);
  if(arg[0] != 'rem,') return;
  commands[arg[1]]?.(message, rpgProfiles, arg, userMap, s3);
  genshinCommands[arg[1]]?.(message);
  gymCommands[arg[1]]?.(message, gymMap, arg, s3);
  rpgCommands[arg[1]]?.(message, rpgProfiles, arg);
});

rem.on('interactionCreate', async interaction => {
  if (interaction.isApplicationCommand()) {       // slash commands
    const command = rem.commands.get(interaction.commandName);
    if (!command) return; // if there isn't a file with the command name

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
  } else if (interaction.isSelectMenu()) {        // menu selection
    if (interaction.customId == 'selectTimer') {  // timer
      // get duration and set timer
      const duration = interaction.values[0];
      setTimeout(() => {
        interaction.channel.send(`${interaction.user} Time's up!`);
      }, 1000 * 60 * duration); 
      // remove initial menu
      interaction.update({
        content: 'An option was selected',
        components: []
      }).catch(console.error);
    }
  }
});

function createUserMap(userMap) {
  let params = {Bucket: 'rembot', Key: 'userProfiles.json'};
  s3.getObject(params, function(error, data) {
    if (error) 
      console.log(error, error.stack);
    else {
      let userProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
      userProfilesTable.table.forEach(userString => userMap.set(userString.userID, new userClass(userString)));
      console.log('User profiles updated');
    }
  });
}

function createGymMap(gymMap) {
  let params = {Bucket: 'rembot', Key: 'gymProfiles.json'};
  s3.getObject(params, function(error, data) {
    if (error) 
      console.log(error, error.stack); // an error occurred
    else {
      let gymProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
      gymProfilesTable.table.forEach(gymString => gymMap.set(gymString.userID, new gymClass(gymString)));
      console.log('Gym profiles updated');
    }
  });
}

function getSecsToMidnight() {
  let nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  let nowTime = new Date(nowString);
  let midnight = new Date(nowTime).setHours(24, 0, 0, 0);
  return (midnight - nowTime) / 1000;
}

function checkBirthdayTomorrow(userProfiles, secsToMidnight) {
  setTimeout(() => {
    userProfiles.forEach(async (user) => {
      if (user.birthday != "") { // enter if user has set their birthday
        // get user birth month and date
        let birthdayFormat = user.birthday.split('/');
        let month = parseInt(birthdayFormat[0]);
        let day = parseInt(birthdayFormat[1]);
        // get today's month and date
        now = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
        let currentMonth = new Date(now).getMonth() + 1;
        let currentDate = new Date(now).getDate();
        // if it's user's birthday then send happy birthday
        if (month == currentMonth && day == currentDate) {
          let bdMember = await rem.guilds.cache.get('773660297696772096')
                                  .members.fetch(user.userID);
          rem.guilds.cache.get('773660297696772096')
            .channels.cache.get('773660297696772100')
            .send({files: [{attachment: './Pictures/Birthday Rem.jpg', name: 'Birthday Rem.jpg'}]});
          rem.guilds.cache.get('773660297696772096')
            .channels.cache.get('773660297696772100')
            .send(`Happy Birthday ${bdMember}!`);
        }
      }
    })
    // check again tomorrow
    console.log(`Hours until midnight: ${getSecsToMidnight() / 60 / 60}`);
    checkBirthdayTomorrow(userProfiles, getSecsToMidnight());
  }, (1000 * secsToMidnight) + (1000 * 5));
}