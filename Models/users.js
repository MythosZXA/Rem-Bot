module.exports = (sequelize, DataTypes) => {
  return sequelize.define('users', {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    coins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    rpsWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    checkedIn: {
      type: DataTypes.STRING,
      defaultValue: 'false',
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
};