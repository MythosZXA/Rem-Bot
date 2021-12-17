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
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    defense: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    drops: {
      type: DataTypes.STRING,
    },
    exp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    collection: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    timestamps: false,
  });
}