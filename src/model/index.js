// Sequelize connexion
const Events = require('./event');
const Odds = require('./odd');
const Sports = require('./sport');
const Leagues = require('./league');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DB_NAME}`,
    { logging: false }
);

sequelize.authenticate()
  .then(() => {
    console.log('Mysql connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const models = {
  Events: Events(sequelize),
  Odds: Odds(sequelize),
  Sports: Sports(sequelize),
  Leagues: Leagues(sequelize),
};

models.Events.belongsToMany(models.Odds, { through: 'events_has_odds' });
models.Odds.belongsToMany(models.Events, { through: 'events_has_odds' });

models.Sports.hasMany(models.Events);
models.Events.belongsTo(models.Sports);

models.Leagues.hasMany(models.Events);
models.Events.belongsTo(models.Leagues);

models.Sports.hasMany(models.Leagues);
models.Leagues.belongsTo(models.Sports);

models.sequelize = sequelize;
models.Sequelize = Sequelize;

sequelize.sync()
  .then( async () => {
    console.log(`Database & tables created`);
  })
  .catch(err => {
    console.log(`Database & tables not created!`);
    console.log(err)
  });

module.exports = models;
