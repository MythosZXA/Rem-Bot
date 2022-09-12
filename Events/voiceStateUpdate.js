module.exports = {
	name: 'voiceStateUpdate',
	many: true,
	execute(oldState, newState) {
		const { getVoiceConnection } = require('@discordjs/voice');

		const joinCondition = (!oldState.channelId && newState.channelId);
		const leaveCondition = (oldState.channelId && !newState.channelId);
		const voiceConnection = getVoiceConnection(newState.guild.id);
		// rem leaves voice if she is the last person in voice channel
		if (voiceConnection && leaveCondition && oldState?.channel.members.size == 1) {
			voiceConnection.destroy();
		}
	}
};