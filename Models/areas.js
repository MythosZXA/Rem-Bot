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
    entity: {
      type: DataTypes.STRING,
    },
	}, 
  {
		timestamps: false
	});
};