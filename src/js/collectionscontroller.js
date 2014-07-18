/* responsible for managing collections */
// We hebben:
// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection
function CollectionsController($scope, $http)
{
      var PAGE_SIZE = 9;
      $scope.page = 0;//default page

      //we want to know when the collection changes 
      //so we can instruct open layers to update the markers.
      $scope.$watch('spatialSelection', 
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
			console.log('sp update' + $scope);
			var filter = new Array();
			
			for(item in $scope.defaultCollection)
			{
				var obj = $scope.defaultCollection[item];
				var inside = ol.extent.containsCoordinate(extent, obj.geometry.coordinates);
				if(inside)
				{
					filter.push(obj);
				}
			}
			console.log('in filter: ' + filter.length);
			$scope.spatialSelection = filter;
			$scope.selection = $scope.spatialSelection.slice(0,PAGE_SIZE);
	  }

      //go to next page of results
      $scope.next = function()
      {
           $scope.page++;
           var max = Math.floor($scope.spatialSelection.length/PAGE_SIZE); 
           if($scope.page >= max)
           {
               $scope.page = max;
           }
           console.log('page: ' + $scope.page);

           var start_page = $scope.page * PAGE_SIZE;
           var end_page = start_page + PAGE_SIZE;  
           $scope.selection = $scope.spatialSelection.slice(start_page,end_page);//randomly picked eight objects for now
      };

      //go to previous page of results
      $scope.previous = function()
      {
           $scope.page--;
           if($scope.page < 0 )
           {
                $scope.page = 0;
           }
           console.log('page: ' + $scope.page); 
           var start_page = $scope.page * PAGE_SIZE;
           var end_page = start_page + PAGE_SIZE;  
           $scope.selection = $scope.spatialSelection.slice(start_page,end_page);//randomly picked eight objects for now

      };

      //client side paging of results
      $scope.pageString = function()
      {
           var page_start = ($scope.page * PAGE_SIZE) + 1;
           var page_end = page_start + (PAGE_SIZE - 2);
           var total = 0;

           if($scope.spatialSelection != undefined)
           {
                total = $scope.spatialSelection.length;
           }

           if($scope.selection != undefined)
           {
                page_end = (page_start + 1) + ($scope.selection.length - 2);
           }

           return page_start + " - " + page_end + " of " + total ;
      };

    
     //first sparql query
     //TODO: create factory for building queries.
     //TODO: create defines for sparql namespaces.
     var query = 'PREFIX dc:<http://purl.org/dc/elements/1.1/>\n' +
                 'PREFIX foaf:<http://xmlns.com/foaf/0.1/>\n' +
                 'PREFIX foaf-metamatter:<http://xmlns.com/foaf/>\n' +
                 'PREFIX prov:<http://purl.org/net/provenance/ns#>\n' +
                 'PREFIX dcterms:<http://purl.org/dc/terms/>\n' +
                 'PREFIX ogcgs:<http://www.opengis.net/ont/geosparql#>\n' +
                 'PREFIX nco:<http://www.semanticdesktop.org/ontologies/2007/03/22/nco#>\n' +
                 'CONSTRUCT {?entity rdfs:label ?title; dc:isPartOf ?collection; ?imageproperty ?image; ?wktproperty ?wkt} \n' +
                 ' WHERE {\n' +
                         '#Molens\n' +
                         '{ SELECT * WHERE { GRAPH ?collection { ?entity a <http://purl.org/dc/dcmitype/Image>; rdfs:label ?title; ?imageproperty ?image; ?wktproperty ?wkt . }\n' + 
                         'FILTER (?imageproperty = foaf-metamatter:depiction)\n' +
                         'FILTER (?wktproperty = ogcgs:asWKT)\n' +
                           '} LIMIT 25 }\n' +
                 'UNION\n' +
                 '#Beeldbank Zeeland\n' +
                 '{ SELECT DISTINCT * WHERE { GRAPH ?collection { ?entity rdfs:label ?title; ?imageproperty ?image; dcterms:coverage ?coverage . ?coverage ogcgs:hasGeometry ?geometry . ?geometry ?wktproperty ?wkt .\n' +
                    'FILTER (?imageproperty = foaf:depiction) .\n' +
                    'FILTER (?wktproperty = ogcgs:asWKT) . }\n' +
                                    '} LIMIT 100 }\n' +
     '}';

     var url = 'http://erfgoedenlocatie.cloud.tilaa.com/sparql?query=' + encodeURIComponent(query);
     
     $http({
          url: url,
          method: "GET",
          headers: {'Content-Type': 'application/ld+json', 'Accept' : 'application/ld+json'}
     }).success(function (data, status, headers, config) {
          
          //create simplified objects for databinding
          var items = [];

          //parse the data
          var graph = data['@graph'];

          for(var obj in graph) 
          {
               var id = graph[obj]['@id'];
               
               var geometry = undefined;
               if(graph[obj]['http://www.opengis.net/ont/geosparql#asWKT'])
               {
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

               var item = {'id': id, 'geometry' : geometry, 'description' : description, 'thumbnail' : thumbnail};
               //only push items which have all properties defined
               //if(item.description != undefined && item.description.length > 0 && item.thumbnail != undefined)
               //{
                    items.push(item);
               //} 
          }

          $scope.defaultCollection = items;
		  $scope.spatialSelection = items; //we don't have the map yet to calculate spatial filter
          $scope.selection = $scope.spatialSelection.slice(0,PAGE_SIZE);//randomly picked eight objects for now

     }).error(function (data, status, headers, config) {
          console.log(status);
     });     
}
