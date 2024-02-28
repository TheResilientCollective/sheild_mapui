/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */


// Plugins
import { registerPlugins } from './plugins'
import * as PrimeVue from 'primevue/config';
import VueCesium from 'vue-cesium'
import enUS from 'vue-cesium/es/locale/lang/en-us'
// Components
import App from './App.vue'
import {createOsmBuildingsAsync} from '@cesium/engine'

import 'primevue/resources/themes/aura-light-green/theme.css'
import 'vue-cesium/dist/index.css'
// Composables
import { createApp } from 'vue'

const app = createApp(App)
app.use(PrimeVue)
app.use(VueCesium, {
 // cesiumPath: 'path/to/Cesium.js',
  accessToken: import.meta.env.VITE_APP_CESIUM_ION_TOKEN,
  locale: enUS // change to English
})
registerPlugins(app)

app.mount('#app')
