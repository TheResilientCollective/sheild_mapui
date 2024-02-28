import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'
import path from "path";
import { fileURLToPath, URL } from 'node:url'

const cesiumSource = "node_modules/cesium/Build/Cesium";
// This is the base url for static files that CesiumJS needs to load.
// Set to an empty string to place the files at the site's root path
const cesiumBaseUrl = "cesiumStatic";

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        target: 'esnext'
    },
    define: {
        // Define relative base path in cesium for loading assets
        // https://vitejs.dev/config/shared-options.html#define
        CESIUM_BASE_URL: JSON.stringify(cesiumBaseUrl),
        'process.env': {},
    },
    plugins: [
        Vue({
            template: { transformAssetUrls },
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
        Vuetify(),
        Components(),
        ViteFonts({
            google: {
                families: [{
                    name: 'Roboto',
                    styles: 'wght@100;300;400;500;700;900',
                }],
            },
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory.
        // If you need to add your own static files to your project, use the `public` directory
        // and other options listed here: https://vitejs.dev/guide/assets.html#the-public-directory
        viteStaticCopy({
            targets: [
                { src: `${cesiumSource}/ThirdParty`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Workers`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Assets`, dest: cesiumBaseUrl },
                { src: `${cesiumSource}/Widgets`, dest: cesiumBaseUrl },
            ],
        }),
    ],
    resolve: {
        // alias: {
        //   'primevue/config': path.resolve(__dirname, './components/lib/config/PrimeVue.js')
        // },

        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            // "@": path.resolve(__dirname, "./src"),
        },

        extensions: [
            '.js',
            '.json',
            '.jsx',
            '.mjs',
            '.ts',
            '.tsx',
            '.vue',
        ],
    },
    server: {
        port: 3000,
    },
});
