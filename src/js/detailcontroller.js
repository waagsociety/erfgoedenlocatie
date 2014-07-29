angular.module('elviewer').controller('DetailController', ['$scope', '$routeParams', 'Repository',function DetailController($scope, $routeParams, Repository)
{
    $scope.Repository = Repository;

    
    //get the uid from the routing
    var itemId = $routeParams.itemId;

    //we are here on a refresh 
    if(Repository.defaultCollection.length == 0)
    {
        //so wait until we have something in memory 
        //before we try to find our item
        $scope.$watch('Repository.defaultCollection', function(newValue, oldValue)
        {
            bind(itemId,Repository,$scope);
            
            //if we still haven't found the item we're looking for, just redirect
            if($scope.item == undefined && newValue.length > 0)
            {
                window.location.href = "#/";
            }
        });
    }
    else //we already have some items in memory
    {
        bind(itemId,Repository,$scope);
    }

    //only when we have an actual item update the markers
    $scope.$watch('item', function(newValue, oldValue)
    {
        if(newValue != undefined)
        {
            console.log('item changed: ' + newValue.uid);
            highlightMarker(newValue);
        }
    });

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
            return $scope.itemId;
        }
    };

    //return uid of the previous item
    $scope.previous = function()
    {
        var index = $scope.itemIndex - 1;
        var previous = Repository.spatialSelection[index - 1];
        if(previous == undefined)
        {
            return $scope.itemId;
        }
        return previous.uid;
    };

    //toggle the data panel
    $scope.toggle = function()
    {
        //change the arrow
        var arrowEl = document.getElementById("arrow");
        var bodyEl = document.getElementById("detailsBody");
        var detailsEl = document.getElementById("details");
        if(detailsEl.getAttribute("class") == "caption")
        {
            arrowEl.innerHTML = "&lt;&lt;";
            bodyEl.style.display = "none";
            detailsEl.setAttribute("class","caption-close");
        }
        else
        {
            arrowEl.innerHTML = "&gt;&gt;";
            bodyEl.style.display = "block";
            detailsEl.setAttribute("class","caption");
        }

    };
    
}]);

//find the item for the given id in the repository, 
//and update the scope accordingly
function bind(itemId,Repository, $scope)
{
    //get the actual item from the repository
    var item = Repository.defaultCollection.filter(function(item){
        return item.uid === itemId;
    })[0];
    
    /*
    if(item == undefined)
    {
        window.location.href = "#/";
    }*/

    //get the index in spatial filter
    var index = Repository.spatialSelection.indexOf(item);

    //setup variables for databinding
    $scope.itemIndex = index + 1;
    $scope.itemId = itemId;
    $scope.item = item;
}
