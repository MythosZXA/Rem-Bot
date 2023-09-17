module.exports = (sequelize, DataTypes) => {
	return sequelize.define('closers_agents', {
		name: {
			type: DataTypes.STRING,
			unique: true,
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