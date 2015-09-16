angular.module('app')
.controller('ListCtrl',  ['$scope', '$stateParams', 'appFact', function($scope, $stateParams, appFact){
  // Client Side Bar Options
  var clientOptions     = [
    {logo: "fa-user", title: "Overview", state: "overview"},
    {logo: "fa-pencil", title: "Post Project", state: "post"},
    {logo: "fa-cog", title: "Settings", state: "settings"},
    {logo: "fa-clock-o", title: "Project History", state: "history"},
    {logo: "fa-credit-card", title: "Credit/Debit Cards", state: "cards"},
    {logo: "fa-heart-o", title: "Projects Wishlist", state: "wishList"},
  ];

  // Contractor Side Bar Options
  var contractorOption  = [
    {logo: "fa-user", title: "Overview", state: "overview"},
    {logo: "fa-cog", title: "Settings", state: "settings"},
    {logo: "fa-clock-o", title: "Project History", state: "history"},
    {logo: "fa-heart-o", title: "Cont-Projects Wishlist", state: "wishList"},
  ];
  
  $scope.Model.items = appFact.category === "Client" ? clientOptions : contractorOption;
  $scope.$on("$destroy", function() {delete $scope.Model.items; })
}]);