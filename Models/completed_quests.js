module.exports = (sequelize, DataTypes) => {
	return sequelize.define('completed_quests', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		userID: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		location: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, 
	{
		timestamps: false
	});
};