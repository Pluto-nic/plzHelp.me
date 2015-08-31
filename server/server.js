var app = require('./server-config.js');
var database = require('./db/orm-model.js');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

console.log('Server listening on port ', app.get('port'));

// var mysql = require('mysql');
// var Sequelize = require('sequelize');
// var sequelize = new Sequelize('chat', 'root', null, {define: {timestamps:false}});