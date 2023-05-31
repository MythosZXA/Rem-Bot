module.exports = {
	name: 'SIGTERM',
	process: true,
	async execute(rem) {
		require('../sequelize.js').exportMemoryToDB(rem);

		console.log('Rem is going to sleep!');
		rem.destroy();
		process.exit();
	}
};