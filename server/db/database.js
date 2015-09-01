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

var sequelize = new Sequelize(process.env.MYSQL || 'mysql://root@localhost:3306/halp');

module.exports = sequelize;