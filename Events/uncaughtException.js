module.exports = {
	name: 'uncaughtException',
	process: true,
	async execute(rem, err) {
		require('../sequelize').exportMemoryToDB(rem);
		
		console.error('Rem went down!', err);
		rem.destroy();
		process.exit();
	}
};