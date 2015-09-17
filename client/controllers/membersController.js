angular.module('app')
  .controller('MembersCtrl', ['$scope', '$state', 'appFact', '$http',
   function($scope, $state, appFact, $http){
    $scope.Model = {
      categories : ["Client", "Contractor"],
    };
    $scope.servProvJoinProj = function(proj){
      $http.post('/providerAcceptProj', 
        {ServiceProviderUserId: appFact.userData.user_id, id: proj.id});
    };
    if(appFact.category === 'Client'){
      $http.post('/clientAllProj', appFact.profile)
        .then(function(response){
          $scope.filteredProj = {}, $scope.expenditures = 0;
          if(response.data.length){
            response.data.reduce(function(memo, current){
              memo[current.category] ? memo[current.category].push(current) 
                : memo[current.category] = [current];
              return memo;
            }, $scope.filteredProj);
            response.data.reduce(function(memo, current){
              if(!current.isActive){
                $scope.expenditures += current.cost;
              }
              return $scope.expenditures;
            }, $scope.expenditures);
          }
          $scope.accountType = appFact.category
          $scope.projects = response.data;
          appFact.projects = response.data;
          $scope.profile = appFact.profile;
          $scope.userData = appFact.userData;
          $scope.userData.pointsEarned = appFact.userData.pointsEarned || 650;
          $state.go('index.list.overview');
        });




    }
    if(appFact.category === 'ServiceProvider'){
      $http.post('/openProjwCat', {category: appFact.userData.specialty})
        .then(function(projects){
          $scope.availProjects = projects.data;
        });
      $http.post('/providerClosedProj', {servProvID: appFact.profile.user_id})
        .then(function(projects){
          $scope.closedProjects = projects.data;
          $scope.earnings = 0;
          if($scope.closedProjects){
            $scope.closedProjects.reduce(function(memo, current){
              $scope.earnings += current.cost;
              return $scope.earnings;
            }, $scope.earnings);
          }
        });
      $scope.accountType = appFact.category;
      $scope.userData = appFact.userData;
      $scope.profile = appFact.profile;
      $state.go('index.list.overview');
    }

      $scope.IntroOptions = {
        steps:[
        {
            element:'#step1',
            intro: "Snapshot of your recent history."
        },
        {
            element: '#step2',
            intro: "Earn points with every completed project, points can be redeemed for projects ",
            position: 'right'
        },
        {
            element: '.step3',
            intro: 'Recent project history will be shown below here',
            position: 'top'
        },
        {
            element: '#step4',
            intro: "Change profile settings, see project history and send payment for completed projects.",
            position: 'right'
        },
        ],
        showStepNumbers: false,
        exitOnOverlayClick: true,
        exitOnEsc:true,
        nextLabel: '<strong>NEXT!</strong>',
        prevLabel: '<span style="color:green">Previous</span>',
        skipLabel: 'Exit',
        doneLabel: 'Thanks'
    };
    $scope.ShouldAutoStart = false;
}]);