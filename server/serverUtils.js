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

  createInstance: function(req, res, model, attributes){
    model.build(attributes)
    .save()
    .then(function(anotherModel){
      res.sendStatus(200);
    })
    .catch(function(err){
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

