module.exports = (sequelize, DataTypes) => {
	return sequelize.define('closers_sectors', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		area_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		row: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		col: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		}
	}, 
	{
		timestamps: false
	});
};