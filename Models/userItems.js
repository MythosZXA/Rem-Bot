module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_items', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
		userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
		itemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
			type: DataTypes.STRING,
      allowNull: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
      allowNull: false,
		},
	}, 
  {
		timestamps: false,
	});
};