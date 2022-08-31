const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const leaderboardFunctions = require('../Functions/leaderboardFunctions');

const rockButton = new MessageButton()
	.setCustomId('rock')
	.setLabel('Rock')
	.setStyle('PRIMARY');
const paperButton = new MessageButton()
	.setCustomId('paper')
	.setLabel('Paper')
	.setStyle('PRIMARY');
const scissorsButton = new MessageButton()
	.setCustomId('scissors')
	.setLabel('Scissors')
	.setStyle('PRIMARY');
const declineButton = new MessageButton()
	.setCustomId('decline')
	.setLabel('Decline')
	.setStyle('DANGER');
const rpsChoices = new MessageActionRow()
	.setComponents([rockButton, paperButton, scissorsButton, declineButton]);

async function execute(interaction, rem, remDB) {
	// validate bet value
	const betAmount = interaction.options.getInteger('coins', true);
	if (betAmount < 0) {
		const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
		interaction.reply({
			content: `No betting negative values ${remjudge}`,
			ephemeral: true,
		});
		return;
	}
	// find guild member by nickname
	const opponentNickname = interaction.options.getString('nickname', true);
	const opponentMember = (await interaction.guild.members.fetch()).find(guildMember => 
		guildMember.nickname?.toUpperCase() === opponentNickname.toUpperCase());
	if (!opponentMember) {                                      // no opponent, exit
		interaction.reply({
			content: 'I could not find anyone with that nickname!',
			ephemeral: true,
		});
		return;
	}
	// check to see if both parties has enough coins
	const users = remDB.get('users');
	const gameUsers = users.filter(users =>		// get players of this game
		users.userID === interaction.member.id ||
		users.userID === opponentMember.id
	);
	const enoughCoins = gameUsers.every(user => user.coins > betAmount);
	if (!enoughCoins) {		// not enough coins, exit
		interaction.reply({
			content: 'Either you or your opponent does not have enough coins!',
			ephemeral: true,
		});
		return;
	}
	// initiate game by sending game message
	interaction.reply({      
		content: `${opponentMember}, ${interaction.member.nickname} ` +
    `wants to play\nrock-paper-scissors with a bet of ${betAmount} coins!`,
		components: [rpsChoices],
	});
	// attach related information to message
	const gameMessage = await interaction.fetchReply();
	gameMessage.buttonType = 'rps';
	gameMessage.originalMember = interaction.member;
	gameMessage.opponentMember = opponentMember;
	gameMessage.requesterChoice = interaction.options.getString('choice', true);
	gameMessage.betAmount = betAmount;
	// update message if opponent didn't play in 10 mins
	setTimeout(async () => {
		cancelGame(gameMessage);
	}, 1000 * 60 * 10);
}

async function play(interaction, rem, remDB, channels) {
	// determine winner
	const gameMessage = interaction.message;
	let requesterChoice = gameMessage.requesterChoice.toUpperCase();
	let opponentChoice = interaction.customId.toUpperCase();
	const winner = (() => {
		if (requesterChoice == opponentChoice) {		// tie
			return undefined;
		} else if ((requesterChoice === 'ROCK' && opponentChoice === 'SCISSORS') ||
								(requesterChoice === 'PAPER' && opponentChoice === 'ROCK') ||
								(requesterChoice === 'SCISSORS' && opponentChoice === 'PAPER')) {		// requester wins
			return gameMessage.originalMember;
		} else {		// opponent wins
			return interaction.member;
		}
	})();		// iife
	// switch choices to emojis for display
	switch (requesterChoice) {
		case 'ROCK':
			requesterChoice = '✊';
			break;
		case 'PAPER':
			requesterChoice = '✋';
			break;
		case 'SCISSORS':
			requesterChoice = '✌️';
			break;
	}
	switch (opponentChoice) {
		case 'ROCK':
			opponentChoice = '✊';
			break;
		case 'PAPER':
			opponentChoice = '✋';
			break;
		case 'SCISSORS':
			opponentChoice = '✌️';
			break;
	}
	// create result display with embed
	const displayEmbed = new MessageEmbed().setColor('GREEN');
	if (winner) {
		displayEmbed.setTitle(`${winner.nickname} wins!`);
	} else {
		displayEmbed.setTitle('It\'s a tie!');
	}
	displayEmbed
		.addField(`${gameMessage.originalMember.nickname}`,
			`${requesterChoice}`,
			true)
		.addField('🆚', '---', true)
		.addField(`${interaction.member.nickname}`,
			`${opponentChoice}`,
			true);
	// update game message to display result
	interaction.update({
		content: 'Results:',
		embeds: [displayEmbed],
		components: [],
	});
	// update data
	if (winner) {
		// find corresponding users in DB
		const betAmount = gameMessage.betAmount;
		const users = remDB.get('users');
		const winningUser = users.find(user => user.userID === winner.id);
		const losingUser = (() => {
			if (winner == gameMessage.originalMember) {
				return users.find(user => user.userID === interaction.user.id);
			} else {
				return users.find(user => user.userID === gameMessage.originalMember.id);
			}
		})();
		// update stats
		winningUser.rpsWins++;
		winningUser.coins += betAmount;
		losingUser.coins -= betAmount;
		// update leaderboard
		leaderboardFunctions.updateGamblingLeaderboard(rem, remDB, channels);
	}
}

function cancelGame(gameMessage) {
	const opponentNickname = gameMessage.opponentMember.nickname;
	if (!gameMessage.content.includes('Results')) {
		gameMessage.edit({
			content: `${opponentNickname} didn't want to play :(`,
			components: [],
		});
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
		.setDescription('Play a game of rock-paper-scissors with someone')
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('The nickname of the person you want to play with')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('choice')
				.setDescription('Rock, paper, or scissors')
				.setRequired(true)
				.addChoice('Rock', 'Rock')
				.addChoice('Paper', 'Paper')
				.addChoice('Scissors', 'Scissors'))
		.addIntegerOption(option =>
			option.setName('coins')
				.setDescription('How much coins do you want to bet')
				.setRequired(true)),
	execute,
	play,
	cancelGame,
};