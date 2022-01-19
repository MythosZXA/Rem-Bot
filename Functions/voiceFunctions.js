const { 
  joinVoiceChannel,
  createAudioPlayer,
  getVoiceConnection,
  createAudioResource 
} = require('@discordjs/voice');
const fs = require('fs');

async function join(message) {
  // check if member is in a voice channel
  if (!message.member.voice.channelId) {
    await message.channel.send('Please join a voice channel first');
    await message.delete();
    return false;
  }
  // rem joins voice channel
  const voiceConnection = joinVoiceChannel({
    channelId: message.member.voice.channelId,
    guildId: message.guildId,
    adapterCreator: message.guild.voiceAdapterCreator,
  });
  // create audio player
  const audioPlayer = createAudioPlayer();
  voiceConnection.subscribe(audioPlayer);
  voiceConnection.audioPlayer = audioPlayer;
  return true;
}

async function play(message, mp3Name) {
  if (!(await join(message))) return;
  const voiceConnection = getVoiceConnection(message.guildId);
  const audioResource = createAudioResource(`./mp3/${mp3Name}.mp3`, { inlineVolume: true });
  audioResource.volume.setVolume(0.35);
  voiceConnection.audioPlayer.play(audioResource);
  await message.delete();
}

module.exports = {
  join,
  play,
};