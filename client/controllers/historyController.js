angular.module('app')
  .controller('historyCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.projects = appFact.projects;
    $scope.closeProj = function(project){
      if($scope.accountType == 'Client'){
        $http.post('/closeProj', {id: project.id});
        project.isActive = false;
      }
    };
}]);