<script setup lang="ts">

import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import {ref, onMounted} from 'vue'
import {VcViewer} from 'vue-cesium'
import type {VcReadyObject} from 'vue-cesium/es/utils/types'
import * as events from "events";
import {
  Cartesian2,
  Cartesian3,
  defined,
  Cartographic,
  Matrix4,
  Camera,
  Rectangle,
  Math as CesiumMath
} from "@cesium/engine";

import {

  Viewer
} from "@cesium/widgets";


import {NetCDFReader} from "netcdfjs";

const CESIUM_ION_TOKEN= import.meta.env.VITE_APP_CESIUM_ION_TOKEN
const viewerRef = ref<HTMLElement>(null)
const navigation = ref<HTMLElement>(null)
const mapRef = ref<HTMLElement>(null)
const wind = ref<HTMLElement>(null)
const bingRef = ref<HTMLElement>(null)
const terrainRef = ref<HTMLElement>(null)
const cesiumTerrainAsset = 1;
const bing2dRef = ref<HTMLElement>(null)
const bingStreetsAsset = 4;
const bingImageryAsset = 2;
const terrain2dRef = ref<HTMLElement>(null)
const google3dRef = ref<HTMLElement>(null)
const googleAssetId = 2275207;
const sceneMode = 2;

let show = ref(true)
let point = ref({
  pixelSize: 28,
  color: 'red'
})
let fill = false;



let worldPosition =ref()
let distance = ref()
// const options2D = {
//   homeButton: false,
//   fullscreenButton: false,
//   sceneModePicker: false,
//   clockViewModel: clockViewModel,
//   infoBox: false,
//   geocoder: false,
//   sceneMode: Cesium.SceneMode.SCENE2D,
//   navigationHelpButton: false,
//   animation: false,
// };

// wind
let windData = ref(null)
let particleSystemOptions= ref(
    {
      maxParticles: 64 * 64,
      particleHeight: 100.0,
      fadeOpacity: 0.596,
      dropRate: 0.003,
      dropRateBump: 0.01,
      speedFactor: 0.25,
      lineWidth: 1.0
    }
)
let showWind = ref<boolean>(false)
// end wind

let billboard = {
  image: 'https://zouyaoji.top/vue-cesium/favicon.png',
  scale: 0.5
}
onMounted(() => {
  viewerRef.value.creatingPromise.then((readyObj: VcReadyObject) => {
    console.log(readyObj.Cesium) // Cesium namespace object
    console.log(readyObj.viewer) // instanceof Cesium.Viewer
  })

})

const onViewerReady = (readyObj: VcReadyObject) => {
  console.log(readyObj.Cesium) // Cesium namespace object
  console.log(readyObj.viewer) // instanceof Cesium.Viewer
  readyObj.viewer.camera.changed.addEventListener(sync2DView);
// By default, the `camera.changed` event will trigger when the camera has changed by 50%
// To make it more sensitive, we can bring down this sensitivity
  readyObj.viewer.camera.percentageChanged = 0.01;
  var height = 25000;
  var lat = 32.6;
  var lon = -118.2;
  var heading = 90.0;
  var pitch = -10.0;
  // var rectangle = readyObj.viewer.entities.add({
  //   rectangle: {
  //     coordinates: Rectangle.fromDegrees(west, south, east, north),
  //   },
  // });
  //readyObj.viewer.flyTo(rectangle);
  var flyToStart = {
    destination: Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: CesiumMath.toRadians(heading),
      pitch: CesiumMath.toRadians(pitch),
      roll: 0.0,
    },
  }
  readyObj.viewer.camera.flyTo(flyToStart);
  loadNetCDF('https://zouyaoji.top/vue-cesium/SampleData/wind/demo.nc').then(data => {
    console.log(data)
    windData.value = data
    showWind.value = true
  })
}
const onOverviewReady = ({cesiumObject}) => {
  console.log(cesiumObject)
}
const onMapReady = (readyObj: VcReadyObject) => {
  console.log(readyObj.Cesium) // Cesium namespace object
  console.log(readyObj.viewer)


// Since the 2D view follows the 3D view, we disable any
// camera movement on the 2D view
  readyObj.viewer.scene.screenSpaceCameraController.enableRotate = false;
  readyObj.viewer.scene.screenSpaceCameraController.enableTranslate = false;
  readyObj.viewer.scene.screenSpaceCameraController.enableZoom = false;
  readyObj.viewer.scene.screenSpaceCameraController.enableTilt = false;
  readyObj.viewer.scene.screenSpaceCameraController.enableLook = false;
}
function onTileReady({ cesiumObject: tileset, viewer }) {
  // const cartographic = Cartographic.fromCartesian(tileset.boundingSphere.center)
  // const surface = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
  // const offset = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0)
  // const translation = Cartesian3.subtract(offset, surface, new Cartesian3())
  // tileset.modelMatrix = Matrix4.fromTranslation(translation)
  // viewer.zoomTo(tileset)
  console.log('Tiles loaded')
}
function onTileClicked(e) {
  console.log(e)
}
const onEntityEvt = (e: any) => {
  console.log(e)
  if (e.type === 'onmouseover') {
    billboard = {
      image: 'https://zouyaoji.top/vue-cesium/favicon.png',
      scale: 0.6
    }
  } else if (e.type === 'onmouseout') {
    billboard = {
      image: 'https://zouyaoji.top/vue-cesium/favicon.png',
      scale: 0.5
    }
  }
}

