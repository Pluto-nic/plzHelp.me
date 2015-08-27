var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var serverUtils = require('./serverUtils.js');
var path = require('path');

// app.set('view engine', 'html');
app.use('/', express.static(__dirname + "./../public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Insert or update user information in database
// app.post('/test', serverUtils.testFunc);
/***
  get all open projs
  get all close projs
  add servProvID to open proj
  close proj (set from active from true to false)
  get open projs for specific user
  get closed projs for specific user
  get open projs for specific servProv
  get closed projs for specific servProv
***/
module.exports = app;