angular
  .module('app', [
    'ui.router'
  ])
.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider 
        .state('index', {
            url: '/',
            views: {
              '@' : {
                templateUrl: 'member.html',
                controller: 'MembersCtrl'
              },
              'top@index' : { templateUrl: './partials/header.html',},
              'left@index' : { templateUrl: './partials/left.html',},
              'main@index' : { templateUrl: './partials/main.html',},
            },
          })
        .state('index.list', {
            url: '^/:category',
            templateUrl: './partials/sidebar.html',
            controller: 'ListCtrl'
          })
        .state('index.list.overview', {
          url: '/profile',
          mytitle: "Syed_Overview",
          views: {
            'detail@index': {
              templateUrl: './partials/user-profile.html',
              //controller: 'ProfileCtrl' //Placeholder
            }
          }
        })
        .state('index.list.settings', {
          url: '/settings',
          mytitle: "Syed_Settings",
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
.run(['$rootScope', '$state', '$stateParams',
  function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}])

