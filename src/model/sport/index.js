const { DataTypes } = require('sequelize');

const sports = (sequelize) => {
    const sports = sequelize.define('sports', {
        id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        },
        sport: {
        type: DataTypes.STRING,
        allowNull: false,
        },
    });
    
    return sports;

}

module.exports = sports;