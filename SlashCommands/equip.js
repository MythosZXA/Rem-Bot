const { SlashCommandBuilder } = require("@discordjs/builders");

async function execute(interaction, sequelize, DataTypes) {
  const Equip = require('../Models/equip')(sequelize, DataTypes);
  const UserItems = require('../Models/userItems')(sequelize, DataTypes);
  const Hero = require('../Models/hero')(sequelize, DataTypes);
  const itemID = interaction.options.getInteger('id');
  const wantedItem = await UserItems.findOne({ 
    where: { id: itemID },
    attributes: { exclude: ['amount'] },
    raw: true 
  });
  if (wantedItem == null) {                                // hero does not have item
    await interaction.reply({
      content: 'You do not have that item',
      ephemeral: true,
    });
  } else {                                                 // equippable
    const equippedItem = await Equip.findOne({             // check equip slot
      where: {
        userID: interaction.user.id,
        type: wantedItem.type,
      },
      raw: true,
    });
    if (equippedItem) {                                    // something equiped of this type
      await Equip.destroy({                                // unequip
        where: {
          userID: interaction.user.id,
          type: wantedItem.type,
        }
      });
      await Hero.increment(                                // update stats
        { strength: -equippedItem.attack },
        { where: { userID: interaction.user.id } },
      );
      await UserItems.upsert(equippedItem);                // add to inventory
    }
    await Equip.upsert(wantedItem);                        // equip
    await Hero.increment(                                  // update stats
      { strength: +wantedItem.attack },
      { where: { userID: interaction.user.id } },
    );
    await UserItems.destroy({                              // remove from inventory
      where: { 
        id: wantedItem.id,
        userID: interaction.user.id,
      }
    });
    await require('../Functions/heroFunctions').updateClass(interaction, Hero, Equip);
    await interaction.reply({
      content: 'Equipped',
      ephemeral:true,
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Equip a piece of equipment from your inventory')
    .addIntegerOption(option =>
      option.setName('id')
      .setDescription('The item ID in your hero\'s inventory')
      .setRequired(true)),
  execute,
}