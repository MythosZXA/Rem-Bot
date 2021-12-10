module.exports = (sequelize, DataTypes) => {
  return sequelize.define('equip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    }
  },
  {
    timestamps: false,
    freezeTableName: true,
  });
}