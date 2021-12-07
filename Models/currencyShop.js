module.exports = (sequelize, DataTypes) => {
	return sequelize.define('currency_shop', {
    itemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
		name: {
			type: DataTypes.STRING,
			unique: true,
      allowNull: false,
		},
		cost: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}, 
  {
		timestamps: false,
    freezeTableName: true
	});
};