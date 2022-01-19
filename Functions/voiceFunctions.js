const AWS = require('aws-sdk');
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

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

  // const bucketParams = {
  //   Bucket: 'rembot',
  //   Key: 'mlghorns.opus',
  //   ResponseContentDisposition: `attachment; filename='mlghorns.opus'`,
  // };
  // const url = s3.getSignedUrl('getObject', bucketParams);
  // s3.getObject(bucketParams, function (error, data) {
  //   if (error) console.log(error, err.stack);
  //   else {
      
  //   }
  // });

  audioResource.volume.setVolume(0.35);
  voiceConnection.audioPlayer.play(audioResource);
  await message.delete();
}

module.exports = {
  join,
  play,
};