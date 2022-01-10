// aws
const AWS = require("aws-sdk");
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const { SlashCommandBuilder } = require("@discordjs/builders");
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require("@discordjs/voice");

async function execute(interaction) {
  if (interaction.user.id != '246034440340373504') return;
  if (!interaction.member.voice.channelId) {
    await interaction.reply({
      content: 'Please join a voice channel first',
      ephemeral: true,
    });
    return;
  }
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });
  
  const audioPlayer = createAudioPlayer();
  let resource = createAudioResource('./The Feels.mp3');
  
  audioPlayer.play(resource);
  connection.subscribe(audioPlayer);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays an mp3 track'),
  execute,
}