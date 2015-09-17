angular.module('app')
  .controller('historyCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.projects = appFact.projects;
    $scope.closeProj = function(project){
      if($scope.accountType == 'Client'){
        project.isActive = false;
        appFact.userData.pointsEarned += 50;
        console.log(appFact.userData);
        $http.post('/closeProj', {id: project.id});
        $http.post('/createUser', appFact.userData)
      }
    };
}]);