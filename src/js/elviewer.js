//define app
angular.module('elviewer',['ngRoute']).config(['$routeProvider',
        function($routeProvider){
             $routeProvider
    .when('/', {
        controller:'CollectionsController',
        templateUrl:'grid.html'
    })
    .when('/item/:itemId', {
        controller:'CollectionsController',
        templateUrl:'detail.html'
    })
    .otherwise({
        redirectTo:'/'
    });
}]);
