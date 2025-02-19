const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite')
});

const Guild = sequelize.define('Guild', {
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    guildName: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = { sequelize, Guild };
