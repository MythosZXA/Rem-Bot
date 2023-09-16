module.exports = (sequelize, DataTypes) => {
	return sequelize.define('closers_agents', {
		name: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		squad: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, 
	{
		timestamps: false
	});
};