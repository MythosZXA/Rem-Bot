module.exports = (sequelize, DataTypes) => {
	return sequelize.define('items', {
		itemID: {
			type: DataTypes.INTEGER,
			primaryKey: true,
		},
		type: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		attack: {
			type: DataTypes.INTEGER,
		},
		drop_rate: {
			type: DataTypes.DOUBLE
		},
	},
	{
		timestamps: false,
	});
};