<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";



</script>
<template>
  <div class="mate">
    <router-view></router-view>
    <!-- <div class="mate-chart">
      <riverChart
        riverId="mateRiver"
        :chartData="chartData"
        :chartName="chartName"
        v-if="chartData"
      />
      <q-select
      style="width: 70px"
        v-model="days"
        :options="dayArray"
        dense
        emit-value
        map-options
        class="mate-chart-select"
      />
    </div> -->
  </div>
</template>
<style scoped lang="scss">
.mate {
  width: 100%;
  height: 100%;
  .mate-chart {
    width: 100%;
    height: 300px;
    position: relative;
    z-index: 1;
    .mate-chart-select {
      position: absolute;
      z-index: 2;
      top: 10px;
      right: 10px;
    }
  }
}
</style>
<style></style>
