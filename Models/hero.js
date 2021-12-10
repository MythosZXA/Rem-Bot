module.exports = (sequelize, DataTypes) => {
  return sequelize.define('hero', {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    class: {
      type: DataTypes.STRING,
      defaultValue: 'Knight',
      allowNull: false,
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
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Good',
      allowNull: false,
    },
    health: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
      allowNull: false,
    },
    max_health: {
      type: DataTypes.INTEGER,
      defaultValue: 500,
      allowNull: false,
    },
    mana: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
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