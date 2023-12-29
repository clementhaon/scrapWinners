//Same league model as before
const { DataTypes } = require('sequelize');

const leagues = (sequelize) => {
    const leagues = sequelize.define('leagues', {
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        league: {
        type: DataTypes.STRING,
        allowNull: false,
        },
    });
    
    return leagues;

}

module.exports = leagues;