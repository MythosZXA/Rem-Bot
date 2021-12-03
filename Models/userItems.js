module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_items', {
		userID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
		itemID: {
      type: DataTypes.INTEGER,
      unique: true,
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