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
    }
  }, {
    timestamps: false,
  });
};