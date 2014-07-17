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
 
	var raster = new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: 'http://api.tiles.mapbox.com/v3/coennengerman.h5b45m5e.jsonp',
        crossOrigin: 'anonymous'
      })
    });  
  
   var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      src: 'icons/windmill-2_1.png'
    }))
  });
   
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

  var view = new ol.View({});
  var map = new ol.Map({
    layers: [raster, vector],
    target: 'mapPanel',
    view: view
	   });
  view.fitExtent(vector.getSource().getExtent(), map.getSize());
}
