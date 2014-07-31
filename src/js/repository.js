//repository service,
//singleton collection shareable between controllers,
//responsible for communication with server.
angular.module('elviewer').service('Repository', ['$http', function($http)
{
        this.defaultCollection = []; 
        this.spatialFilter = [];
        this.selection = [];

		this.performSearch = function(subject, spatialExtent)
		{
			var query = this.createQuery(subject, spatialExtent);
			this.performQuery(query);
		}
		
		this.defaultQuery = function(spatialExtent)
		{
			var query = this.createQuery(undefined, spatialExtent);
			this.performQuery(query);
		}
		
        //peforms the default query 
        this.performQuery = function(query)
        {   
            //TODO: get from config
            var url = 'http://erfgoedenlocatie.cloud.tilaa.com/sparql?query=' + encodeURIComponent(query);
            var scope = this;

            $http({
                url: url,
                method: "GET",
                headers: {'Content-Type': 'application/ld+json', 'Accept' : 'application/ld+json'}
            }).success(function (data, status, headers, cfg) {

                scope.parseResponse(data);

            }).error(function (data, status, headers, cfg) {
                console.log("http error: " + status);
            }); 
        };

        //creates the default query
        this.createQuery = function(subject, spatialExtent)
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
                        
						if (spatialExtent) 
						{
							//remove 4 lines below to extend bounds beyond Zeeland
							if( spatialExtent[0] < 3.36) { spatialExtent[0] = 3.36 }
							if( spatialExtent[1] < 51.20) { spatialExtent[1] = 51.20 }
							if( spatialExtent[2] > 4.42) { spatialExtent[2] = 4.42 }
							if( spatialExtent[3] > 51.86) { spatialExtent[3]= 51.86 }

							query += "{\n" + ds.sparql.replace(/POLYGON\(\(.*\)\)\"\)\)\)/, "POLYGON((" + spatialExtent[0] + " " + spatialExtent[1] + "," + spatialExtent[0] + " " + spatialExtent[3] + "," + spatialExtent[2] + " " + spatialExtent[3] + "," + spatialExtent[2] + " " + spatialExtent[1] + "," + spatialExtent[0] + " " + spatialExtent[1] + "))\")))");
						}
						else
						{
							query += "{\n" + ds.sparql
						}
						
						if(subject == undefined){
							query += " LIMIT 5000 ";
						}
						query += "}"
                        count++;
                    }

                }
                query += "\n";
				if(subject) 
				{
					query += "FILTER (?subject = \'" + subject + "\')";
				}
				query += "\n} LIMIT 10000";
				console.log(query)
                return query;
        }

        //parse the response for the default query
        this.parseResponse = function(data)
        {
            //create simplified objects for databinding
            var items = [];

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
                        date = graph[obj]['http://purl.org/dc/elements/1.1/date'][0]["@value"];
                    }
                }
				
				var subject = undefined;
                if(graph[obj]['http://purl.org/dc/elements/1.1/subject'])
                {
                    subject = graph[obj]['http://purl.org/dc/elements/1.1/subject'][0]['@value'];
                }

                //create a unique id that is adressable in the browser            
                var id_parts = id.split("/");
                var cid = id_parts[id_parts.length -2];
                var iid = id_parts[id_parts.length -1];
                var uid = cid + "_" + iid 

                var item = {'id': id,  'uid': uid, 'geometry' : geometry, 'description' : description, 'thumbnail' : thumbnail, 'icon' : iconType, 'date': date, 'subject': subject};
                items.push(item);
                }

            }

            this.defaultCollection = items;
        }
}]);
