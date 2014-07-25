// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection
angular.module('elviewer').controller('CollectionsController', ['$scope', '$http', 'Repository',function CollectionsController($scope, $http, Repository)
{
    //bind to the single source of data
    $scope.Repository = Repository;

    $scope.$watch('datasources',
            function(newValue, oldValue)
            {
                performQuery($scope, $http);
            },
            true
            );
    //make config available as scope variable
    $scope.datasources = config.datasources;

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
function performQuery($scope, $http)
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

        parseResponse($scope, data);

    }).error(function (data, status, headers, cfg) {
        console.log(status);
    }); 
}

//transforms the result data into items for databinding
function parseResponse($scope, data)
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

        $scope.Repository.defaultCollection = items;
        $scope.Repository.spatialSelection = items; //we don't have the map yet to calculate spatial filter
        $scope.selection = $scope.Repository.spatialSelection.slice(0,PAGE_SIZE);//randomly picked eight objects for now
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
