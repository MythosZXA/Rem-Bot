// modules
const Discord = require('discord.js');
const fs = require('fs');
// files
const private = require('./private.json');
const commands = require('./commands.js');
const genshinCommands = require('./genshinCommands.js');
const gymCommands = require('./gymCommands.js');
const profile = require('./profile.js');
const rpgCommands = require('./rpgCommands.js');
const userClass = require('./Class/userClass.js');
const gymClass = require('./Class/gymClass.js');
// aws
const uuid = require('uuid');
const AWS = require("aws-sdk");
AWS.config.loadFromPath('./JSON/config.json');


// global variables
const rem = new Discord.Client();
const prefix = 'Rem';
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
let userProfiles = new Map();
let rpgProfiles = new Map();
let gymProfiles = new Map();

// rem main
rem.login(private.token);
rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for \'Rem, help\'', {type: 'WATCHING'});

  // update user profiles
  let params = {Bucket: 'rembot', Key: 'userProfiles.json'};
  s3.getObject(params, function(error, data) {
    if (error) 
      console.log(error, error.stack); // an error occurred
    else {
      let userProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
      userProfilesTable.table.forEach(userString => userProfiles.set(userString.userID, new userClass(userString)));
      console.log('User profiles updated');
    }
  });
  // update gym profiles
  params = {Bucket: 'rembot', Key: 'gymProfiles.json'};
  s3.getObject(params, function(error, data) {
    if (error) 
      console.log(error, error.stack); // an error occurred
    else {
      let gymProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
      gymProfilesTable.table.forEach(gymString => gymProfiles.set(gymString.userID, new gymClass(gymString)));
      console.log('Gym profiles updated');
    }
  });
  // update rpg profiles
  // fs.readFile('./JSON/rpgProfiles.json', (error, data) => {
  //   if (error) throw error;
  //   let rpgProfilesTable = JSON.parse(data);
  //   rpgProfilesTable.table.forEach(hero => rpgProfiles.set(hero.userID, new profile(hero)));
  // });
  // console.log('RPG profiles updated');

  let nowString = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
  let nowTime = new Date(nowString);
  let midnight = new Date(nowTime).setHours(24, 0, 0, 0);
  let secsToMidnight = (midnight - nowTime) / 1000;
  console.log(`Hours until midnight: ${secsToMidnight / 60 / 60}`);
  setTimeout(() => {
    birthdayWish(userProfiles);
  }, (1000 * secsToMidnight) + (1000 * 10));

  // prevent rem from sleeping by pinging
  setInterval(() => {
    console.log('Ping');
  }, 1000 * 60 * 60);
});

function birthdayWish(userProfiles) {
  userProfiles.forEach(async (user) => {
    if (user.birthday != "") {
      let birthdayFormat = user.birthday.split('/');
      let month = parseInt(birthdayFormat[0]);
      let day = parseInt(birthdayFormat[1]);
      now = new Date().toLocaleString('en-US', {timeZone: 'America/Chicago'});
      let currentMonth = new Date(now).getMonth() + 1;
      let currentDate = new Date(now).getDate();
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
}

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
  if(arg[0] != 'rem,')
    return;
  commands[arg[1]]?.(message, rpgProfiles, arg, userProfiles);
  genshinCommands[arg[1]]?.(message);
  gymCommands[arg[1]]?.(message, gymProfiles, arg);
  rpgCommands[arg[1]]?.(message, rpgProfiles, arg);
});