const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');

const { 
  joinVoiceChannel,
  createAudioPlayer,
  getVoiceConnection,
  createAudioResource 
} = require('@discordjs/voice');
const refreshButton = new MessageButton()
  .setCustomId('refresh')
  .setLabel('Refresh')
  .setStyle('SUCCESS');

function join(interaction) {
  // rem joins voice channel
  const voiceConnection = joinVoiceChannel({
    channelId: interaction.member.voice.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });
  // create audio player
  const audioPlayer = createAudioPlayer();
  voiceConnection.subscribe(audioPlayer);
  voiceConnection.audioPlayer = audioPlayer;
}

function play(interaction) {
  const soundName = interaction.component.label;
  join(interaction);
  const voiceConnection = getVoiceConnection(interaction.guildId);
  const audioResource = createAudioResource(`./mp3/${soundName}.mp3`, { inlineVolume: true });

  audioResource.volume.setVolume(0.5);
  voiceConnection.audioPlayer.play(audioResource);
  interaction.reply({
    content: 'Playing',
    fetchReply: true,
  }).then(message => message.delete());
}

function refresh(interaction) {
  // create buttons for each sound
  const actionRows = [];
  let actionRow = new MessageActionRow();
  const soundFiles = fs.readdirSync('./mp3');
  soundFiles.forEach((soundFile, index) => {
    const soundName = soundFile.split('.');
    const soundButton = new MessageButton()
      .setCustomId(`sound${index}`)
      .setLabel(soundName[0])
      .setStyle('SECONDARY');
    actionRow.addComponents(soundButton);
    if ((index + 1) % 5 === 0) {                          // if 5th button of row, create new row
      actionRows.push(actionRow);
      actionRow = new MessageActionRow();
    }
    if (index === soundFiles.length - 1) {                // if last button, add refresh button
      actionRow.addComponents(refreshButton);
      actionRows.push(actionRow);
    }
  });
  // update message to confirm refresh
  interaction.update({ components: actionRows });
}

async function update(rem) {
  const soundChannel = await rem.channels.fetch('945165144156172339');
  const soundMessage = await soundChannel.messages.fetch('945521728443019344');
  soundMessage.buttonType = 'sound';
}

module.exports = {
  play,
  refresh,
  update,
};