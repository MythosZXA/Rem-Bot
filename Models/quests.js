module.exports = (sequelize, DataTypes) => {
	return sequelize.define('quests', {
    name: {
			type: DataTypes.STRING,
      primaryKey: true,
		},
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
		exp: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
      allowNull: false,
		},
    coins: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
      allowNull: false,
		},
	}, 
  {
		timestamps: false
	});
};