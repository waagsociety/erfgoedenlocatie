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
  
  iconSelectStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      src: 'icons/windmill-selected.png'
    }))
  });  
  
  var x = (Math.random() * (486521-382261) + 382261);
  var y = (Math.random() * (6753900-6690000) + 6690000);

  theView = new ol.View({center: [x, y], zoom: 11});
   
  theMap = new ol.Map({
    layers: [raster],
    target: 'mapPanel',
    view: theView,
	   });
	console.log('map size: ' + theMap.getSize());
    theMap.on('moveend', onMoveEnd);
	//startExtent = [385000, 6650000, 830000, 7100000]
	//theView.fitExtent(startExtent, theMap.getSize());

    //create an empty selection style
    //we are handling painting selections ourself
    var select = new ol.interaction.Select();

    //subscribe to changes in selection by the map
    select.getFeatures().on('change:length',function(e)
    {
      if(e.target.getArray().length > 0)
      {
	var feature = e.target.item(0);
	//clear selection
	//select.getFeatures().clear();
	//redirect to the feature in question
	window.location.href = "#/item/" + feature.getId();
      }
    });

    theMap.addInteraction(select);
}

//actually works, but was invisible because lots of markers are in the same spot
function highlightMarker(item)
{
  //TODO: use clustering instead
  var layer = theMap.getLayers().item(1);
  var source = layer.getSource();
  var feature = source.getFeatureById(item.uid);
  var coords = feature.getGeometry().getCoordinates();
  

  var features = source.getFeatures();
  //reset each marker style,
  //just highlight the ones in the right coordinate, otherwise it will be hidden
  for (f in features)
  {
    var match = features[f].getGeometry().getCoordinates();
    var icon = undefined;

    //TODO: get this from config
    if(match[0] == coords[0] && match[1] == coords[1])
    {
      if(features[f].getId().startsWith('molens'))
      {
	icon = 'icons/windmill-selected.png';
      }
      else
      {
	icon = 'icons/photo_selected.png';
      }
    }
    else
    {
      if(features[f].getId().startsWith('molens'))
      {
	icon = 'icons/molen.png';	
      }
      else
      {
	icon = 'icons/bbz.png'; 
      }
    }

    features[f].setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
	src: icon 
      }))}));
  }
}

function updateMarkers(collection)
{
  console.log('update markers');
    //when the map is not initialized, we cannot add features
  if(theMap == undefined){return;}
 
  if(theMap.getLayers().getLength() == 2)
  {
    theMap.getLayers().pop();
  }

  var item;
  var feature_set = new Array();
  for(item in collection)
  {
    newFeature = new ol.Feature({name: collection[item].uid, geometry: new ol.geom.Point(collection[item].geometry.coordinates)});

    newFeature.setId(collection[item].uid);

    iconType = collection[item].icon;
    //console.log('icons/' + iconType + '.png');

    newFeature.setStyle(new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
	src: 'icons/' + iconType + '.png'
      }))}));

    newFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    feature_set[item] = newFeature;
  }
     
  var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: feature_set
    })
  });

  theMap.getLayers().push(vector);  
  //console.log('map size ' + theMap.getSize());
  
  //theView.fitExtent(vector.getSource().getExtent(), theMap.getSize());
  
  //console.log(theMap);
}

function onMoveEnd(evt) {
    var map = evt.map;
    var extent = map.getView().calculateExtent(map.getSize());
	extent_wgs84 = ol.proj.transform(extent,'EPSG:3857', 'EPSG:4326');
	var el = document.getElementById('rootContainer');
	var scope = angular.element(el).scope();
	scope.spatialQuery(extent_wgs84);
	scope.updateSpatialFilter(extent_wgs84);
	console.log(extent_wgs84);
	scope.$apply();
}
