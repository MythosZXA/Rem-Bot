module.exports = (sequelize, DataTypes) => {
	return sequelize.define('areas', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
			type: DataTypes.STRING,
      allowNull: false,
		},
    type: {
			type: DataTypes.STRING,
      allowNull: false,
		},
    monster: {
      type: DataTypes.STRING,
    },
	}, 
  {
		timestamps: false
	});
};