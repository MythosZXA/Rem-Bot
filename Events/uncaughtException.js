module.exports = {
	name: 'uncaughtException',
	process: true,
	async execute(rem, err) {
		await require('../sequelize').exportMemoryToDB(rem);
		
		console.error('Rem went down!', err);
		rem.destroy();
		process.exit();
	}
};