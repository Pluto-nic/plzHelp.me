angular.module('app')
  .controller('verificationCtrl', ['$scope', '$state', 'appFact', function($scope, $state, appFact){
    $scope.backToProfile = function(){
      $state.go('index.list.overview'); 
    };   
}]);