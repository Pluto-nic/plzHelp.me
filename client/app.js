angular.module('app', ['ui.router', 'auth0', 'angular-jwt', 'angular-storage', 'smoothScroll', 'ui.mask', 'angular-intro'])
.config(['$stateProvider', '$urlRouterProvider', 'authProvider', '$locationProvider',
  function ($stateProvider, $urlRouterProvider, authProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    //auth0 configuration
    authProvider.init({
      domain: 'plzhelp.auth0.com',
      clientID: 'xWmflzgefqaDNoeY7t1EUGOoMdNEwQKG',
      loginState: 'land'
    });

    $urlRouterProvider.otherwise('/');

    $stateProvider 
      .state('land', {
        url: '/',
        views: {
          '@' : {
            templateUrl: 'landing.html',
            controller: 'LoginCtrl'
          },           
        },
      })
      .state('accountSetup', {
        url: '/acctSetup',
        views: {
          '@' : {
            templateUrl: 'accountSetup.html',
            controller: 'acctCtrl'
          },
        },
      })
      .state('verify', {
        url: '/verify',
        views: {
          '@' : {
            templateUrl: 'verificationCode.html',
            controller: 'verificationCtrl'
          },
        },
      })
      .state('index', {
        url: '/index',
        views: {
          '@' : {
            templateUrl: 'member.html',
            controller: 'MembersCtrl'
          },
          'top@index' : { templateUrl: './partials/header.html'},
          'left@index' : { templateUrl: './partials/left.html'},
          'main@index' : { templateUrl: './partials/main.html'},
          'bottom@index': { templateUrl: './partials/footer.html'},
        },
      })
      .state('index.list', {
        url: '^/:category',
        templateUrl: './partials/sidebar.html',
        controller: 'ListCtrl'
      })
      .state('index.list.overview', {
        url: '/profile',
        views: {
          'detail@index': {
            templateUrl: './partials/user-profile.html',
            controller: 'MembersCtrl' //Placeholder
          }
        }
      })
      .state('index.list.post', {
        url: '/post',
        views: {
          'detail@index': {
            templateUrl: './partials/user-post-project.html',
          }
        }
      })
      .state('index.list.settings', {
        url: '/settings',
        views: {
          'detail@index': {
            templateUrl: './partials/user-profile-settings.html',
            controller: 'settingsCtrl' //Placeholder
          }
        }
      })
      .state('index.list.history', {
        url: '/history',
        views: {
          'detail@index': {
            templateUrl: './partials/user-profile-booking-history.html',
            controller: 'historyCtrl' //Placeholder
          }
        }
      })
      .state('index.list.cards', {
        url: '/cards',
        views: {
          'detail@index': {
            templateUrl: './partials/user-profile-cards.html',
            controller: 'cardCtrl' //Placeholder
          }
        }
      })
    }
  ])
  .factory('appFact', function appFactory(){
    return {};
  })
  .run(['$rootScope', '$state', '$stateParams', 'auth',
    function ($rootScope, $state, $stateParams, auth) {
      auth.hookEvents();
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
  }])
  .run(['$rootScope', '$http', 'store', 'appFact', '$state', '$location','$anchorScroll', function($rootScope, $http, store, appFact, $state, $location, $anchorScroll){
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
      if($location.hash()) $anchorScroll();  
    });

    var profile = store.get('profile');
    if(profile){
      $rootScope.profile = profile;
      appFact.profile = profile;
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
    } else {
      $state.go('land');
    }
  }]);


