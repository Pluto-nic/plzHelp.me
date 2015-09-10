angular.module('app')
  .controller('settingsCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.profile = appFact.profile;
    $scope.userData = appFact.userData;
}]);