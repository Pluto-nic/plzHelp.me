var express = require('express');
var path = require('path');
var pathParse = require('path-parse'); // polyfill for older Node versions
var favicon = require('serve-favicon');

var app = express();

// view engine setup - Derek we will use this if we end up using an ejs file to be served from server
// app.set('views', path.join(__dirname, 'views')); 
// app.set('view engine', 'ejs');


app.use(express.static(__dirname + "/../public"));
app.use(favicon(__dirname + '/../client/favicon.ico'));

// YOUR CODE HERE DEREK
var app = require('./server-config.js');
var database = require('./db/orm-model.js');

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

console.log('Server listening on port ', app.get('port'));

// var mysql = require('mysql');
// var Sequelize = require('sequelize');
// var sequelize = new Sequelize('chat', 'root', null, {define: {timestamps:false}});
