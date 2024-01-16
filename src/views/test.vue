<script setup lang="ts">
import { useQuasar } from "quasar";
const $q = useQuasar();
const slide = ref<any>("style");
onMounted(() => {
  $q.notify("Some other message");
});
const changeColor = () => {
  $q.dark.set(!$q.dark.isActive);
};
watch(
  () => $q.appVisible,
  (val) => {
    console.log(val ? "App became visible" : "App went in the background");
  }
);
</script>
<template>
  <q-btn color="primary" label="Primary" @click="changeColor" />
  <q-card class="my-card">
    <q-card-section> 444 </q-card-section>
  </q-card>
  <q-carousel
    v-model="slide"
    transition-prev="slide-right"
    transition-next="slide-left"
    animated
    control-color="primary"
    class="rounded-borders"
  >
    <q-carousel-slide name="style" class="column no-wrap flex-center">
      <q-icon name="style" color="primary" size="56px" />
      <div class="q-mt-md text-center">111</div>
    </q-carousel-slide>
    <q-carousel-slide name="tv" class="column no-wrap flex-center">
      <q-icon name="live_tv" color="primary" size="56px" />
      <div class="q-mt-md text-center">222</div>
    </q-carousel-slide>
    <q-carousel-slide name="layers" class="column no-wrap flex-center">
      <q-icon name="layers" color="primary" size="56px" />
      <div class="q-mt-md text-center">333</div>
    </q-carousel-slide>
    <q-carousel-slide name="map" class="column no-wrap flex-center">
      <q-icon name="terrain" color="primary" size="56px" />
      <div class="q-mt-md text-center">444</div>
    </q-carousel-slide>
  </q-carousel>
  <div class="row justify-center">
    <!-- <q-btn-toggle
      glossy
      v-model="slide"
      :options="[
        { label: 1, value: 'style' },
        { label: 2, value: 'tv' },
        { label: 3, value: 'layers' },
        { label: 4, value: 'map' },
      ]"
    /> -->
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>
<style scoped lang="scss"></style>
<style></style>
