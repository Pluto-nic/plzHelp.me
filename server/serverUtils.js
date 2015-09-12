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
      res.json(resultOfFind)
    });
  },

  getOne: function(req, res, model, conditions){
    model.findOne({
      where: conditions
    })
    .then(function(resultOfFind){
      res.json(resultOfFind)
    });
  },

  createInstance: function(req, res, model, attributes, callback){
    model.upsert(attributes)
    .then(function(anotherModel){
      if(callback){
        callback();
      }
      res.json(anotherModel);
    })
    .catch(function(err){
      res.end(err);
    });
  },

  updateInstance: function(req, res, model, updateValues, conditions){
    model.update(updateValues, {where:conditions})
    .then(function(){
      res.end();
    })
    .error(function(err){
      res.end(err);
    });
  }
};