module.exports = (sequelize, DataTypes) => {
  return sequelize.define('monsters', {
    monsterID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    health: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    attack: {
      type: DataTypes.INTEGER,
    },
    defense: {
      type: DataTypes.INTEGER,
    }
  },
  {
    timestamps: false,
  });
}