//This controller is responsible for managing the result set
const PAGE_SIZE = 9;

angular.module('elviewer').controller('GridController', ['$scope', 'Repository',function GridController($scope, Repository)
{
    $scope.page = 0;//default page
    
    //bind to the single source of data
    $scope.Repository = Repository;

    $scope.$watch('Repository.spatialSelection', 
            function(newValue, oldValue)
            {
                if(newValue != undefined)
                {
                    Repository.selection = newValue.slice(0,PAGE_SIZE);
                }
            }, 
            true
    );

    //go to next page of results
    $scope.next = function()
    {
        $scope.page++;
        var max = Math.floor(Repository.spatialSelection.length/PAGE_SIZE); 
        if($scope.page >= max)
        {
            $scope.page = max;
        }
        var start_page = $scope.page * PAGE_SIZE;
        var end_page = start_page + PAGE_SIZE;  
        Repository.selection = Repository.spatialSelection.slice(start_page,end_page);//randomly picked eight objects for now
    };

    //go to previous page of results
    $scope.previous = function()
    {
        $scope.page--;
        if($scope.page < 0 )
        {
            $scope.page = 0;
        }
        var start_page = $scope.page * PAGE_SIZE;
        var end_page = start_page + PAGE_SIZE;  
        Repository.selection = Repository.spatialSelection.slice(start_page,end_page);//randomly picked eight objects for now

    };

    //client side paging of results
    $scope.pageString = function()
    {
        var page_start = ($scope.page * PAGE_SIZE) + 1;
        var page_end = page_start + (PAGE_SIZE - 2);
        var total = 0;

        if(Repository.spatialSelection != undefined)
        {
            total = Repository.spatialSelection.length;
        }

        if($scope.selection != undefined)
        {
            page_end = (page_start + 1) + (Repository.selection.length - 2);
        }

        if(page_end > total)
        {
            page_end = total;
        }

        return page_start + " - " + page_end + " of " + total ;
    };
}]);

