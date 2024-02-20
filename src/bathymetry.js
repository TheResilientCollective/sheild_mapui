
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
