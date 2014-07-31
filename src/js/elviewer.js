//define app
angular.module('elviewer',['ngRoute']).config(['$routeProvider',
        function($routeProvider){
             $routeProvider
    .when('/', {
        controller:'GridController',
        templateUrl:'grid.html'
    })
    .when('/item/:itemId', {
        controller:'DetailController',
        templateUrl:'detail.html'
    })
    .otherwise({
        redirectTo:'/'
    });
}]);
