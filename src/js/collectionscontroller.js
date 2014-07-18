/* responsible for managing collections */
// We hebben:
// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection

//fast helper functio for reading query
function readTextFile(file)
{
     var rawFile = new XMLHttpRequest();
     rawFile.open("GET", file, false);
     rawFile.onreadystatechange = function ()
     {
          if(rawFile.readyState === 4)
          {
               if(rawFile.status === 200 || rawFile.status == 0)
               {
                    var allText = rawFile.responseText;
                    return allText; 
               }
          }
     }
     rawFile.send(null);
}


function CollectionsController($scope, $http)
{
     
      //we want to know when the collection changes 
      //so we can instruct open layers to update the markers.
      $scope.$watch('defaultCollection', 
          function(newValue, oldValue)
          {
               //calls function in ol_marker.js
               updateMarkers(newValue);
          }, 
          true
      );
    
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
               if(item.description != undefined && item.description.length > 0 && item.thumbnail != undefined)
               {
                    items.push(item);
                    console.log(item);
               } 
          }
          
          $scope.defaultCollection = items.splice(8,9);//first eight objects for now
          //this works but data is still very low quality, pictures do not resolve..

     }).error(function (data, status, headers, config) {
          console.log(status);
     });     
}
