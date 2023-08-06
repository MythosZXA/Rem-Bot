module.exports = (sequelize, DataTypes) => {
	return sequelize.define('dailies_closers', {
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
		character: {
			type: DataTypes.STRING,
			allowNull: false
		},
		gatewave_party: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0,
		},
		gatewave_single: {
			type: DataTypes.TINYINT,
			allowNull: false,
			defaultValue: 0,
		}
	}, 
	{
		timestamps: false
	});
};