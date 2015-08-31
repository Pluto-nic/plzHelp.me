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

// app.set('view engine', 'html');
// app.use('/', express.static(__dirname + "./../public"));
app.use('/', express.static("./public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//Insert or update user information in database
// app.post('/test', serverUtils.testFunc(req,res));

// get all closed projects
app.get('/closedProj',function(req, res){  //WORKING
  // serverUtils.getProject(req, res, false);
  var withAttr = {isActive:false};
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for specific servProv
app.get('/providerOpenProj', function(req, res){
  // serverUtils.getProviderProject(req, res, true);
  var withAttr = {
    isActive:true, 
    ServiceProviderId: req.query.ServiceProviderId //this is what I will need
    //or
    //ServiceProviderId: req.body.id
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

//get closed projs for specific servProv
app.get('/providerClosedProj', function(req, res){
  // serverUtils.getProviderProject(req, res, false);
  var withAttr = {
    isActive:false,
    ServiceProviderId: req.query.ServiceProviderId //this is what I will need
    //or
    //ServiceProviderId: req.body.id
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get closed projects for a SPECIFIC USER
app.get('/clientClosedProj', function(req, res){
  // serverUtils.getClientProject(req, res, false);
  var withAttr = {
    isActive: false,
    ClientId: req.query.ClientId 
    //or
    //ClientId: req.body.id
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for a SPECIFIC USER
app.get('/clientOpenProj', function(req, res){
  // serverUtils.getClientProject(req, res, true);
  var withAttr = {
    isActive: true,
    ClientId: req.query.ClientId 
    //or
    //ClientId: req.body.id  (this is if they send client obj over)
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});



// close proj (set from active from true to false)
app.post('/closeProj', function(req, res){
  // serverUtils.closeProject(req, res);

  var newValues = {
    isActive: false,  
  };
  var withAttr =  {
    isActive: true,
    id: req.body.id
  };
  serverUtils.updateInstance(req, res, Project, newValues, withAttr);
});

// add servProvID to open proj (STILL NEED TODO)
app.post('/providerAcceptProj', function(req, res){
  var newValues = { //need value below to associate them
    ServiceProviderId: req.body.ServiceProviderId
  };
  var withAttr = {
    id:req.body.id
  };
  serverUtils.updateInstance(req, res, Project, newValues, withAttr);
});

//create new Client
app.post('/createUser', function(req, res){
  // serverUtils.addClient(req,res);
  var attributes = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    zipcode: req.body.zipcode,
    gravatar: req.body.gravatar,
    phone: req.body.phone
  };
  serverUtils.createInstance(req, res, Client, attributes);
});

//create new ServiceProvider
app.post('/createServiceProvider', function(req, res){
  var attributes = {
     businessName: req.body.businessName,
     address: req.body.address,
     phone: req.body.phone,
     email: req.body.email,
     password: req.body.password
  };
  serverUtils.createInstance(req, res, ServiceProvider, attributes);
});

//creates a new Project
app.post('/createProject', function(req, res){  //WORKING...ISH
  // serverUtils.postProject(req, res);
  console.log('description', req.body.description);
  console.log('DATE', req.body.date);
  console.log(req.body);
  var attributes = {
    description: req.body.description,
    date: req.body.date,
    address: req.body.address,
    name: req.body.name,
    phone: req.body.phone,
    time: req.body.time,
    category: req.body.category,
    isActive: true,
    ClientId: req.body.ClientId
  };
  serverUtils.createInstance(req, res, Project, attributes)
});

// get all open projs
app.get('/openProj',function(req, res){  //WORKING
  // serverUtils.getProject(req, res, true);
  var withAttr = {isActive:true};
  serverUtils.getAll(req, res, Project, withAttr);
});



// UNUSED ROUTES SO FAR
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//work on testing routes above, the finish these





//get client info
app.get('/clientInfo', function(req, res){
  var withAttr = {
    id: req.body.id
  };
  serverUtils.getOne(req, res, Client, withAttr);
});

//get ServiceProvider info
app.get('/serviceProviderInfo', function(req, res){
  var withAttr = {
    //attr to associate with serviceProvider such as spID
    businessName: req.businessName,
    id: req.body.id            //either will work
  };
  serverUtils.getOne(req, res, ServiceProvider, withAttr);
});



/***
***/
module.exports = app;