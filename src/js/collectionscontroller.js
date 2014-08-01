// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection

//This controller is responsible for the binding, collections
//Also it communicates changes to the map
//Basically is the controller for the left hand side of the interface
angular.module('elviewer').controller('CollectionsController', ['$scope', 'Repository',function CollectionsController($scope, Repository)
{
    //bind to the single source of data
    $scope.Repository = Repository;
	$scope.subjects = subjects;
	$scope.selectedSubject = [];
    
    $scope.$watch('datasources',
            function(newValue, oldValue)
            {
                Repository.defaultQuery();
            },
            true
            );
	
    //make config available as scope variable
    $scope.datasources = config.datasources;

    //if the default collection changes, we need to update the spatial filter too
    $scope.$watch('Repository.defaultCollection', function(newValue, oldValue)
            {
                if($scope.extent != undefined)
                {
                    $scope.updateSpatialFilter($scope.extent);
                }
                else //we don't have the map yet to calculate spatial filter
                {
                    Repository.spatialSelection = Repository.defaultCollection; 
                }
            },true);

    //we want to know when the collection changes 
    //so we can instruct open layers to update the markers.
    $scope.$watch('Repository.spatialSelection', 
            function(newValue, oldValue)
            {
				updateTime(newValue);
            }, 
            true
    );

	$scope.$watch('Repository.timeSelection', 
            function(newValue, oldValue)
            {
                updateMarkers(newValue);
            }, 
            true
    );
	
	$scope.spatialQuery = function(spatialExtent)
	{
		Repository.defaultQuery(spatialExtent);
	};

	$scope.doSearch = function()
	{
		Repository.performSearch($scope.search_selection);
		console.log($scope.search_selection);
	};
	
    //update the spatial filter
    $scope.updateSpatialFilter = function(extent)
    {
        //so we can remember when we need it
        $scope.extent = extent;

        var filter = new Array();

        for(item in $scope.Repository.defaultCollection)
        {
            var obj = $scope.Repository.defaultCollection[item];
            var inside = ol.extent.containsCoordinate(extent, obj.geometry.coordinates);
            if(inside)
            {
                filter.push(obj);
            }
        }
        Repository.spatialSelection = filter;
    };
}]);

angular.module('elviewer').directive('autoComplete', function($timeout) {
    return function(scope, iElement, iAttrs) {
	        console.log('in autocomplete');
            iElement.autocomplete({
                source: scope[iAttrs.uiItems],
                select: function() {
                    $timeout(function() {
                      iElement.trigger('input');
                    }, 0);
                }
            });
}});
