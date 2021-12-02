module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_items', {
		userID: DataTypes.STRING,
		itemID: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
		amount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
      allowNull: false,
		},
	}, {
		timestamps: false,
	});
};