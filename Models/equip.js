module.exports = (sequelize, DataTypes) => {
  return sequelize.define('equip', {
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
      allowNull: false,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  });
}