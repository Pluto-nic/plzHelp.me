// 'use strict';
var app = require('./../server-config.js');
var db = require('./database');
var Sequelize = require('sequelize'); 

module.exports = function(){

  var ServiceProvider = db.define('ServiceProvider', {
    businessName: Sequelize.STRING,
    address: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING
  });

  var Client = db.define('Client',{
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    zipcode: Sequelize.INTEGER,
    user_id: {
      type: Sequelize.STRING,
      unique: true,
      notEmpty: true,
      // notNull: true,
      primaryKey: true
    },
    gravatar: Sequelize.STRING,
    phone: Sequelize.STRING
  });

  var Project = db.define('Project', {
    description: Sequelize.STRING, // Sequelize.TEXT for huge text files
    date: Sequelize.STRING,
    address: Sequelize.STRING,
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    time: Sequelize.STRING,
    category: Sequelize.STRING,
    isActive: Sequelize.BOOLEAN
  });

  Project.belongsTo(Client, { onDelete: 'cascade' });
  ServiceProvider.hasMany(Project);

  db.sync();
  return {ServiceProvider:ServiceProvider, Client:Client, Project:Project};
};


