
angular.module('app')
.controller('projCtrl', 'defaultFactory' ['$scope', '$stateParams', 'appFact', '$state', '$http', 
  function($scope, $stateParams, appFact, $state, $http){
  $scope.postProject = function(){
    var projData = {};
    projData.description  = $scope.description;
    projData.date         = $scope.date;
    projData.address      = $scope.address;
    projData.phone        = $scope.phone;
    projData.name         = $scope.name;
    projData.time         = $scope.time;
    projData.category     = $scope.category;
    projData.ClientUserId = appFact.profile.user_id;

    defaultFactory.createProject(projData);
}]);