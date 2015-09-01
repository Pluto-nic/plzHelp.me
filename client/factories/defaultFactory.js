module.exports = function defaultFactory($http){

/*******************************************
   * Create a user
   ******************************************/
   /* 
   Params: 
      firstName: "firstname",
      lastName: "lastname",
      email: "email",
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
   * Returns a client
   ******************************************/
   /*
    Params: userid
    */

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
   * Returns a service provider
   ******************************************/
  /*
    Params: serviceProviderID
    */
  function getServiceProvider(id){
    return $http({
      method: 'GET',
      url: '/serviceProvider',
      headers: { 'Content-Type': 'application/json'},
      data: {JSON.stringify(id)}
    })
    .then(function(res){
      //do something
    }
  }

  /*******************************************
   * Returns all open projects
   ******************************************/
   /*
    Params(Optional): serviceProviderID
    */

  function allOpenProjects(id){
   var route; 

    if (id){
      route = '/providerOpenProj';
    } else {
      route = '/openProj';
    }
    
    return $http({
      method: 'GET',
      url: route,
      headers: { 'Content-Type': 'application/json'},
      data: {JSON.stringify(id)}
    })
    .then(function(res){
      //do something
    }
  }

  /*******************************************
   * Returns all closed projects
   ******************************************/
  /*
    Params(Optional): serviceProviderID
    */

  function allClosedProjects(id){
    var route; 

    if (id){
      route = '/providerClosedProj';
    } else {
      route = '/closedProj';
    }

    return $http({
      method: 'GET',
      url: route,
      headers: { 'Content-Type': 'application/json'},
      data: {JSON.stringify(id)}
    })
    .then(function(res){
      //do something
    }
  }
  /*******************************************
   * Ends a projects
   ******************************************/
  function endProject(projectID){
    return $http({
      method: 'POST',
      url: '/closeProj',
      headers: { 'Content-Type': 'application/json'},
      data: { JSON.stringify(projectID)}
    })
    .then(function(res){
      console.log("Successfully closed project");
    })
  }
  /*******************************************
   * Assigns a provider
   ******************************************/

  function assignProvider(projectID, userid){
    var data = {
      pid: projectID,
      uid: userid
    };

    return $http({
      method: 'POST',
      url: '/closeProj',
      headers: { 'Content-Type': 'application/json'},
      data: { JSON.stringify(data)}
    })
    .then(function(res){
      console.log("Successfully assigned provider");
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


  /*******************************************
   * Expose factory functions to the controller
   ******************************************/

  return({
    createUser: createUser,
    createServiceProvider: createServiceProvider,
    getUser: getUser,
    getServiceProvider: getServiceProvider,
    allOpenProjects: allOpenProjects,
    allClosedProjects: allClosedProjects,
    endProject: endProject,
    assignProvider: assignProvider,
    createProject: createProject,
    
  });

};