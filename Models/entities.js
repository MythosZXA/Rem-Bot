module.exports = (sequelize, DataTypes) => {
  return sequelize.define('entities', {
    entityID: {
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
    },
    strength: {
      type: DataTypes.INTEGER,
    },
    defense: {
      type: DataTypes.INTEGER,
    },
    drops: {
      type: DataTypes.STRING,
    },
    exp: {
      type: DataTypes.INTEGER,
    },
    credits: {
      type: DataTypes.INTEGER,
    },
    collection: {
      type: DataTypes.STRING,
    }
  },
  {
    timestamps: false,
  });
}