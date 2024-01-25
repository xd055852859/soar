<script setup lang="ts">

// import api from "@/services/api";
// import { formatName, dayArray } from "@/services/config/config";
// import { ResultProps } from "@/interface/Common";

// const { spaceKey } = storeToRefs(appStore.spaceStore);

// const { getMateList } = appStore.mateStore;
// const chartData = ref<any>(null);
// const chartName = ref<string[]>([]);

// const days = ref<number>(7);

// const getChartData = async () => {
//   let mateRes = (await api.request.get("teamMate/active/all", {
//     teamKey: spaceKey.value,
//     days: days.value,
//   })) as ResultProps;
//   if (mateRes.msg === "OK") {
//     [chartData.value, chartName.value] = formatName(mateRes.data);
//   }
// };
// watchEffect(() => {
//   getChartData();
// });
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
