angular.module('app')
  .controller('MembersCtrl', ['$scope', function($scope){
    $scope.Model = {
      categories : ["Client", "Contractor"],
    }
}]);