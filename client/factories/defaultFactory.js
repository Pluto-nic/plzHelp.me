module.exports = function defaultFactory($http){

/*******************************************
   * Create a user
   ******************************************/
   /* 
   Params: 
      firstName: "firstname",
      lastName: "lastname",
      email: "email",
      password: "password",
      street: "944 Market Street",
      city: "San Francisco",
      zipcode: "44306",
      gravatar: "http://www.something.com/pic.jpg",
      user_id: "userid"
      phone: "1-245-687-6568"
   ******************************************/
  function createUser(userData){
    return $http({
      method: 'POST',
      url: '/createUser',
      headers: { 'Content-Type': 'application/json'},
      data: { JSON.stringify(userData)}
    })
    .then(function(res){
      console.log("Successfully created user");
    })
  }

  /*******************************************
   * Create a service provider
   ******************************************/
   /* 
   Params:
      firstName: "firstname",
      lastName: "lastname", 
      businessName: "businessName",
      address: "lastname",
      email: "email",
      password: "password",
      street: "944 Market Street",
      city: "San Francisco",
      zipcode: "44306",
      gravatar: "http://www.something.com/pic.jpg",
      user_id: "userid"
      phone: "1-245-687-6568"
   ******************************************/
  function createServiceProvider(userData){
    return $http({
      method: 'POST',
      url: '/createServiceProvider',
      headers: { 'Content-Type': 'application/json'},
      data: { JSON.stringify(userData)}
    })
    .then(function(res){
      console.log("Successfully created Service Provider");
    })
  }

  /*******************************************
   * Create a project
   ******************************************/
   /* 
   Params:
      title: "title",
      description: "description", 
      category: "category",
      startDate: "2014-05-23",
      endDate: "2014-05-23",
      password: "password",
      street: "944 Market Street",
      city: "San Francisco",
      zipcode: "44306",
      timePosted: "",
      ClientUserId: "userid"
   ******************************************/
  function createProject(data){
    return $http({
      method: 'POST',
      url: '/createServiceProvider',
      headers: { 'Content-Type': 'application/json'},
      data: { JSON.stringify(data)}
    })
    .then(function(res){
      console.log("Successfully created project");
    })
  }

  function openProjects(){
    return $http({
      method: 'GET',
      url: '/openProj',
      headers: { 'Content-Type': 'application/json'}
    })
    .then(function(res){
      //do something
    }
  }

  function getUser(id){
    return $http({
      method: 'GET',
      url: '/clientInfo',
      headers: { 'Content-Type': 'application/json'},
      data: {JSON.stringify(id)}
    })
    .then(function(res){
      //do something
    }
  }



  /*******************************************
   * Expose factory functions to the controller
   ******************************************/

  return({
    createUser: createUser,
    createServiceProvider: createServiceProvider,
    createProject: createProject,
    openProjects: openProjects,
    getUser: getUser
  });

};