const Discord = require('discord.js');
const rem = new Discord.Client();
const private = require('./private.json');
const fs = require('fs');
const commands = require('./commands.js');
const genshinCommands = require('./genshinCommands.js');
const musicCommands = require('./musicCommands.js');
const rpgCommands = require('./rpgCommands.js');
const userClass = require('./userClass.js');
const profile = require('./profile.js');
const uuid = require('uuid');
const AWS = require("aws-sdk");
AWS.config.loadFromPath('./JSON/config.json');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const prefix = 'Rem';
let userProfiles = new Map();
let rpgProfiles = new Map();

rem.login(private.token);
rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for \'Rem, help\'', {type: 'WATCHING'});

  var params = {Bucket: 'rembot', Key: 'userProfiles.json'};
  s3.getObject(params, function(err, data) {
    if (err) 
      console.log(err, err.stack); // an error occurred
    else {
      let userProfilesTable = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
      userProfilesTable.table.forEach(userString => userProfiles.set(userString.userID, new userClass(userString)));
      console.log(userProfiles);
    }
  });
  // // update user profiles
  // fs.readFile('./JSON/userProfiles.json', (error, data) => {
  //   if (error) throw error;
  //   let userProfilesTable = JSON.parse(data);
  //   userProfilesTable.table.forEach(userString => userProfiles.set(userString.userID, new userClass(userString)));
  // });
  console.log('User profiles updated');

  // update rpg profiles
  fs.readFile('./JSON/rpgProfiles.json', (error, data) => {
    if (error) throw error;
    let rpgProfilesTable = JSON.parse(data);
    rpgProfilesTable.table.forEach(hero => rpgProfiles.set(hero.userID, new profile(hero)));
  });
  console.log('RPG profiles updated');



  // prevent rem from sleeping by pinging
  setInterval(() => {
    console.log('Ping');
  }, 1000*60*60);
});


rem.on('message',(message) => {
  console.log(message.author.username + ': ' + message.content);
  if(message.author.bot)
    return;

  if(message.content.toLowerCase().includes('thanks rem')) {
    message.channel.send("You're welcome!");
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
  //musicCommands[arg[1]]?.(message, arg);
  rpgCommands[arg[1]]?.(message, rpgProfiles, arg);
});