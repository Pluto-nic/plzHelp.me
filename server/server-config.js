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
var sequelize = require('./db/database.js');
// var twilio = require('twilio')('ACbca33e0a07cd5c8e6b58f0dc193690b2', '99790a8d9ca408e614041e8b4d068e94');
var twilio = require('twilio')('AC59a7345491fadaa27a3e420d9bea4192', '7a20fe1bf4514a07d2e6d96a11980f27');
var http = require('http');
var cors = require('cors');

app.use(cors());
app.use('/', express.static("./client"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//↓↓↓↓↓↓REQUESTS↓↓↓↓↓↓
//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// get all closed projects
app.post('/closedProj',function(req, res){  //WORKING
  var withAttr = {isActive:false};
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for specific servProv
app.post('/providerOpenProj', function(req, res){
  var withAttr = {
    isActive:true, 
    ServiceProviderId: req.query.ServiceProviderUserId 
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

//get closed projs for specific servProv
app.post('/providerClosedProj', function(req, res){
  var withAttr = {
    isActive:false,
    ServiceProviderUserId: req.body.servProvID
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get closed projects for a SPECIFIC USER
app.post('/clientClosedProj', function(req, res){
  var withAttr = {
    isActive: false,
    ClientUserId: req.body.ClientUserId 
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

// get open projs for a SPECIFIC USER
app.post('/clientOpenProj', function(req, res){
  var withAttr = {
    isActive: true,
    ClientUserId: req.body.user_id
  };  
  serverUtils.getAll(req, res, Project, withAttr);
});

app.post('/clientAllProj', function(req, res){
  var withAttr = {
    ClientUserId: req.body.user_id
  }
  serverUtils.getAll(req, res, Project, withAttr);
});

// close proj (set from active from true to false)
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

app.post('/providerAcceptProj', function(req, res){
  var newValues = { //need value below to associate them
    ServiceProviderUserId: req.body.ServiceProviderUserId
  };
  var withAttr = {
    id:req.body.id
  };
  serverUtils.updateInstance(req, res, Project, newValues, withAttr, function(){
    sequelize.query('select phone, requestSMS from Clients where user_id=(select ClientUserId from Projects where id='
     + req.body.id + ')',
     {type: sequelize.QueryTypes.SELECT}).then(function(clientInfo){
        if(clientInfo[0].requestSMS){
          twilio.messages.create({  
            to: "+1" + clientInfo[0].phone,
            from: "+18449642068", 
            body: "Good News!, someone has accepted your project!"
          }, function(err, message) { 
            console.log(err);
            console.log(message); 
          });
        }
    });
  });
});

//create new Client
app.post('/createUser', function(req, res){
  var attributes = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    zipcode: req.body.zipcode,
    gravatar: req.body.gravatar,
    user_id: req.body.user_id,
    phone: req.body.phone,
    requestSMS: req.body.smsOption
  };
  serverUtils.createInstance(req, res, Client, attributes, function(){
    if(req.body.smsOption){ 
      twilio.outgoingCallerIds.create({
        friendlyName: req.body.firstName + ' ' + req.body.lastName,
        phoneNumber: "+1"+req.body.phone
      }, function(err, number) { 
        console.log(number); 
      });
    }
  });
});

//create new ServiceProvider
app.post('/createServiceProvider', function(req, res){
  var attributes = {
     businessName: req.body.businessName,
     poc: req.body.poc,
     email: req.body.email,
     address: req.body.address,
     city: req.body.city,
     state: req.body.state,
     zipcode: req.body.zipcode,
     phone: req.body.phone,
     specialty: req.body.specialty,
     requestSMS: req.body.smsOption,
     user_id: req.body.user_id,
     gravatar: req.body.gravatar
  };
  serverUtils.createInstance(req, res, ServiceProvider, attributes, function(){
    console.log('the sms option', req.body.smsOption);
    if(req.body.smsOption){ 
      twilio.outgoingCallerIds.create({
        friendlyName: req.body.poc,
        phoneNumber: "+1"+req.body.phone
      }, function(err, number) { 
        console.log(number); 
      });
    }
  });
});

//creates a new Project
app.post('/createProject', function(req, res){  
  var attributes = {
    description: req.body.description,
    date: req.body.date,
    address: req.body.address,
    name: req.body.name,
    phone: req.body.phone,
    time: req.body.time,
    category: req.body.category,
    cost: req.body.cost,
    isActive: true,
    ClientUserId: req.body.ClientUserId
  };


  serverUtils.createInstance(req, res, Project, attributes, function(){
    sequelize.query('select phone from ServiceProviders where specialty = "' + 
      req.body.category + '" and requestSMS = true',
     {type: sequelize.QueryTypes.SELECT}).then(function(servProviders){
      servProviders.forEach(function(number){
        twilio.messages.create({  
          to: "+1" + number.phone,
          from: "+18449642068", 
          body: "A new project was posted that matches your profile. Project details: " + req.body.name + " " + req.body.description  
        }, function(err, message) { 
          console.log(message); 
        });
      });
    });
  });
});

// get all open projs
app.post('/openProj',function(req, res){ 
  var withAttr = {isActive:true};
  serverUtils.getAll(req, res, Project, withAttr);
});

// get all open projs in a certain category
app.post('/openProjwCat',function(req, res){ 
  var withAttr = {isActive:true, category: req.body.category};
  serverUtils.getAll(req, res, Project, withAttr);
});

//get client info
app.post('/clientInfo', function(req, res){
  var withAttr = {
    user_id: req.body.user_id
  };
  serverUtils.getOne(req, res, Client, withAttr);
});

//get ServiceProvider info
app.post('/serviceProviderInfo', function(req, res){
  var withAttr = {
    user_id: req.body.user_id
  };
  serverUtils.getOne(req, res, ServiceProvider, withAttr);
});

app.post('/twilioCall', function(req, res){
  console.log(req);
  var number = req.body.phone_number.slice(2);
  sequelize.query('update Clients set verificationCode="' + 
    req.body.validation_code + '" where phone="' + number + 
    '"', {type: sequelize.QueryTypes.SELECT});
  sequelize.query('update ServiceProviders set verificationCode="' + 
    req.body.validation_code + '" where phone="' + number + 
    '"', {type: sequelize.QueryTypes.SELECT});
  console.log('FINISHED STORING THE VERIFICATION CODE');
  res.end();
});

app.post('/getTwilioCode', function(req, res){
  var acctTable;
  if(req.body.accountType === 'Client'){
    acctTable = 'Clients';
  }else{
    acctTable = 'ServiceProviders';
  }
  console.log(req.body);
  sequelize.query('select verificationCode from ' + acctTable + ' where user_id="'
    + req.body.user_id + '"', {type: sequelize.QueryTypes.SELECT})
    .then(function(code){
      console.log('HERE IS THE RESPONSE CODE', code);
      res.send(code);
    });
});

module.exports = app;