var express = require('express');
var path = require('path');
//var pathParse = require('path-parse'); // polyfill for older Node versions
//var favicon = require('serve-favicon');
var app = express();

app.use('/', express.static("./client"));
// view engine setup - Derek we will use this if we end up using an ejs file to be served from server
//app.set('client', path.join(__dirname, 'client')); 
//app.set('view engine', 'html'); //this would just be ejs instead of html if we werent' using ejs

// when user goes to site, it'll go look for an index.html file inside of whatever folder is specified here
//app.use(express.static(__dirname + "./views/"));

//app.use(favicon(__dirname + '/../client/favicon.ico'));

// YOUR CODE HERE DEREK

//app.get('/*', function(req, res){
//  res.render('client/index.html');
//})

app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'));
console.log("App listening on port");
