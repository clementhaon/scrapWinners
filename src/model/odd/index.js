const { DataTypes } = require('sequelize');

const odds = (sequelize) => {
  const odds = sequelize.define('odds', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });
  return odds;
};

module.exports = odds;
