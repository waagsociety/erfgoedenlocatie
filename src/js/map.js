var theMap;
var iconSelectStyle;
var iconStyle; 
var theView;

function initMap() {
console.log("map init");
    var raster = new ol.layer.Tile({
            source: new ol.source.TileJSON({
                url: 'http://api.tiles.mapbox.com/v3/coennengerman.h5b45m5e.jsonp',
                crossOrigin: 'anonymous'
            })
        });

    iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                src: 'icons/windmill-2_1.png'
            }))
        });
  
  iconSelectStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      src: 'icons/windmill-selected.png'
    }))
  });  
  theView = new ol.View({center: [0, 0], zoom: 2});
  theMap = new ol.Map({
    layers: [raster],
    target: 'mapPanel',
    view: theView,
	   });
	console.log('map size: ' + theMap.getSize());
    theMap.on('moveend', onMoveEnd);
	startExtent = [385000, 6650000, 830000, 7100000]
	theView.fitExtent(startExtent, theMap.getSize());
}

function updateMarkers(collection)
{
  //when the map is not initialized, we cannot add features
  if(theMap == undefined){return;}
  var item;
  var feature_set = new Array();
  for(item in collection)
  {
	feature_set[item] = new ol.Feature({
	    geometry: new ol.geom.Point(collection[item].geometry.coordinates)
		})
  }
     
  var feature;
  for (feature in feature_set)
  {
  feature_set[feature].getGeometry().transform('EPSG:4326', 'EPSG:3857');
  feature_set[feature].setStyle(iconStyle)};


  var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: feature_set
    })
  });

  theMap.getLayers().push(vector);  
  console.log('map size ' + theMap.getSize());
  
  //theView.fitExtent(vector.getSource().getExtent(), theMap.getSize());
  theMap.addInteraction(new ol.interaction.Select({style: iconSelectStyle}));
  console.log(theMap);
}

function onMoveEnd(evt) {
    var map = evt.map;
    var extent = map.getView().calculateExtent(map.getSize());
	extent_wgs84 = ol.proj.transform(extent,'EPSG:3857', 'EPSG:4326');
	var el = document.getElementById('resultsPanel');
	var scope = angular.element(el).scope();
	scope.updateSpatialFilter(extent_wgs84);
	scope.$apply();
}


