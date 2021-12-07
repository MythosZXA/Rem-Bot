module.exports = (sequelize, DataTypes) => {
  return sequelize.define('hero', {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    exp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    busy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    health: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    max_health: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    mana: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      allowNull: false,
    },
    defense: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    crit_rate: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  });
}