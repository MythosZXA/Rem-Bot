const { Op } = require('sequelize');

async function recoverHealth(sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  setInterval(() => {
    Hero.increment(
      { health: +1 },
      { where: { health: { [Op.lt]: sequelize.col('max_health') } } },
    );
    Hero.update(
      { status: 'Good' },
      { where: { status: 'Recovering', health: { [Op.eq]: sequelize.col('max_health') } } }
    );
  }, 1000);
}

async function recoverMana(sequelize, DataTypes) {
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  setInterval(() => {
    Hero.increment(
      { mana: +1 },
      { where: { mana: { [Op.lt]: sequelize.col('max_mana') } } },
    );
  }, 1000 * 3);
}

module.exports= {
  recoverHealth,
  recoverMana,
}