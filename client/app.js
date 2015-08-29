//var angular = require('angular');
//require('angular-ui-router');

angular.module('app', ['ui.router'])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

  // if it's a path that's not recognized, reroute to '/'
  $urlRouterProvider.otherwise('/');

  var landingPage = {
    name: 'landingPage',
    url: '/',
    templateUrl: './views/landingPage.html'
    //express turns this url into /client/landingPage/landingPage.html
  };

  var userDashboard = {
    name: 'userDashboard',
    url: '/userDashboard',
    templateUrl: './views/userDashboard.html' 
  }

  var contractorDashboard = {
    name: 'contractorDashboard',
    url: '/bookingHistory',
    templateUrl: './views/user-profile-booking-history.html'
  }

    $stateProvider
      .state(landingPage)
      .state(userDashboard)
      .state(contractorDashboard);
}])