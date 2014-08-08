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
                    $scope.applyTimeFilter();

                    
                }
            }, 
            true
    );
	
    $scope.$watch('Repository.timeSelection', 
            function(newValue, oldValue)
            {
                if(newValue != undefined)
                {
                    Repository.selection = newValue.slice(0,PAGE_SIZE);
                }
            }, 
            true
    );
	
	$scope.$watch(
		'Repository.selectedYears', 
		function(newValue, oldValue){ 
			$scope.applyTimeFilter();
		}, 
		true
	);
	
	
	$scope.applyTimeFilter = function()
	{
		if (Repository.selectedYears.length == 0)
		{
			Repository.timeSelection = Repository.spatialSelection;
		}
		else
		{
			var formatDate = d3.time.format("%Y-%m-%d+%H:%M");
			
			//calculate allowed years
			var allowedYears = [];
			for(key in $scope.Repository.selectedYears)
			{
				var lustrum = parseInt($scope.Repository.selectedYears[key]);			
				for(var y = lustrum; y < lustrum + 5; y++)
				{
					allowedYears.push(y);
				}
			}

			var timeSelection = [];
			
			for (key in Repository.spatialSelection)
			{
				var item = Repository.spatialSelection[key];
				var parsed = formatDate.parse(item.date);
				if(parsed){
					var year = parseInt(parsed.getFullYear());
					if(allowedYears.indexOf(year) > -1)
					{
						timeSelection.push(item);
					}
				}
			};
			
			Repository.timeSelection = timeSelection;
		}
	};

    //go to next page of results
    $scope.next = function()
    {
        $scope.page++;
        var max = Math.floor(Repository.timeSelection.length/PAGE_SIZE); 
        if($scope.page >= max)
        {
            $scope.page = max;
        }
        var start_page = $scope.page * PAGE_SIZE;
        var end_page = start_page + PAGE_SIZE;  
        Repository.selection = Repository.timeSelection.slice(start_page,end_page);//randomly picked eight objects for now
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
        Repository.selection = Repository.timeSelection.slice(start_page,end_page);//randomly picked eight objects for now

    };

    //client side paging of results
    $scope.pageString = function()
    {
        var page_start = ($scope.page * PAGE_SIZE) + 1;

        var page_end = page_start + (PAGE_SIZE - 1);
        

        var total = 0;

        if(Repository.timeSelection != undefined)
        {
            total = Repository.timeSelection.length;
        }

        if($scope.selection != undefined)
        {
            page_end = (page_start + 1) + (Repository.selection.length - 2);
        }

        if(page_end > total)
        {
            page_end = total;
        }

        if(page_start > page_end)
        {
            page_start = page_end;
        }

        return page_start + " - " + page_end + " of " + total ;
    };
}]);

