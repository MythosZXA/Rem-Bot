module.exports = (sequelize, DataTypes) => {
	return sequelize.define('tweets', {
		tweet_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		created_at: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		twitter_handle: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		}
	}, 
	{
		timestamps: false
	});
};