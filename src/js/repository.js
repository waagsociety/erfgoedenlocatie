//repository service,
//singleton collection shareable between controllers,
//responsible for communication with server.
angular.module('elviewer').service('Repository', ['$http', function($http)
{
        this.defaultCollection = []; 
        this.spatialFilter = [];
        this.selection = [];

		this.performSearch = function(subject)
		{
			var query = this.createQuery(subject);
			this.performQuery(query);
		}
		
		this.defaultQuery = function()
		{
			var query = this.createQuery(undefined);
			console.log("default query: " + query);
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
        this.createQuery = function(subject)
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
				if(subject) 
				{
					query += "subject: " + subject;
				}
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

                //create a unique id that is adressable in the browser            
                var id_parts = id.split("/");
                var cid = id_parts[id_parts.length -2];
                var iid = id_parts[id_parts.length -1];
                var uid = cid + "_" + iid 

                var item = {'id': id,  'uid': uid, 'geometry' : geometry, 'description' : description, 'thumbnail' : thumbnail, 'icon' : iconType, 'date': date};
                items.push(item);
                }

            }

            this.defaultCollection = items;
        }
}]);
