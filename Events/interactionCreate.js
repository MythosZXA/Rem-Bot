module.exports = {
	name: 'interactionCreate',
	many: true,
	async execute(interaction, rem) {
		if (interaction.isApplicationCommand()) {		// slash commands
			const consoleChannel = rem.serverChannels.get('console');
			consoleChannel.send(`${interaction.user.tag} used: ${interaction.commandName} (${interaction.commandId})`);

			const command = rem.commands.get(interaction.commandName);
			if (!command) return;		// if there isn't a file with the command name

			// execute command, catch error if unsuccessful
			try {
				command.execute(interaction, rem);
			} catch (error) {
				console.error(error);
				interaction.reply({ 
					content: 'There was an error while executing this command. Let Toan know!',
					ephemeral: true 
				});
			}
		} else if (interaction.isSelectMenu()) {              // select menu interactions
			
		} else if (interaction.isButton()) {                  // button interactions
			const interactionMember = interaction.member;
			const buttonType = interaction.message.buttonType;
			const buttonName = interaction.customId;
			switch (buttonType) {
				case '13':                                        // 13 buttons
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
							rpsCmds.play(interaction, rem);
							break;
						case 'decline':
						// opponent cancels
							rpsCmds.cancelGame(interaction.message);
							break;
					}
					break;
			}
		}
	}
};