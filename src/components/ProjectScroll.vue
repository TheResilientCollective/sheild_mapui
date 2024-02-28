<script setup lang="ts">
import { ref } from 'vue'
 const   model= ref(null);


</script>

<template>
  <v-slide-group
    v-model="model"
    class="pa-4"
    selected-class="bg-success"
    show-arrows
  >
<v-slide-group-item
  v-for="n in 15"
  :key="n"
  v-slot="{ isSelected, toggle, selectedClass }"
>
  <v-card
    color="grey-lighten-1"
    :class="['ma-4', selectedClass]"
    height="200"
    width="200"
    @click="toggle"
  >
  <div>
    <v-scale-transition>
    <v-icon
      v-if="isSelected"
      color="white"
      size="48"
      icon="mdi-close-circle-outline"
    ></v-icon>
  </v-scale-transition>
  </div>
  </v-card>
</v-slide-group-item>
  </v-slide-group>
</template>

<style scoped>

</style>
