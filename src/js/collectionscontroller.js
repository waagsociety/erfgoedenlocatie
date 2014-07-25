// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection

//This controller is responsible for the binding, collections
//Also it communicates changes to the map
//Basically is the controller for the left hand side of the interface
angular.module('elviewer').controller('CollectionsController', ['$scope', '$http', 'Repository',function CollectionsController($scope, $http, Repository)
{
    //bind to the single source of data
    $scope.Repository = Repository;

    $scope.$watch('datasources',
            function(newValue, oldValue)
            {
                performQuery(Repository, $http);
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
                //calls function in ol_marker.js
                updateMarkers(newValue);
            }, 
            true
    );

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
    }
}]);

//make a call to the server
function performQuery(Repository, $http)
{
    //based on config, which is databound to selection of collections
    var query = createQuery();

    //console.log(query);

    var url = 'http://erfgoedenlocatie.cloud.tilaa.com/sparql?query=' + encodeURIComponent(query);
    //var url = 'http://localhost:8890/sparql?query=' + encodeURIComponent(query);

    $http({
        url: url,
        method: "GET",
        headers: {'Content-Type': 'application/ld+json', 'Accept' : 'application/ld+json'}
    }).success(function (data, status, headers, cfg) {

        parseResponse(Repository, data);

    }).error(function (data, status, headers, cfg) {
        console.log(status);
    }); 
}

//transforms the result data into items for databinding
function parseResponse(Repository, data)
{
        //create simplified objects for databinding
        var items = [];
	console.log(data);

        //parse the data
        for (key in data) 
        {
            var graph = data[key];
            for(var obj in graph) 
            {
                var id = graph[obj]['@id'];
                var graphname = graph[obj]['http://purl.org/dc/elements/1.1/isPartOf'][0];
                var iconType = config.datasources[graphname.trim()].icon;
                var geometry = undefined;

                if(graph[obj]['http://www.opengis.net/ont/geosparql#asWKT']) {
                    var wkt = graph[obj]['http://www.opengis.net/ont/geosparql#asWKT'][0]['@value'];

                //TODO: fix this quick hack
                var coords = wkt.slice(6,-1).split(" ");
                geometry = { "type": "Point", "coordinates": [parseFloat(coords[0]) ,parseFloat(coords[1])] };
            }

            var description = undefined;
            if(graph[obj]['http://www.w3.org/2000/01/rdf-schema#label'])
            {
                description = graph[obj]['http://www.w3.org/2000/01/rdf-schema#label'][0]['@value'];
            }

            var thumbnail = undefined;

            if(graph[obj]['http://xmlns.com/foaf/0.1/depiction'])
            {
                thumbnail = graph[obj]['http://xmlns.com/foaf/0.1/depiction'][0];
            }

	    var date = undefined;
            if(graph[obj]['http://purl.org/dc/elements/1.1/date'])
            {
                if(graph[obj]['http://purl.org/dc/elements/1.1/date'][0]['@type'] == 'http://www.w3.org/2001/XMLSchema#date')
                {
					date = graph[obj]['http://purl.org/dc/elements/1.1/date'][0];
				}
            }

            var item = {'id': id, 'geometry' : geometry, 'description' : description, 'thumbnail' : thumbnail, 'icon' : iconType, 'date': date};
            items.push(item);
            }

        }

        Repository.defaultCollection = items;
}

//create a query based on the data sources
function createQuery()
{
    var query = config.prefixes + "\n" + config.construct + ' WHERE {\n';

        var count = 0;

        for(graph in config.datasources)
        {
            var ds = config.datasources[graph];

            if(ds.enabled)
            {
                if(count > 0)
                {
                    query += " UNION \n";
                }
                query +=  "{\n" + ds.sparql + " LIMIT 100 }";
                count++;
            }

        }

        query += "\n}";
        return query;
    }