function sync2DView() {
  // The center of the view is the point that the 3D camera is focusing on
  const cesiumObject = viewerRef.value.getCesiumObject();
  const cesium2DObject = mapRef.value.getCesiumObject();
  const viewCenter = new Cartesian2(
      Math.floor(cesiumObject.container.clientWidth / 2),
      Math.floor(cesiumObject.container.clientHeight / 2)
  );
  // Given the pixel in the center, get the world position
  const newWorldPosition = cesiumObject.camera.pickEllipsoid(
      viewCenter
  );
  if (defined(newWorldPosition)) {
    // Guard against the case where the center of the screen
    // does not fall on a position on the globe
    worldPosition = newWorldPosition;
  }
  // Get the distance between the world position of the point the camera is focusing on, and the camera's world position
  distance = Cartesian3.distance(
      worldPosition,
      cesiumObject.camera.positionWC
  );
  // Tell the 2D camera to look at the point of focus. The distance controls how zoomed in the 2D view is
  // (try replacing `distance` in the line below with `1e7`. The view will still sync, but will have a constant zoom)
  cesium2DObject.camera.lookAt(
      worldPosition,
      new Cartesian3(0.0, 0.0, distance)
  );
}
const onNavigationEvt =(e) =>{
  console.log(e)
}

async function  loadNetCDF(filePath: string) {
  let _this = this
  return new Promise(function (resolve) {
    var request = new XMLHttpRequest()
    request.open('GET', filePath)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      var arrayToMap = function (array) {
        return array.reduce(function (map, object) {
          map[object.name] = object
          return map
        }, {})
      }
      // var NetCDF = new netcdfjs(request.response)
      var NetCDF = new NetCDFReader(request.response)
      let data = {
        dimensions: {
          lon: 0.0,
          lat: 0.0,
          lev: 0.0
        },
        lon: {},
        lat: {},
        lev: {},
        U: {},
        V: {}
      }
      var dimensions = arrayToMap(NetCDF.dimensions)
      //data.dimensions = {}
      data.dimensions.lon = dimensions['lon'].size
      data.dimensions.lat = dimensions['lat'].size
      data.dimensions.lev = dimensions['lev'].size
      var variables = arrayToMap(NetCDF.variables)
      var uAttributes = arrayToMap(variables['U'].attributes)
      var vAttributes = arrayToMap(variables['V'].attributes)
      data.lon = {}
      data.lon.array = new Float32Array(NetCDF.getDataVariable('lon').flat())
      data.lon.min = Math.min(...data.lon.array)
      data.lon.max = Math.max(...data.lon.array)
      data.lon.delta = data.lon.array[1] - data.lon.array[0]
      data.lat = {}
      data.lat.array = new Float32Array(NetCDF.getDataVariable('lat').flat())
      data.lat.min = Math.min(...data.lat.array)
      data.lat.max = Math.max(...data.lat.array)
      data.lat.delta = data.lat.array[1] - data.lat.array[0]
      data.lev = {}
      data.lev.array = new Float32Array(NetCDF.getDataVariable('lev').flat())
      data.lev.min = Math.min(...data.lev.array)
      data.lev.max = Math.max(...data.lev.array)
      data.U = {}
      data.U.array = new Float32Array(NetCDF.getDataVariable('U').flat())
      data.U.min = uAttributes['min'].value
      data.U.max = uAttributes['max'].value
      data.V = {}
      data.V.array = new Float32Array(NetCDF.getDataVariable('V').flat())
      data.V.min = vAttributes['min'].value
      data.V.max = vAttributes['max'].value
      resolve(data)
    }
    request.send()
  })
}
// Apply our sync function every time the 3D camera view changes
// viewerRef.camera.changed.addEventListener(sync2DView);
// // By default, the `camera.changed` event will trigger when the camera has changed by 50%
// // To make it more sensitive, we can bring down this sensitivity
// viewerRef.camera.percentageChanged = 0.01;
//
// // Since the 2D view follows the 3D view, we disable any
// // camera movement on the 2D view
// mapRef.scene.screenSpaceCameraController.enableRotate = false;
// mapRef.scene.screenSpaceCameraController.enableTranslate = false;
// mapRef.scene.screenSpaceCameraController.enableZoom = false;
// mapRef.scene.screenSpaceCameraController.enableTilt = false;
// mapRef.scene.screenSpaceCameraController.enableLook = false;
// //Sandcastle_End
// }
// ;

