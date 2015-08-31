// 'use strict';
var app = require('./../server-config.js');
var db = require('./database');
var Sequelize = require('sequelize');

// module.exports = function(){
//   var Model = db.define('Model', {
//     attr: { type:Sequelize.TYPE,
//       unique:true or false,
//       notEmpty:

//     },
//     secondAttr: Sequelize.STRING

//   });
//   var SecondModel;

//   db.sync();
//   return {Model:Model};
// };

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

  Project.belongsTo(Client);
  ServiceProvider.hasMany(Project);

  db.sync();
  return {ServiceProvider:ServiceProvider, Client:Client, Project:Project};
};

/****
serviceProviderTable - (business name, address, phone, email, password)
clientTable - (firstName, lastName, email, password, zipcode, gravatar, phone)
projectTable - (description, date, address, name, phone number, time )
clientProviderProjectTable - (completedFlag, clientId, providerId)
***/
//We don't need create a join table when we're using an ORM 
//Use a method to set relationships
// Activity.belongsToMany(User, {through: 'UserActivity'});
// User.belongsToMany(Activity, {through: 'UserActivity'});



/*****
  Activity.belongsTo(User, {as:'ownerId'});
*****/