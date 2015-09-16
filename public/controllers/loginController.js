angular.module('app')
.controller('LoginCtrl', ['$scope', '$http', 'auth', 'store', '$location', '$state', 'appFact', 
function ($scope, $http, auth, store, $location, $state, appFact) {
  $scope.logout = function(){
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $state.go('land');
  };

  $scope.login = function () {
    auth.signin({}, function (profile, token) {
      // Success callback
      console.log('here');
      store.set('profile', profile);
      store.set('token', token);
      $scope.profile = profile;
      appFact.profile = profile;
      console.log(profile);
      $http.post('/clientInfo', {user_id: profile.user_id})
        .then(function(response){
          if(!response.data){
            $http.post('/serviceProviderInfo', {user_id: profile.user_id})
              .then(function(response){
                if(!response.data){
                  $state.go('accountSetup');
                }
                else{
                  appFact.category = 'ServiceProvider';
                  appFact.userData = response.data;
                  $state.go('index.list.overview');      
                }
              });
          }
          else{
            appFact.category = 'Client';
            appFact.userData = response.data;
            $state.go('index.list.overview');
          }
        });
    }, function () {
    });
  };
}]);