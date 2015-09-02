angular.module('app')
  .controller('MembersCtrl', ['$scope', '$state', 'appFact', function($scope, $state, appFact){
    $scope.Model = {
      categories : ["Client", "Contractor"],
    }
    $scope.profile = appFact.profile;
    $scope.userData = appFact.userData;
    console.log(appFact);
    $state.go('index.list.overview');
}]);