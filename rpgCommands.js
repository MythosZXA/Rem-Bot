const Discord = require('discord.js');
const profile = require('./profile.js');

function hero(message, rpgProfiles) {
  if(!rpgProfiles.has(message.author.id))
    rpgProfiles.set(message.author.id, new profile(null, message));

  let userProfile = rpgProfiles.get(message.author.id).createProfile(message);
  message.channel.send(userProfile);

}

function setName(message, rpgProfiles, arg) {
  rpgProfiles.get(message.author.id).setName(arg[2]);
}
function setColor(message, rpgProfiles, arg) {
  rpgProfiles.get(message.author.id).setColor(arg[2]);
}
function setImage(message, rpgProfiles, arg) {
  rpgProfiles.get(message.author.id).setImage(arg[2]);
}

function adventure(message, rpgProfiles) {
  if(rpgProfiles.get(message.author.id).task) {
    message.channel.send('Your hero is currently doing a task!');
    return;
  }

  rpgProfiles.get(message.author.id).task = true;
  message.channel.send('Your hero has set off on an adventure and will return in 5 minutes!');
  setTimeout(() => {
    rpgProfiles.get(message.author.id).gold += 50;
    rpgProfiles.get(message.author.id).exp += 10;
    message.channel.send(`${message.author}, your hero has returned from their adventure! They gained 50 Exp and 10 gold!`);
    rpgProfiles.get(message.author.id).task = false;
  }, 300000);
}
function fish(message, rpgProfiles) {
  if(rpgProfiles.get(message.author.id).task) {
    message.channel.send('Your hero is currently doing a task!');
    return;
  }
}
function mine(message, rpgProfiles) {
  if(rpgProfiles.get(message.author.id).task) {
    message.channel.send('Your hero is currently doing a task!');
    return;
  }
}

module.exports = {
  hero,
  'setname' : setName,
  'setcolor' : setColor,
  'setimage' : setImage,
  adventure
};
