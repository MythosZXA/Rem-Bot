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
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    }
  }, {
    timestamps: false,
  });
};