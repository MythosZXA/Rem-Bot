module.exports = (sequelize, DataTypes) => {
  return sequelize.define('hero', {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    health: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    mana: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
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