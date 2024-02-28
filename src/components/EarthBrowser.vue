<script setup lang="ts">
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import {ref, onMounted} from 'vue'
import {VcViewer} from 'vue-cesium'
import type {VcReadyObject} from 'vue-cesium/es/utils/types'

import {
  Cartesian2,
  Cartesian3,
  defined,
} from "@cesium/engine";

import {

  Viewer
} from "@cesium/widgets";
import {
  createOsmBuildingsAsync,
  createGooglePhotorealistic3DTileset,
  IonResource,
  GeoJsonDataSource,
  Math
} from "cesium";

const ionToken = import.meta.env.VITE_APP_CESIUM_ION_TOKEN;
const viewerRef = ref<HTMLElement>(null);
const mapRef = ref<HTMLElement>(null);
const sceneMode = 2;
const terrainProvider = ref(null);

let show = ref(true)
let point = ref({
  pixelSize: 28,
  color: 'red'
})
let billboard = {
  image: 'https://zouyaoji.top/vue-cesium/favicon.png',
  scale: 0.5
}
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

onMounted(() => {
  viewerRef.value.creatingPromise.then((readyObj: VcReadyObject) => {
    console.log(readyObj.Cesium) // Cesium namespace object
    console.log(readyObj.viewer) // instanceof Cesium.Viewer
    readyObj.viewer.camera.changed.addEventListener(sync2DView);
// By default, the `camera.changed` event will trigger when the camera has changed by 50%
// To make it more sensitive, we can bring down this sensitivity
    readyObj.viewer.camera.percentageChanged = 0.01;
    createOsmBuildingsAsync().then((buildingTileset) => {
      readyObj.viewer.scene.primitives.add(buildingTileset);
    });
    createGooglePhotorealistic3DTileset().then(
        (tileset) => {
          readyObj.viewer.scene.primitives.add(tileset);
        }
    );

    readyObj.viewer.camera.flyTo({
      destination : Cartesian3.fromDegrees(-117.3, 32.70, 1500),
      orientation : {
        heading : Math.toRadians(90.0),
        pitch : Math.toRadians(-20.0),
      }
    });

  })
})

const onViewerReady = async (readyObj: VcReadyObject) => {
  console.log(readyObj.Cesium) // Cesium namespace object
  console.log(readyObj.viewer) // instanceof Cesium.Viewer


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
  // IonResource.fromAssetId(2418432).then(
  //     (resource) => {
  //       GeoJsonDataSource.load(resource).then(
  //           (dataSource) => {
  //             readyObj.viewer.dataSources.add(dataSource);
  //           }
  //       )
  //     }
  // );

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
      <vc-viewer ref="viewerRef" @ready="onViewerReady"
                 :access-token="ionToken"
      >
        <vc-navigation ref="navigation" :offset="[35, 35]"></vc-navigation>
        <vc-overview-map @ready="onOverviewReady" ref="overview" :offset="[5, 5]" v-model="show">
<!--          <vc-layer-imagery :sort-order="10">-->
<!--            <vc-imagery-provider-bing-->
<!--              bm-key="AgcbDCAOb9zMfquaT4Z-MdHX4AsHUNvs7xgdHefEA5myMHxZk87NTNgdLbG90IE-"-->
<!--              map-style="Road"-->
<!--            ></vc-imagery-provider-bing>-->
<!--          </vc-layer-imagery>-->
          <vc-entity>
            <vc-graphics-rectangle :coordinates="[130, 20, 80, 25]" material="green"></vc-graphics-rectangle>
          </vc-entity>
        </vc-overview-map>
        <vc-terrain-provider-cesium ref="terrainProvider"></vc-terrain-provider-cesium>
<!--        <vc-primitive-tileset-->
<!--            ref="primitive"-->
<!--            url="https://zouyaoji.top/vue-cesium/SampleData/Cesium3DTiles/Tilesets/dayanta/tileset.json"-->
<!--            @ready="onReady"-->
<!--            @click="onClicked"-->
<!--        >-->
<!--        </vc-primitive-tileset>-->
      </vc-viewer>
    </SplitterPanel>
    <SplitterPanel class="flex align-items-center justify-content-center" :size="25">
      <vc-viewer ref="mapRef" @ready="onMapReady"
                 :sceneMode=sceneMode
      ></vc-viewer>
    </SplitterPanel>
  </Splitter>
</template>

<style scoped>

</style>
