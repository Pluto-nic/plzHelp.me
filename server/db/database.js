var Sequelize = require('sequelize');
var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host : 'localhost',
//   user : 'root',
//   password : '',
//   database : 'halp'
// });

// connection.connect(function(err){
//   if(err){
//   console.log('Error connecting to Db');
//   return;
//   }
//   console.log('Connection established');
// });

var sequelize = new Sequelize('mysql://b3c7e43b293c24:5f153d7f@us-cdbr-iron-east-02.cleardb.net/heroku_91dcc327f5a9f3b?reconnect=true');

module.exports = sequelize;