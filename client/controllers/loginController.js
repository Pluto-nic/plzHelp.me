angular.module('app')

.controller('LoginCtrl', ['$scope', '$http', 'auth', 'store', '$location',
function ($scope, $http, auth, store, $location) {
  $scope.login = function () {
    auth.signin({}, function (profile, token) {
      // Success callback
      store.set('profile', profile);
      store.set('token', token);
      //try to find them in the database
        //if not found, send to user settings
      $location.path('/profile');
    }, function () {
      // Error callback
    });
  }
}]);