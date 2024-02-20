import {  Ion, Viewer, createWorldTerrainAsync, createOsmBuildingsAsync, Cartesian3, Math,
  WebMapTileServiceImageryProvider,ImageryLayer,
  JulianDate,TimeIntervalCollection,ClockRange,
  IonResource, GeoJsonDataSource,
  KmlDataSource,
  UrlTemplateImageryProvider, GeographicTilingScheme,
    Terrain,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import * as Cesium from "cesium";

// Your access token can be found at: https://cesium.com/ion/tokens.
// This is the default access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMzRmZjE3Zi0yNmU4LTRiNDYtOTkwYi1lYzc0YTdmNGVlYmQiLCJpZCI6MTg3NzU3LCJpYXQiOjE3MDQzMjMxODl9.b1nQD9UPbxztxxqxwV6Pd5ot0sGBKcnk3nTdRZ12Cho';
const planet_api_key = import.meta.env.VITE_APP_PLANET_API_KEY
// // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
// const viewer = new Viewer('cesiumContainer', {
//   terrain:  Terrain.fromWorldTerrain(),
// });
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(
      2426648,
      { requestVertexNormals: true }
  ),
});

const scene = viewer.scene;
const globe = scene.globe;
const camera = scene.camera;

scene.fog.enabled = false;
globe.showGroundAtmosphere = false;

globe.enableLighting = true;

scene.light = new Cesium.DirectionalLight({
  direction: new Cesium.Cartesian3(1, 0, 0), // Updated every frame
});

// Update the light direction every frame to match the current camera view
const scratchNormal = new Cesium.Cartesian3();
scene.preRender.addEventListener(function (scene, time) {
  const surfaceNormal = globe.ellipsoid.geodeticSurfaceNormal(
      camera.positionWC,
      scratchNormal
  );
  const negativeNormal = Cesium.Cartesian3.negate(
      surfaceNormal,
      surfaceNormal
  );
  scene.light.direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.add(
          negativeNormal,
          camera.rightWC,
          surfaceNormal
      ),
      scene.light.direction
  );
});

globe.maximumScreenSpaceError = 1.0; // Load higher resolution tiles for better seafloor shading

// const viewer = new Viewer('cesiumContainer', {
//   terrainProvider: await createWorldTerrainAsync()
// });
// Add Cesium OSM Buildings, a global 3D buildings layer.
// viewer.scene.primitives.add(await createOsmBuildingsAsync());
createOsmBuildingsAsync().then((buildingTileset) => {
  viewer.scene.primitives.add(buildingTileset);
});

function dataCallback(interval, index) {
  let time;
  if (index === 0) {
    // leading
    time = JulianDate.toIso8601(interval.stop);
  } else {
    time =JulianDate.toIso8601(interval.start);
  }

  return {
    Time: time,
  };
}

const times = TimeIntervalCollection.fromIso8601({
  iso8601: "2015-07-30/2017-06-16/P1D",
  leadingInterval: true,
  trailingInterval: true,
  isStopIncluded: false, // We want stop time to be part of the trailing interval
  dataCallback: dataCallback,
});

const provider = new WebMapTileServiceImageryProvider({
  url:
      "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg",
  layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
  style: "default",
  tileMatrixSetID: "250m",
  maximumLevel: 5,
  format: "image/jpeg",
  clock: viewer.clock,
  times: times,
  credit: "NASA Global Imagery Browse Services for EOSDIS",
});


// const viewer = new Cesium.Viewer("cesiumContainer", {
//   terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(
//       2426648
//   ),
//   timeline: false,
//   animation: false,
// });


// Assuming you have fetched the image URL from Planet's API
// 2470 is tijuana estuary
var sceneIds=["20240213_183142_87_2470"]
var imageUrl = "https://tiles1.planet.com/data/v1/PSScene/20240213_183142_87_2470/{z}/{x}/{y}.png?api_key=" + planet_api_key;

// Create a custom imagery provider
var customImageryProvider = new UrlTemplateImageryProvider({
  url: imageUrl,
  credit: 'Your attribution or credit here', // Optional
// tilingScheme: new GeographicTilingScheme(),
  maximumLevel: 16
});

//https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_2016_05_mosaic/gmap/
// {z}/{x}/{y}.png?api_key={key}
var gmMonth = "01"
var gmYear = 2024

var gmImageUrl = `https://tiles.planet.com/basemaps/v1/planet-tiles/global_monthly_${gmYear}_${gmMonth}_mosaic/gmap/{z}/{x}/{y}.png?api_key=`+ planet_api_key;

// Create a custom imagery provider
var gloablMonthyImageryProvider = new UrlTemplateImageryProvider({
  url: gmImageUrl,
  credit: 'planet', // Optional
// tilingScheme: new GeographicTilingScheme(),
  maximumLevel: 16
});

const layer = new ImageryLayer(provider);

 const resource = await IonResource.fromAssetId(2418432);
 const dataSource = await GeoJsonDataSource.load(resource);

// WMTS Service

const ndviWTimes = Cesium.TimeIntervalCollection.fromIso8601({
  iso8601: '2020-01-30/2024-01-31/P1D',
  dataCallback: function dataCallback(interval, index) {
    return {
      Time: Cesium.JulianDate.toIso8601(interval.start)
    };
  }
});

// https://api.planet.com/basemaps/v1/mosaics/{mosaic-id}/wmts?api_key={api-key}
// ?proc=ndwi
// const mosaic_id="latest"
//
// const ndviUrl= `https://api.planet.com/basemaps/v1/series/${mosaic_id}/wmts?api_key=${planet_api_key}&proc=ndwi`
// const ndviWTWeather = new Cesium.WebMapTileServiceImageryProvider({
//   url :  ndviUrl,
//   layer : 'ps_weekly_visual_subscription_2022-10-10_2022-10-17_mosaic',
//   style : 'default',
//   tileMatrixSetID : '2km',
//   maximumLevel : 5,
//   format : 'image/png',
//   clock: clock,
//   times: ndviWTimes,
//   credit : new Cesium.Credit('Planet NDVIW')
// });
//viewer.imageryLayers.addImageryProvider(weather);
// const resource = await IonResource.fromAssetId(2418426);
// const dataSource = await KmlDataSource.load(resource, {
//   camera: viewer.scene.camera,
//   canvas: viewer.scene.canvas,
// });

// Make the weather layer semi-transparent to see the underlying geography.
layer.alpha = 0.5;

//viewer.imageryLayers.add(layer);
// Add the imagery layer to the Cesium viewer
//viewer.imageryLayers.addImageryProvider(customImageryProvider);
viewer.imageryLayers.addImageryProvider(gloablMonthyImageryProvider);
//viewer.imageryLayers.addImageryProvider(ndviWTWeather);

viewer.dataSources.add(dataSource);
//await viewer.zoomTo(dataSource);


const start = JulianDate.fromIso8601("2015-07-30");
const stop = JulianDate.fromIso8601("2017-06-17");

viewer.timeline.zoomTo(start, stop);

const clock = viewer.clock;
clock.startTime = start;
clock.stopTime = stop;
clock.currentTime = start;
clock.clockRange = ClockRange.LOOP_STOP;
clock.multiplier = 7200;

// Fly the camera to San Francisco at the given longitude, latitude, and height.
viewer.camera.flyTo({
  destination : Cartesian3.fromDegrees(-117.3, 32.70, 1500),
  orientation : {
    heading : Math.toRadians(90.0),
    pitch : Math.toRadians(-20.0),
  }
});


