angular.module('app')
  .controller('settingsCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    $scope.profile = appFact.profile;
    $scope.accountType = appFact.category;
    $scope.userData = appFact.userData;
    $scope.updateUser = function(){
      if($scope.accountType === 'Client'){
        appFact.userData.firstName = $scope.firstName || appFact.userData.firstName;
        appFact.userData.lastName  = $scope.lastName  || appFact.userData.lastName;
        appFact.userData.email     = $scope.email     || appFact.userData.email;
        appFact.userData.address   = $scope.address   || appFact.userData.address;
        appFact.userData.city      = $scope.city      || appFact.userData.city;
        appFact.userData.state     = $scope.state     || appFact.userData.state;
        appFact.userData.zipcode   = $scope.zipcode   || appFact.userData.zipcode;
        appFact.userData.phone     = $scope.phone     || appFact.userData.phone;
        appFact.userData.smsOption = $scope.smsOption || appFact.userData.smsOption;
       $http.post('/createUser', appFact.userData)
        .then(function(response){
           $state.go('index.list.overview');
        });
      }else{
        appFact.userData.businessName   = $scope.businessName || appFact.userData.businessName;
        appFact.userData.poc            = $scope.poc          || appFact.userData.poc;
        appFact.userData.phone          = $scope.phone        || appFact.userData.phone;
        appFact.userData.email          = $scope.email        || appFact.userData.email;
        appFact.userData.address        = $scope.address      || appFact.userData.address;
        appFact.userData.city           = $scope.city         || appFact.userData.city;
        appFact.userData.state          = $scope.state        || appFact.userData.state;
        appFact.userData.zipcode        = $scope.zipcode      || appFact.userData.zipcode;
        appFact.userData.specialty      = $scope.specialty    || appFact.userData.specialty;
        appFact.userData.smsOption      = $scope.smsOption    || appFact.userData.smsOption;
       $http.post('/createServiceProvider', appFact.userData)
        .then(function(response){
          $state.go('index.list.overview');
        });
      }
    };
}]);