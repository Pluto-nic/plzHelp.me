var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var serverUtils = require('./serverUtils.js');
var path = require('path');
var models = require('./db/orm-model.js');
var models = models();
var ServiceProvider = models.ServiceProvider;
var Client = models.Client;
var Project = models.Project;
var twilio = require('twilio')('ACbca33e0a07cd5c8e6b58f0dc193690b2', '99790a8d9ca408e614041e8b4d068e94');
var http = require('http');

var cors = require('cors');
// app.all('/', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//  });
app.use(cors());
app.use('/', express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

http.createServer(function (req, res) {
    //Create TwiML response
  var twiml = new twilio.TwimlResponse();
  twiml.say('Hello World!');

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
  // var body = '';

  //  req.on('data', function(data) {
  //    body += data;
  //  });

  //  req.on('end', function() {
  //    //Create TwiML response
  //    var twiml = new twilio.TwimlResponse();

  //    twiml.message('Thanks, your message of "' + body + '" was received!');

  //   res.writeHead(200, {'Content-Type': 'text/xml'});
  //   res.end(twiml.toString());
  //   });
}).listen(1337, '127.0.0.1');

console.log('TwiML servin\' server running at http://127.0.0.1:1337/');
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//↓↓↓↓↓↓REQUESTS↓↓↓↓↓↓
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// get all closed projects
app.get('/closedProj',function(req, res){  
  var withAttr = {isActive:false};
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for specific servProv
app.get('/providerOpenProj', function(req, res){
  var withAttr = {
    isActive:true, 
    ServiceProviderUserId: req.query.ServiceProviderUserId 
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

//get closed projs for specific servProv
app.get('/providerClosedProj', function(req, res){
  var withAttr = {
    isActive:false,
    ServiceProviderUserId: req.query.ServiceProviderUserId
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get closed projects for a SPECIFIC USER
app.get('/clientClosedProj', function(req, res){
  var withAttr = {
    isActive: false,
    ClientUserId: req.query.ClientUserId 
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for a SPECIFIC USER
app.get('/clientOpenProj', function(req, res){
  var withAttr = {
    isActive: true,
    ClientUserId: req.query.ClientUserId 
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// close proj (set isActive from true to false)
app.post('/closeProj', function(req, res){
  var newValues = {
    isActive: false,  
  };
  var withAttr =  {
    isActive: true,
    id: req.body.id
  };
  serverUtils.updateInstance(req, res, Project, newValues, withAttr);
});

// add servProvID to open proj 
app.post('/providerAcceptProj', function(req, res){
  var newValues = { 
    ServiceProviderUserId: req.body.ServiceProviderUserId
  };
  var withAttr = {
    id:req.body.id
  };
  serverUtils.updateInstance(req, res, Project, newValues, withAttr);
});

//create new Client
app.post('/createUser', function(req, res){
  var attributes = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    street: req.body.street,
    city: req.body.city,
    zipcode: req.body.zipcode,
    gravatar: req.body.gravatar,
    user_id: '01-' + req.body.user_id,
    phone: req.body.phone
  };
  serverUtils.createInstance(req, res, Client, attributes);
});

//create new ServiceProvider
app.post('/createServiceProvider', function(req, res){
  console.log(req.body);
  var attributes = {
     businessName: req.body.businessName,
     gravatar: req.body.gravatar,
     firstName: req.body.firstName,
     lastName: req.body.lastName,
     address: req.body.address,
     street: req.body.street,
     phone: req.body.phone,
     email: req.body.email,
     zipcode: req.body.zipcode,
     city: req.body.city,
     user_id: '02-' + req.body.user_id
  };
  serverUtils.createInstance(req, res, ServiceProvider, attributes);
});

//creates a new Project
app.post('/createProject', function(req, res){  
  console.log('description', req.body.description);
  console.log('DATE', req.body.date);
  console.log(req.body);
  var attributes = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    street: req.body.street,
    city: req.body.city,
    zipcode: req.body.zipcode,
    timePosted: req.body.timePosted,
    isActive: true,
    ClientUserId: req.body.ClientUserId
  };

  serverUtils.createInstance(req, res, Project, attributes, function(){
    twilio.messages.create({  
      to: "+16263157096",
      from: "+17472238716", 
      body: "A new project was posted: " + attributes.title + " - " + attributes.description  
    }, function(err, message) { 
      console.log(message.sid); 
    });
  });
});

// get all open projs
app.get('/openProj',function(req, res){ 
  var withAttr = {isActive:true};
  serverUtils.getAll(req, res, Project, withAttr);
});

//get client info
app.get('/clientInfo', function(req, res){
  var withAttr = {
    user_id: req.body.user_id
  };
  serverUtils.getOne(req, res, Client, withAttr);
});

//get ServiceProvider info
app.get('/serviceProviderInfo', function(req, res){
  var withAttr = {
    id: req.body.id  
  };
  serverUtils.getOne(req, res, ServiceProvider, withAttr);
});


module.exports = app;