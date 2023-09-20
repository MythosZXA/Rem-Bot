module.exports = (sequelize, DataTypes) => {
	return sequelize.define('closers_dailies', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		agent_id: {
			type: DataTypes.STRING,
			allowNull: false
		},
		sector_id: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		cleared: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0
		}
	}, 
	{
		timestamps: false
	});
};