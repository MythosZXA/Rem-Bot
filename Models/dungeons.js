module.exports = (sequelize, DataTypes) => {
	return sequelize.define('dungeons', {
		dungeon: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		stage: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		monsterID: {
			type: DataTypes.INTEGER,
			allowNull: false,
		}
	},
	{
		timestamps: false,
	});
};