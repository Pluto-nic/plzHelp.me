var models = require('./db/orm-model.js');
var models = models();
var ServiceProvider = models.ServiceProvider;
var Client = models.Client;
var Project = models.Project;
var sequelize = require('./db/database.js');

module.exports = {

  getAll: function(req, res, model, conditions){
    model.findAll({
      where: conditions
    })
    .then(function(resultOfFind){
      console.log(resultOfFind);
      res.json(resultOfFind)
    });
  },

  getOne: function(req, res, model, conditions){
    model.findOne({
      where: conditions
    })
    .then(function(resultOfFind){
      console.log(resultOfFind);
      res.json(resultOfFind)
    });
  },

  createInstance: function(req, res, model, attributes, callback){
    model.build(attributes)
    .save()
    .then(function(anotherModel){
      if(callback){
        callback();
      }
      console.log('Successfully Created instance', anotherModel);
      res.end(); //NOT SURE
    })
    .catch(function(err){
      console.log('ERROR CREATING INSTANCE: ', err);
    });
  },

  updateInstance: function(req, res, model, updateValues, conditions){
    model.update(updateValues, {where:conditions})
    .then(function(){
      console.log('successfully updated values in DB');
      res.end();
    })
    .error(function(err){
      console.log('ERR updating values: ', err)
    });
  }

};

