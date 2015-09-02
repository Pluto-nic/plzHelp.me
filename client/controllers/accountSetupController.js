angular.module('app')
.controller('acctCtrl',  ['$scope', '$stateParams', 'appFact', '$state', '$http', 
  function($scope, $stateParams, appFact, $state, $http){
  $scope.newUser = function(){
    appFact.category =$scope.accountType;
    var userData = {};
    if($scope.accountType === 'Client'){
      userData.firstName = $scope.firstName;
      userData.lastName  = $scope.lastName;
      userData.email     = $scope.email;
      userData.phone     = $scope.phone;
      userData.zipcode   = $scope.zipcode;
      userData.user_id   = appFact.profile.user_id;
      userData.gravatar  = appFact.profile.picture;
      appFact.userData   = userData;
     $http.post('/createUser', userData)
      .then(function(response){
        // $state.go('index');
      });
    }else{
      userData.businessName   = $scope.businessName;
      userData.poc            = $scope.poc;
      userData.email          = $scope.email;
      userData.phone          = $scope.phone;
      userData.zipcode        = $scope.zipcode;
      userData.user_id        = appFact.profile.user_id;
      userData.gravatar       = appFact.profile.picture;
      appFact.userData        = userData;
     $http.post('/createServiceProvider', userData)
      .then(function(response){
        // $state.go('index');
      });
    }

  }
}]);