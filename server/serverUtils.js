//require sequelize models
var models = require('./db/orm-model.js');
var models = models();
var ServiceProvider = models.ServiceProvider;
var Client = models.Client;
var Project = models.Project;
var sequelize = require('./db/database.js');

module.exports = {
  // getProject: function(req, res, bool){
  //   Project.findAll({
  //     where:{
  //       active: bool
  //     }
  //   }).then(function(projects){
  //     console.log(projects);
  //     res.json(projects)
  //   });
  // },

  // postProject: function(req, res){
  //   Project.build({
  //     description: req.description,
  //     date: req.date,
  //     address: req.address,
  //     name: req.name,
  //     phone: req.phone,
  //     time: req.time,
  //     category: req.category,
  //     active: req.active
  //   })
  //   .save()
  //   .error(function(err){
  //     console.log('ERROR POSTING PROJECT: ', err);
  //   })
  //   .success(function(){
  //     console.log('Successfully posted project')
  //     res.end(); //NOT SURE
  //   });
  // },

  // closeProject: function(req, res){
  //   Project.update({
  //     active: false
  //   },
  //   {
  //     where:{
  //       //attributes to link project to database
  //     }
  //   })
  //   .success(function(){
  //     console.log('project successfully closed');
  //     res.end();
  //   })
  //   .error(function(err){
  //     console.log('ERR closing project ', err)
  //   });
  // },

  //getClientProject: function(req, res, bool){
  //  Project.findAll({
  //    where:{
  //      active: bool
  //      //property that links client to project
  //    }
  //  }).then(function(clientProjects){
  //    console.log(clientProjects);
  //    res.json(clientProjects)
  //  });
  //},

  //getProviderProject: function(req, res, bool){
  //  Project.findAll({
  //    where:{
  //      active: bool
  //      //property that links provider to project
  //    }
  //  }).then(function(providerProjects){
  //    console.log(providerProjects);
  //    res.json(providerProjects)
  //  });
  //},

  // addClient: function(req, res){
  //   Client.build({
  //     firstName: req.firstName,
  //     lastName: req.lastName,
  //     email: req.email,
  //     password: req.password,
  //     zipcode: req.zipcode,
  //     gravatar: req.gravatar,
  //     phone: req.phone
  //   })
  //   .save()
  // },
  //model = Client, Project, or ServiceProvider
  //conditions = {} that would goto where
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

  createInstance: function(req, res, model, attributes){
    model.build(attributes)
    .save()
    .then(function(anotherModel){
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






/**

module.exports = {
  upsertUser : function(req, res) {
   'use strict';
    User.upsert({
      userId: req.body.user_id,
      email: req.body.email,
      picture: req.body.picture || req.body.gravatar,
      name: req.body.name,
      nickname:req.body.nickname});
    res.sendStatus(200);
  },

  addActivity : function(req, res){
  'use strict';
    Activity.build({
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      keywords: req.body.keywords,
      ownerIdUserId: req.body.user_id,
      active: true
    })
    .save();
  res.redirect('/');
},

retrieveActivityFeed: function(req, res){
  'use strict';

  //query for all activities for which the user is NOT an owner
  sequelize.query("select id, description, title, keywords, location, " +
    "(select picture from Users user where userId = activity.ownerIdUserId) " +
    "as avatar, (select name from Users user where userId = " +
    "activity.ownerIdUserId) as owner from Activities activity " +
    "where ownerIdUserId != '" + req.query.user_id + "' and active = true",
    { type: sequelize.QueryTypes.SELECT}).then(function(results){
      res.send(results);
  });
},
  joinActivity : function(req, res){
    'use strict';
    User.find({where : {userId: req.body.user_id}})
      .then(function(user){
        Activity.find({where: {id: req.body.activity_id}})
        .then(function(activity){
          user.addActivity(activity);
        });
      });
    res.redirect('/');
  },

  leaveActivity:  function(req, res){
    'use strict';
    User.find({where: {userId: req.body.user_id}})
    .then(function(user){
      Activity.find({where: {id: req.body.activity_id}})
      .then(function(activity){
        user.removeActivity(activity);
      });
    });
    res.redirect('/');
  },

  ownerActivities : function(req, res){
    'use strict';
    Activity.findAll({
      where: {
        //diferentiate between owner and just belonging to activity
        ownerIdUserId : req.query.user_id,
        active: true
      }
    }).then(function(ownedActivities){
      res.send(ownedActivities);
    });
  },

  participatingActivities : function(req, res){
    'use strict';
    User.find({
      where : {
          userId: req.query.user_id
        }
      }).then(function(user){
        user.getActivities({
          where : {
            active : true
          }
      })
      .then(function(activities){
        res.send(activities);
      });
    });
  },

  closedActivities : function(req, res){
     'use strict';
    Activity.findAll({
      where: {
        ownerIdUserId : req.query.user_id,
        active : false
      }
    }).then(function(ownedActivities){
      res.send(ownedActivities);
    });
  },

 toggleActivityStatus : function(req, res){
  'use strict';
  Activity.find({
    where: {
      id: req.body.activity_id
    }
  })
  .then(function(activity){
    activity.updateAttributes({active: !activity.get('active')});
  });
  res.redirect('/');
 }
}**/