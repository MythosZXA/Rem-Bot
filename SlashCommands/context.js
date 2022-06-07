const { ContextMenuCommandBuilder } = require('@discordjs/builders');

function execute() {
  
}

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Testing Context')
		.setType(3),
	execute,
};