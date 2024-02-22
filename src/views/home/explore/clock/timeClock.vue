<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import TimePoint from "./timePoint.vue";
import Timehour from "./timehour.vue";
//defineProps,defineEmits
const { exploreConfig } = storeToRefs(appStore.exploreStore);
</script>
<template>
  <div
    class="time-clock"
    :style="{
      fontWeight: exploreConfig.fontWeight,
      color: `rgba(255, 255, 255, ${exploreConfig.fontOpacity / 100}`,
    }"
  >
    <TimePoint v-if="exploreConfig.clockType === 0" />
    <Timehour v-else />
  </div>
</template>
<style scoped lang="scss">
.time-clock {
  width: 100%;
  height: 60px;
  font-size: 60px;
  @include flex(center, center, null);
}
</style>
<style>
@keyframes show {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
