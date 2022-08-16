/* eslint-disable no-case-declarations */
const heroFunctions = require('../Functions/heroFunctions');
const voiceFunctions = require('../Functions/voiceFunctions');
const { Heroes } = require('../sequelize');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, rem, remDB, channels) {
		if (interaction.isApplicationCommand()) {		// slash commands
			const consoleChannel = channels.get('console');
			consoleChannel.send(`${interaction.user.tag} used: ${interaction.commandName} (${interaction.commandId})`);
			const command = rem.commands.get(interaction.commandName);
			if (!command) return;		// if there isn't a file with the command name
			// execute command, catch error if unsuccessful
			try {
				command.execute(interaction, rem, remDB, channels);
			} catch (error) {
				console.error(error);
				interaction.reply({ 
					content: 'There was an error while executing this command. Let Toan know!',
					ephemeral: true 
				});
			}
		} else if (interaction.isSelectMenu()) {              // select menu interactions
			
		} else if (interaction.isButton()) {                  // button interactions
			const userID = interaction.user.id;
			const interactionMember = interaction.member;
			const originalMember = interaction.message.originalMember;
			const buttonType = interaction.message.buttonType;
			const buttonName = interaction.customId;
			switch (buttonType) {
				case '13':                                        // 13 buttons
					const thirteenCmds = rem.commands.get('13');
					// validate 13 button pressers
					if (interactionMember !== originalMember) {
						interaction.reply({
							content: 'You cannot interact with this button',
							ephemeral: true,
						});
						return;
					}
					switch (buttonName) {
						case 'undo':
							thirteenCmds.undo(interaction);
							break;
					}
					break;
				case 'hero':                                      // hero buttons
					const heroCmds = rem.commands.get('hero');
					// validate dungeon button pressers
					if (interactionMember !== originalMember) {
						interaction.reply({                           // presser isn't the original member, exit
							content: 'You cannot interact with this button',
							ephemeral: true,
						});
						return;
					}
					const { status } = await Heroes.findOne({ where: { userID: userID }, raw: true });
					// execute button     
					switch (buttonName) {
						case 'explore':
							if (!heroFunctions.checkStatus(interaction, status)) return;
							heroCmds.explore(interaction);
							break;
						case 'quest':
							heroCmds.quest(interaction);
							break;
						case 'travel':
							heroCmds.travel(interaction);
							break;
						case 'close':
							const buttonLabel = interaction.component.label;
							if (buttonLabel === 'Leave' && status !== 'Good') {
								Heroes.update(
									{ status: 'Good' },
									{ where: { userID: userID } },
								);
							}
							interaction.message.edit('deleted').then(message => message.delete());
							break;
						case 'inventory':
							heroCmds.inventory(interaction);
							break;
						case 'resource1':
						case 'resource2':
							heroCmds.harvest(interaction);
							break;
						case 'attack':
							const monster = interaction.message.monster;
							heroCmds.simulateBattle(interaction, monster);
							break;
						case 'escort':
							if (!heroFunctions.checkStatus(interaction, status)) return;
							Heroes.update(
								{ status: 'Escorting'},
								{ where: { userID: userID } },
							);
							heroCmds.move(interaction);
							break;
						case 'move1':
						case 'move2':
							if (!heroFunctions.checkStatus(interaction, status)) return;
							Heroes.update(
								{ status: 'Travelling'},
								{ where: { userID: userID } },
							);
							heroCmds.move(interaction);
							break;
						case 'back':
							interaction.update({
								content: '\u200B',
								embeds: [interaction.message.heroEmbed],
								components: [interaction.message.actionRow, interaction.message.actionRow2],
							});
							break;
					}
					break;
				case 'rps':                                       // rock-paper-scissors buttons
					const rpsCmds = rem.commands.get('rps');
					// validate rps button pressers
					const opponentMember = interaction.message.opponentMember;
					if (interactionMember !== opponentMember) {
						interaction.reply({                           // presser isn't a participant, exit
							content: 'You are not the opponent of this game',
							ephemeral: true,
						});
						return;
					}
					// execute buttons
					switch (buttonName) {
						case 'rock':
						case 'paper':
						case 'scissors':
							rpsCmds.play(interaction);
							break;
						case 'decline':
						// opponent cancels
							rpsCmds.cancelGame(interaction.message);
							break;
					}
					break;
				case 'sound': {                                   // sound buttons
					// validate button pressers
					const inVoice = interaction.member.voice.channelId;
					if (!inVoice) {                                 // not in voice channel, exit
						interaction.reply({
							content: 'Join a voice channel to use the soundboard',
							ephemeral: true,
						});
						return;
					}
					// execute buttons
					if (buttonName === 'refresh') {                 // refresh soundboard
						voiceFunctions.refresh(interaction);
					} else {                                        // play a sound
						voiceFunctions.play(interaction);
					}
					break;
				}
			}
		}
	}
};