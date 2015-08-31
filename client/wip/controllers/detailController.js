angular.module('app')
  .controller('DetailCtrl', ['$scope', '$stateParams', function($scope, $stateParams){
    // add item to model
    $scope.Model = { 
      item : $scope.Model.items[$stateParams.id],
    }
    $scope.$on("$destroy", function() {delete $scope.Model.item; })
}]);