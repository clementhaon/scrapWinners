const { DataTypes } = require('sequelize');

const events = (sequelize) => {
  const events = sequelize.define('events', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    homeTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    awayTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return events;
};

module.exports = events;
