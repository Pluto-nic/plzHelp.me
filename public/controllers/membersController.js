angular.module('app')
  .controller('MembersCtrl', ['$scope', '$state', 'appFact', '$http',
   function($scope, $state, appFact, $http){
    $scope.Model = {
      categories : ["Client", "Contractor"],
    }
    $scope.servProvJoinProj = function(proj){
      $http.post('/providerAcceptProj', 
        {ServiceProviderUserId: appFact.userData.user_id, id: proj.id});
    };
    $scope.getData = function(){
      $http.post('/clientInfo', {user_id: appFact.profile.user_id})
        .then(function(results){
          console.log('user info: ', results);
        })
    };
    if(appFact.category === 'Client'){
      $http.post('/clientAllProj', appFact.profile)
        .then(function(response){
          $scope.filteredProj = {}, $scope.expenditures = 0;
          if(response.data.length){
            response.data.reduce(function(memo, current){
              memo[current.category] ? memo[current.category].push(current) 
                : memo[current.category] = [current];
              return memo;
            }, $scope.filteredProj);
            response.data.reduce(function(memo, current){
              if(!current.isActive){
                $scope.expenditures += current.cost;
              }
              return $scope.expenditures;
            }, $scope.expenditures);
          }
          $scope.accountType = appFact.category
          $scope.projects = response.data;
          appFact.projects = response.data;
          $scope.profile = appFact.profile;
          $scope.userData = appFact.userData;
          $state.go('index.list.overview');
        });
    }
    if(appFact.category === 'ServiceProvider'){
      $http.post('/openProjwCat', {category: appFact.userData.specialty})
        .then(function(projects){
          $scope.availProjects = projects.data;
        });
      $http.post('/providerClosedProj', {servProvID: appFact.profile.user_id})
        .then(function(projects){
          $scope.closedProjects = projects.data;
          $scope.earnings = 0;
          if($scope.closedProjects){
            $scope.closedProjects.reduce(function(memo, current){
              $scope.earnings += current.cost;
              return $scope.earnings;
            }, $scope.earnings);
          }
        });
      $scope.accountType = appFact.category;
      $scope.userData = appFact.userData;
      $scope.profile = appFact.profile;
      $state.go('index.list.overview');
    }
}]);