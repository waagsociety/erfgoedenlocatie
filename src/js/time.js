var theGraph;
var x;
var y;
var xAxis;
var yAxis;
var formatCount = d3.format(",.0f");

function getKeys(obj, filter) {
    var name,
        result = [];

    for (name in obj) {
        if ((!filter || filter.test(name)) && obj.hasOwnProperty(name)) {
            result[result.length] = name;
        }
    }
    return result;
}

function keysrt(key,desc) {
  return function(a,b){
   return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
  }
}

function initGraph()
{	
	width = 600;
	height = 70;
	
	x = d3.scale.ordinal().rangeRoundBands([0, width], 1);

	y = d3.scale.linear().range([height, 0]);

	xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(10)
		.tickFormat(d3.time.format("%Y"));

	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(1);
	
	var margin = {top: 8, right: 5, bottom: 50, left: 5};
	theGraph = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", 
			"translate(" + margin.left + "," + margin.top + ")");
		  
	// var margin = {top: 5, right: 5, bottom: 5, left: 5};
	// theGraph = d3.select("#chart")
	    // .append("svg")
		// .attr("width", width)
		// .attr("height", height)
	    // .append("g")
		// //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	theGraph.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
	  .selectAll("text")
	  .style("text-anchor", "middle")
	  // .attr("dx", "-.8em")
      // .attr("dy", "-.55em")
      // .attr("transform", "rotate(-90)" );

    // theGraph.append("g")
      // .attr("class", "y axis")
      // .call(yAxis);
}

function updateTime(collection)
{		
	if(theGraph == undefined){return;};
	
	var timeSeries = {};
	formatDate = d3.time.format("%Y-%m-%d+%H:%M");

	var lustrums = {1940: 0, 1945: 0, 1950: 0, 1955: 0, 1960: 0, 1965: 0, 1970: 0, 1975: 0, 1980: 0, 1985: 0, 1990: 0, 1995: 0, 2000: 0, 2005: 0, 2010: 0, 2015: 0};
	
	for (item in collection)
	{

		if (formatDate.parse(collection[item].date))
		{
			fullYear = formatDate.parse(collection[item].date).getFullYear()
			if (fullYear > 0)
			{
				var index = Math.floor(((fullYear - 1940) / 5));
				var lustrumKey = 1940 + (index * 5);
				
				if(lustrumKey in lustrums)
				{
					lustrums[lustrumKey] += 1;
				}
				else
				{
					console.log("lustrum not found: " + fullYear + " " + lustrumKey);
				}
			}
		}		
	}
	keys = getKeys(lustrums);
	var data = new Array();
	for (key in keys)
	{
		data.push({'jaar': keys[key], 'aantal': lustrums[keys[key]]})
	}
	data = data.sort(keysrt('jaar'));	
	
	var parseDate = d3.time.format("%Y").parse;
	data.forEach(function(d) {
        d.jaar = parseDate(d.jaar);		
        d.aantal = +d.aantal;
    });
		
	x.domain(data.map(function(d) { return d.jaar; }));
    y.domain([0, d3.max(data, function(d) { return d.aantal; })]);

	theGraph.selectAll("g").remove();
	var bar = theGraph.selectAll(".bar")
		.data(data)
		.remove()
		.enter().append("g")
		.attr("class", "bar")
		.attr("transform", function(d) { return "translate(" + x(d.jaar) + "," + y(d.aantal) + ")"; });
		
	bar.append("rect")
		.attr("x", 1)
		.attr("width", 25)
		.attr("height", function(d) { return height - y(d.aantal); });

	bar.append("text")
		.attr("dy", ".75em")
		.attr("y", 6)
		.attr("x", x(data[0].jaar) / 2)
		//.attr("text-anchor", "middle")
		//.text(function(d) { return formatCount(d.aantal); });
	
	
	
	theGraph.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
	
	// theGraph.selectAll(".bar")
		 // .data(data)
		 // .enter().append("rect")
		 // .attr("class", "bar")
		 // .attr("x", function(d) { return x(d.jaar); })
		 // .attr("width", x.rangeBand())
		 // .attr("y", function(d) { return x(d.aantal); })
		 // .attr("height", function(d) { return height - y(d.aantal); });
		 // .attr('y', function(d) { return height - margin.top - margin.bottom - (height - margin.top - margin.bottom - y(d.total)) })
		 // .attr('width', 10)
		 // .attr('height', function(d) { return height - margin.top - margin.bottom - y(d.total) });

}