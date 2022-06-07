module.exports = (sequelize, DataTypes) => {
	return sequelize.define('heroes', {
		userID: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		class: {
			type: DataTypes.STRING,
			defaultValue: 'Adventurer',
			allowNull: false,
		},
		level: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
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
		location: {
			type: DataTypes.STRING,
			defaultValue: 'Small Village',
			allowNull: false,
		},
		health: {
			type: DataTypes.INTEGER,
			defaultValue: 20,
			allowNull: false,
		},
		max_health: {
			type: DataTypes.INTEGER,
			defaultValue: 20,
			allowNull: false,
		},
		mana: {
			type: DataTypes.INTEGER,
			defaultValue: 100,
			allowNull: false,
		},
		max_mana: {
			type: DataTypes.INTEGER,
			defaultValue: 100,
			allowNull: false,
		},
		strength: {
			type: DataTypes.INTEGER,
			defaultValue: 5,
			allowNull: false,
		},
		defense: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		crit_rate: {
			type: DataTypes.INTEGER,
			defaultValue: 10,
			allowNull: false,
		},
		crit_damage: {
			type: DataTypes.INTEGER,
			defaultValue: 30,
			allowNull: false,
		}
	},
	{
		timestamps: false,
	});
};