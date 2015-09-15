angular.module('app')
  .controller('verificationCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
      $http.post('/getTwilioCode', {accountType: appFact.category, user_id: appFact.profile.user_id})
        .then(function(result){
          console.log('this is the result', result);
          $scope.code = result.data[0].verificationCode;
        });
    $scope.backToProfile = function(){
      $state.go('index.list.overview'); 
    };   
}]);