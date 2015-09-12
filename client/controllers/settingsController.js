angular.module('app')
  .controller('settingsCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.profile = appFact.profile;
    $scope.accountType = appFact.category;
    $scope.userData = appFact.userData;
    $scope.updateUser = function(){
      if($scope.accountType === 'Client'){
        appFact.userData.firstName = $scope.firstName;
        appFact.userData.lastName  = $scope.lastName;
        appFact.userData.email     = $scope.email;
        appFact.userData.address   = $scope.address;
        appFact.userData.city      = $scope.city;
        appFact.userData.state     = $scope.state;
        appFact.userData.zipcode   = $scope.zipcode;
        appFact.userData.phone     = $scope.phone;
        appFact.userData.smsOption = $scope.smsOption;
       $http.post('/createUser', appFact.userData)
        .then(function(response){
           $state.go('index.list.overview');
        });
      }else{
        appFact.userData.businessName   = $scope.businessName;
        appFact.userData.poc            = $scope.poc;
        appFact.userData.phone          = $scope.phone;
        appFact.userData.email          = $scope.email;
        appFact.userData.address        = $scope.address;
        appFact.userData.city           = $scope.city;
        appFact.userData.state          = $scope.state;
        appFact.userData.zipcode        = $scope.zipcode;
        appFact.userData.specialty      = $scope.specialty;
        appFact.userData.smsOption      = $scope.smsOption;
       $http.post('/createServiceProvider', appFact.userData)
        .then(function(response){
          $state.go('index.list.overview');
        });
      }
    };
}]);