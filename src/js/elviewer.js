//define app
angular.module('elviewer',['ngRoute']).config(['$routeProvider',
        function($routeProvider){
             $routeProvider
    .when('/', {
        controller:'GridController',
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

//This factory is responsible for providing a single Repository of data 
//that can be shared across controllers
angular.module('elviewer').factory('Repository', function(){
    return {
        defaultCollection: [], 
        spatialFilter: []
    };
});
