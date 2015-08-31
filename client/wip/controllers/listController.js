angular.module('app')
.controller('ListCtrl',  ['$scope', '$stateParams', function($scope, $stateParams){

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
    {logo: "fa-user", title: "Cont-Overview", state: "overview"},
    {logo: "fa-cog", title: "Cont-Settings", state: "settings"},
    {logo: "fa-clock-o", title: "Cont-Project History", state: "history"},
    {logo: "fa-credit-card", title: "Cont-Credit/Debit Cards", state: "cards"},
    {logo: "fa-heart-o", title: "Cont-Projects Wishlist", state: "wishList"},
  ];
  
  $scope.Model.items = $stateParams.category === "Client" ? clientOptions : contractorOption;
  $scope.$on("$destroy", function() {delete $scope.Model.items; })
}]);