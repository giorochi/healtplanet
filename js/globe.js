
let viewer;
const markers = new Map();

export function initializeGlobe() {
  viewer = new Cesium.Viewer("globe", {
    baseLayer: false,
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),

    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: false,
    navigationHelpButton: false,
    baseLayerPicker: false,
    fullscreenButton: true,
    infoBox: false,
    selectionIndicator: false,

    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    targetFrameRate: 30,
    useBrowserRecommendedResolution: true,
    msaaSamples: 1
  });

  viewer.resolutionScale = 0.8;

  const scene = viewer.scene;

  scene.globe.baseColor =
    Cesium.Color.fromCssColorString("#102b43");

  scene.backgroundColor =
    Cesium.Color.fromCssColorString("#030812");

  scene.globe.showGroundAtmosphere = true;
  scene.globe.enableLighting = false;

  // Texture terrestre globale NASA Blue Marble
const imagery = new Cesium.WebMapServiceImageryProvider({
  url: "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
  layers: "BlueMarble_ShadedRelief_Bathymetry",
  parameters: {
    service: "WMS",
    version: "1.1.1",
    request: "GetMap",
    styles: "",
    format: "image/jpeg",
    transparent: false
  },
  tilingScheme: new Cesium.GeographicTilingScheme(),
  maximumLevel: 7,
  credit: "NASA GIBS"
});

viewer.imageryLayers.addImageryProvider(imagery);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      15, 25, 22000000
    ),
    duration: 0
  });

  viewer.screenSpaceEventHandler.setInputAction(
    event => {
      const picked = scene.pick(event.position);

      if (Cesium.defined(picked) && picked.id?.cityId) {
        window.dispatchEvent(
          new CustomEvent("citySelected", {
            detail: picked.id.cityId
          })
        );
      }
    },
    Cesium.ScreenSpaceEventType.LEFT_CLICK
  );

  return viewer;
}

export function addCityMarker(city) {
  const marker = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      city.coordinates.longitude,
      city.coordinates.latitude
    ),

    cityId: city.id,

    point: {
      pixelSize: 11,
      color: Cesium.Color.fromCssColorString("#49e3c1"),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },

    label: {
      text: city.name,
      font: "14px Arial",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -22),
      distanceDisplayCondition:
        new Cesium.DistanceDisplayCondition(0, 12000000)
    }
  });

  markers.set(city.id, marker);
  viewer.scene.requestRender();
}

export function flyToCity(city) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
      city.coordinates.longitude,
      city.coordinates.latitude,
      1500000
    ),
    duration: 2
  });
}

export function getViewer() {
  return viewer;
}
