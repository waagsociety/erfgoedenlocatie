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
}

function updateMarkers(collection)
{
  //console.log(collection);
  
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
  theView.fitExtent(vector.getSource().getExtent(), theMap.getSize());
  theMap.addInteraction(new ol.interaction.Select({style: iconSelectStyle}));
}

