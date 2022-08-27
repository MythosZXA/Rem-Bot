const { MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs');
const { 
	joinVoiceChannel,
	createAudioPlayer,
	getVoiceConnection,
	createAudioResource 
} = require('@discordjs/voice');


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
	const boardName = interaction.message.content;
	const soundName = interaction.component.label;
	join(interaction);
	const voiceConnection = getVoiceConnection(interaction.guildId);
	const audioResource = createAudioResource(`./mp3/${boardName}/${soundName}.mp3`, { inlineVolume: true });

	audioResource.volume.setVolume(0.5);
	voiceConnection.audioPlayer.play(audioResource);
	interaction.reply({
		content: 'Playing',
		fetchReply: true,
	}).then(message => message.delete());
}

async function setupSoundboard(channels) {
	// gets all current soundboard
	const soundboardChannel = channels.get('soundboard');
	const soundboardMessages = await soundboardChannel.messages.fetch();
	// create/update soundboard for each folder
	const mp3Folders = fs.readdirSync('./mp3');
	mp3Folders.forEach(async folder => {
		const actionRows = [];
		let actionRow = new MessageActionRow();
		const mp3Files = fs.readdirSync(`./mp3/${folder}`);
		mp3Files.forEach((mp3File, index) => {
			const soundName = mp3File.split('.');
			const soundButton = new MessageButton()
				.setCustomId(`sound${index}`)
				.setLabel(soundName[0])
				.setStyle('SECONDARY');
			actionRow.addComponents(soundButton);
			if ((index + 1) % 5 === 0) {		// if 5th button of row, create new row
				actionRows.push(actionRow);
				actionRow = new MessageActionRow();
			} else if (index === mp3Files.length - 1) {		// if last button, add final row
				actionRows.push(actionRow);
			}
		});
		// if soundboard exists, update. otherise, create
		const soundboardMessage = soundboardMessages.find(soundboardMessage => soundboardMessage.content === folder);
		if (soundboardMessage) {
			soundboardMessage.edit({
				components: actionRows
			});
			soundboardMessage.buttonType = 'sound';
		} else {
			const newSoundboardMessage = await soundboardChannel.send({
				content: folder,
				components: actionRows
			});
			newSoundboardMessage.buttonType = 'sound';
		}
	});
}

module.exports = {
	play,
	setupSoundboard,
};