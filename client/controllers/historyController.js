angular.module('app')
  .controller('historyCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.projects = appFact.projects;
}]);