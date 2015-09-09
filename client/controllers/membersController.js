angular.module('app')
  .controller('MembersCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.Model = {
      categories : ["Client", "Contractor"],
    }
    if(appFact.category === 'Client'){
      $http.post('/clientAllProj', appFact.profile)
        .then(function(response){
          $scope.projects = response.data;
          appFact.projects = response.data;
          $scope.profile = appFact.profile;
          $scope.userData = appFact.userData;
          $state.go('index.list.overview');
        });
    }
    if(appFact.category === 'ServiceProvider'){
      $scope.userData = appFact.userData;
      $scope.profile = appFact.profile;
      $state.go('index.list.overview');
    }
}]);