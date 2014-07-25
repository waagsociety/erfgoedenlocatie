angular.module('elviewer').controller('DetailController', ['$scope', '$routeParams', 'Repository',function DetailController($scope, $routeParams, Repository)
{
    //get the uid from the routing
    var itemId = $routeParams.itemId;
    
    //get the actual item from the repository
    var item = Repository.defaultCollection.filter(function(item){
            return item.uid === itemId;
        })[0];

    //get the index in spatial filter
    var index = Repository.spatialSelection.indexOf(item);

    //setup variables for databinding
    $scope.Repository = Repository;
    $scope.itemIndex = index + 1;
    $scope.item = item; 

    //return the uid of the next item
    //unless it is the last
    $scope.next = function()
    {
        var index = $scope.itemIndex - 1;

        if(index >= 0)
        {
            var next = Repository.spatialSelection[index+1];
            return next.uid;
        }
        else
        {
            return $scope.item.uid;
        }
    };

    //return uid of the previous item
    $scope.previous = function()
    {
        var index = $scope.itemIndex - 1;
        var previous = Repository.spatialSelection[index - 1];
        if(previous == undefined)
        {
            return $scope.item.uid;
        }
        return previous.uid;
    };
    
}]);
