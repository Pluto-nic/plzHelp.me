angular.module('app')
  .controller('verificationCtrl', ['$scope', '$state', 'appFact', '$http', function($scope, $state, appFact, $http){
    var getCode = function(){
      $http.post('/getTwilioCode', {accountType: appFact.category, user_id: appFact.profile.user_id})
        .then(function(result){
          console.log(appFact);
          console.log('this is the result', result);
          $scope.code = result.data[0].verificationCode;
        });
      if(!$scope.code){
        setTimeout(getCode, 500);
      }
    }
    getCode();
    $scope.backToProfile = function(){
      $state.go('index.list.overview'); 
    };   
}]);