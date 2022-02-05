module.exports = (sequelize, DataTypes) => {
	return sequelize.define('inventories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
		userID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
		itemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
		amount: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
      allowNull: false,
		},
	}, 
  {
		timestamps: false,
	});
};