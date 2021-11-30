module.exports = (sequelize, DataTypes) => {
  return sequelize.define('users', {
    userId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    birthday: {
      type: DataTypes.DATE,
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