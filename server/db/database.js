var Sequelize = require('sequelize');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'halp'
});

var sequelize = new Sequelize(process.env.MYSQL || 'mysql://root@localhost:3306/halp');

module.exports = sequelize;