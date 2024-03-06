<template>
  <v-app>
    <v-main>
      <EarthBrowserAppBar></EarthBrowserAppBar>
      <EarthBrowser></EarthBrowser>
      <ProjectScroll />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  //
  import EarthBrowserAppBar from "@/components/EarthBrowserAppBar.vue";
  import EarthBrowser from "@/components/EarthBrowser.vue";
  import ProjectScroll from "@/components/ProjectScroll.vue";
</script>
