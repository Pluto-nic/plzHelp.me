var app = require('./../server-config.js');
var db = require('./database');
var Sequelize = require('sequelize'); 

module.exports = function(){

  var ServiceProvider = db.define('ServiceProvider', {
    businessName: Sequelize.STRING,
    poc: Sequelize.STRING,
    email: Sequelize.STRING,
    address: Sequelize.STRING,
    city: Sequelize.STRING,
    state: Sequelize.STRING,
    zipcode: Sequelize.STRING,
    phone: Sequelize.STRING,
    specialty: Sequelize.STRING,
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      notEmpty: true,
      notNull: true,
      primaryKey: true
    },
    gravatar: Sequelize.STRING,
    requestSMS: Sequelize.BOOLEAN,
    verificationCode: Sequelize.STRING
  });

  var Client = db.define('Client',{
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    address: Sequelize.STRING,
    city: Sequelize.STRING,
    state: Sequelize.STRING,
    zipcode: Sequelize.INTEGER,
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      notEmpty: true,
      notNull: true,
      primaryKey: true
    },
    gravatar: Sequelize.STRING,
    requestSMS: Sequelize.BOOLEAN,
    verificationCode: Sequelize.STRING,
    pointsEarned: Sequelize.INTEGER
  });

  var Project = db.define('Project', {
    description: Sequelize.STRING, 
    date: Sequelize.STRING,
    address: Sequelize.STRING,
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    time: Sequelize.STRING,
    category: Sequelize.STRING,
    cost: Sequelize.INTEGER,
    isActive: Sequelize.BOOLEAN
  });

  Project.belongsTo(Client);
  ServiceProvider.hasMany(Project);

  db.sync();
  return {ServiceProvider:ServiceProvider, Client:Client, Project:Project};
};


