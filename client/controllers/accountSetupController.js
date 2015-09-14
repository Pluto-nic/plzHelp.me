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
      userData.address   = $scope.address;
      userData.city      = $scope.city;
      userData.state     = $scope.state;
      userData.zipcode   = $scope.zipcode;
      userData.phone     = $scope.phone;
      userData.smsOption = $scope.smsOption;
      userData.user_id   = appFact.profile.user_id;
      userData.gravatar  = appFact.profile.picture;
      appFact.userData   = userData;
      if($scope.smsOption){
        $http.post('/createUser', userData)
         .then(function(response){
            $state.go('verify')
         });
      }else{
       $http.post('/createUser', userData)
        .then(function(response){
           $state.go('index.list.overview');
        });
      }
    }else{
      userData.businessName   = $scope.businessName;
      userData.poc            = $scope.poc;
      userData.email          = $scope.email;
      userData.phone          = $scope.phone;
      userData.address        = $scope.address;
      userData.city           = $scope.city;
      userData.state          = $scope.state;
      userData.zipcode        = $scope.zipcode;
      userData.specialty      = $scope.specialty;
      userData.smsOption      = $scope.smsOption;
      userData.user_id        = appFact.profile.user_id;
      userData.gravatar       = appFact.profile.picture;
      appFact.userData        = userData;
      if($scope.smsOption){
        $http.post('/createUser', userData)
         .then(function(response){
            $state.go('verify')
         });
      }else{
       $http.post('/createUser', userData)
        .then(function(response){
           $state.go('index.list.overview');
        });
      }
    }
  }
}]);