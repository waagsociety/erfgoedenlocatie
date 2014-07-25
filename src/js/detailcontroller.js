angular.module('elviewer').controller('DetailController', ['$scope', '$routeParams', 'Repository',function DetailController($scope, $routeParams, Repository)
{
    //get the uid from the routing
    var itemId = $routeParams.itemId;

    //get the actual item from the repository
    var item = Repository.defaultCollection.filter(function(item){
            return item.uid === itemId;
        })[0];
  
    //we are here on a refresh 
    if(item == undefined)
    { 

        //TODO: make a call to virtuoso for this specific unique ID
        console.log('refresh');
        //redirect
        location.href = "#/";
    }

    //get the index in spatial filter
    var index = Repository.spatialSelection.indexOf(item);

    //setup variables for databinding
    $scope.Repository = Repository;
    $scope.itemIndex = index + 1;
    $scope.itemId = itemId;
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
