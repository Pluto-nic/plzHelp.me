angular
  .module('app', [
    'ui.router', 'auth0', 'angular-jwt', 'angular-storage'
  ])
.config(['$stateProvider', '$urlRouterProvider', 'authProvider',
    function ($stateProvider, $urlRouterProvider, authProvider) {
      //auth0 configuration
      authProvider.init({
        domain: 'plzhelp.auth0.com',
        clientID: 'xWmflzgefqaDNoeY7t1EUGOoMdNEwQKG'
        //callbackURL: 'plzhelp.auth0.com/login/callback'
      });

    $urlRouterProvider.otherwise('/');

    $stateProvider 
        .state('index', {
            url: '/',
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
              //controller: 'ProfileCtrl' //Placeholder
            }
          }
        })
        .state('index.list.post', {
          url: '/settings',
          views: {
            'detail@index': {
              templateUrl: './partials/user-post-project.html',
              //controller: 'PostCtrl' //Placeholder
            }
          }
        })
        .state('index.list.settings', {
          url: '/settings',
          views: {
            'detail@index': {
              templateUrl: './partials/user-profile-settings.html',
              //controller: 'SettingCtrl' //Placeholder
            }
          }
        })
        .state('index.list.history', {
          url: '/history',
          views: {
            'detail@index': {
              templateUrl: './partials/user-profile-booking-history.html',
              //controller: 'HistoryCtrl' //Placeholder
            }
          }
        })
        .state('index.list.cards', {
          url: '/cards',
          views: {
            'detail@index': {
              templateUrl: './partials/user-profile-cards.html',
              //controller: 'CardCtrl' //Placeholder
            }
          }
        })
    }

])
.run(['$rootScope', '$state', '$stateParams', 'auth',
  function ($rootScope, $state, $stateParams, auth) {
    auth.hookEvents();
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $state.go("index.list.overview");
}]);


