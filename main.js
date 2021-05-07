const Discord = require('discord.js');
const rem = new Discord.Client();
const private = require('./private.json');
const fs = require('fs');
const commands = require('./commands.js');
const genshinCommands = require('./genshinCommands.js');
const musicCommands = require('./musicCommands.js');
const rpgCommands = require('./rpgCommands.js');
const profile = require('./profile.js');
// const mysql = require('mysql');

const prefix = 'Rem';
let rpgProfiles = new Map();

// const con = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Toant6394',
//   database: 'RPG'
// });

// con.connect((err) => {
//   if(err) {
//     console.log('Error connecting to RPG DB');
//     return;
//   }
//   console.log('Connected to RPG DB');
// })

rem.login(private.token);
rem.on('ready', () => {
  console.log('Rem is online.');
  rem.user.setActivity('for \'Rem, help\'', {type: 'WATCHING'});
  // update rpg profiles
  fs.readFile('./rpgProfiles.json', (error, data) => {
    if (error) throw error;
    let rpgProfilesTable = JSON.parse(data);
    rpgProfilesTable.table.forEach(hero => {
      rpgProfiles.set(hero.userID, new profile(hero));
    });
  });
  console.log('RPG profiles updated');
  // prevent rem from sleeping by pinging
  setInterval(() => {
    console.log('Ping');
  }, 1000*60*60);
})


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
  commands[arg[1]]?.(message, rpgProfiles, arg);
  genshinCommands[arg[1]]?.(message);
  musicCommands[arg[1]]?.(message, arg);
  rpgCommands[arg[1]]?.(message, rpgProfiles, arg);
});
