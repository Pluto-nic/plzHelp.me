angular.module('app')
  .controller('cardCtrl', ['$scope', 'appFact', function($scope, appFact){
    $scope.profile = appFact.profile;
    $scope.userData = appFact.userData;
}]);