</script>

<template>
  <Splitter style="height: 60%" class="mb-5">
    <SplitterPanel class="flex align-items-center justify-content-center" :size="75">
      <vc-viewer ref="viewerRef" @ready="onViewerReady">
        <vc-navigation ref="navigation" :offset="[35, 35]"></vc-navigation>
        <vc-overlay-windmap ref="wind" v-if="showWind" :data="windData" :options="particleSystemOptions"></vc-overlay-windmap>
        <vc-terrain-provider-cesium ref="terrainRef"></vc-terrain-provider-cesium>
        <vc-primitive-tileset
            ref="google3dRef"
            :assetId=googleAssetId
            @ready="onTileReady"
            @click="onTileClicked"
        >
        </vc-primitive-tileset>
        <vc-imagery-provider-ion
            ref="bingRef"
            :assetId=bingImageryAsset
            :accessToken="CESIUM_ION_TOKEN"
        ></vc-imagery-provider-ion>
        <vc-entity>
          <vc-graphics-rectangle :coordinates="[-118, 32, -117, 33]" material="green" :fill="fill" :outline="fill"></vc-graphics-rectangle>
        </vc-entity>
        <vc-overview-map @ready="onOverviewReady" ref="overview" :offset="[5, 5]" v-model="show">
          <vc-layer-imagery :sort-order="10">
            <vc-imagery-provider-bing
                bm-key="AgcbDCAOb9zMfquaT4Z-MdHX4AsHUNvs7xgdHefEA5myMHxZk87NTNgdLbG90IE-"
                map-style="Road"
            ></vc-imagery-provider-bing>
          </vc-layer-imagery>

        </vc-overview-map>
      </vc-viewer>
    </SplitterPanel>
    <SplitterPanel class="flex align-items-center justify-content-center" :size="25">
      <vc-viewer ref="mapRef" @ready="onMapReady"
                 :sceneMode=sceneMode
      >

        <vc-imagery-provider-ion
            ref="bing2dRef"
            :assetId=bingStreetsAsset
            :accessToken="CESIUM_ION_TOKEN"
        ></vc-imagery-provider-ion>
      </vc-viewer>
    </SplitterPanel>
  </Splitter>
</template>

<style scoped>

</style>
