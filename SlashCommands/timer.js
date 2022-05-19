const { SlashCommandBuilder } = require('@discordjs/builders');

/**
 * It takes the user's input, validates it, and then sends a message to the user after the specified
 * amount of time.
 * @param interaction - Interaction event that holds hours, minutes, and message.
 */
async function execute(interaction) {
  const duration = calculateDuration(interaction);
  if (!validateDuration(interaction, duration)) return;

  // confirmation message
  interaction.reply({
    content: 'I will let you know when time is up!',
    ephemeral: true,
  });
  // save info required to send msg later
  const user = interaction.user;
  // set timer
  setTimeout(() => {
    const storedMessage = interaction.options.getString('message');
    if (storedMessage) {
      user.send(storedMessage);
    } else {
      user.send(`${user} Time is up!`);
    }
  }, 1000 * 60 * duration);
}

/**
 * Calculates the duration of the timer from the hours and minutes attached to the interaction.
 * @param interaction - Interaction event that holds hours, minutes, and message.
 * @returns The duration of the timer in minutes.
 */
function calculateDuration(interaction) {
  const hrs = interaction.options.getInteger('hr');
  const mins = interaction.options.getInteger('min');
  if (hrs < 0 || mins < 0) {
    return -1;
  } else {
    let duration = 0;
    if (hrs) duration += hrs * 60;
    if (mins) duration += mins;
  }
  return duration;
}

/**
 * Checks if the timer duration is a reasonable number.
 * @param interaction - Interaction event used to access server's emojis
 * @param duration - The duration of the timer in minutes
 * @returns a boolean value that determines the continuation of the command.
 */
function validateDuration(interaction, duration) {
  const remjudge = interaction.client.emojis.cache.find(emoji => emoji.name === 'remjudge');
  if (duration == 0) {
    interaction.reply({
      content: `Why are you even setting a timer ${remjudge}`,
      ephemeral: true,
    });
    return false;
  } else if (duration < 0) {
    interaction.reply({
      content: `Please don't enter negative values ${remjudge}`,
      ephemeral: true,
    });
    return false;
  } else if (duration >= 180) {
    interaction.reply({
      content: 'As I restart daily, long timers will not be accepted',
      ephemeral: true,
    });
    return false;
  }
  return true;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timer')
		.setDescription('Set a timer')
    .addIntegerOption(option =>
      option.setName('hr')
      .setDescription('How many hours'))
    .addIntegerOption(option =>
      option.setName('min')
      .setDescription('How many minutes'))
    .addStringOption(option =>
      option.setName('message')
      .setDescription('The message you want to be sent when time is up (optional)')),
	execute,
};