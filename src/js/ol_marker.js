function updateMarkers(collection)
{
  console.log(collection);

  var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  var format = new ol.format.WKT();
  var feature = format.readFeature(
      'POINT(5.65823792189898622 53.21705934740188582)');
  feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

  var iconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
      src: 'icons/windmill-2_1.png'
    }))
  });

  feature.setStyle(iconStyle);

  var vector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature]
    })
  });

  var map = new ol.Map({
    layers: [raster, vector],
      target: 'mapPanel',
      view: new ol.View({
        center: [640696, 7002528],
      zoom: 9
      })
  });
}
