// 'use strict';
var app = require('./../server-config.js');
var db = require('./database');
var Sequelize = require('sequelize'); 

module.exports = function(){

  var ServiceProvider = db.define('ServiceProvider', {
    businessName: Sequelize.STRING,
    gravatar: Sequelize.STRING,
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    address: Sequelize.STRING,
    street: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    zipcode: Sequelize.STRING,
    city: Sequelize.STRING,
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      notEmpty: true,
      notNull: true,
      primaryKey: true
    }
  });

  var Client = db.define('Client', {
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    street: Sequelize.STRING,
    city: Sequelize.STRING,
    zipcode: Sequelize.STRING,
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      notEmpty: true,
      notNull: true,
      primaryKey: true
    },
    gravatar: Sequelize.STRING,
    phone: Sequelize.STRING
  });

  var Project = db.define('Project', {
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    category: Sequelize.STRING,
    startDate: Sequelize.STRING,
    endDate: Sequelize.STRING,
    street: Sequelize.STRING,
    city: Sequelize.STRING,
    zipcode: Sequelize.STRING,
    timePosted: Sequelize.STRING,
    isActive: Sequelize.BOOLEAN
  });

  Project.belongsTo(Client);
  ServiceProvider.hasMany(Project);

  db.sync();
  return {ServiceProvider:ServiceProvider, Client:Client, Project:Project};
};