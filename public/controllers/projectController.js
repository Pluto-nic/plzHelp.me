
angular.module('app')
.controller('projCtrl', ['$scope', '$stateParams', 'appFact', '$state', '$http', '$timeout',
  function($scope, $stateParams, appFact, $state, $http, $timeout){
  $scope.postProject = function(){
    var projData = {};
    if($scope.cost[0] === '$'){
      $scope.cost = $scope.cost.slice(1);
    }
    projData.description  = $scope.description;
    projData.date         = $scope.date;
    projData.address      = $scope.address;
    projData.phone        = appFact.userData.phone;
    projData.smsOption    = appFact.userData.smsOption;
    projData.name         = $scope.name;
    projData.time         = $scope.time;
    projData.category     = $scope.category;
    projData.cost         = $scope.cost;
    projData.ClientUserId = appFact.profile.user_id;
    $http.post('/createProject', projData).then(function(){
      $state.go('index.list.overview');
    });
  };
}]);