<script setup lang="ts">
import riverChart from "@/components/chart/riverChart.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { dayArray, formatName } from "@/services/config/config";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);
// const getMateChart = async () => {
//   let detailRes = (await api.request.get("teamMate/active", {
//     teamKey: spaceKey.value,
//     projectKey: mateTeamKey.value,
//     mateKey: mateKey.value,
//     days: days.value,
//   })) as ResultProps;
//   if (detailRes.msg === "OK") {
//     [chartData.value, chartName.value] = formatName(detailRes.data);
//   }
// };
</script>
<template>
  <div>
    <riverChart
      riverId="mateRiver"
      :chartData="chartData"
      :chartName="chartName"
      v-if="chartData"
    />
    <!--    <q-select-->
    <!--        style="width: 70px"-->
    <!--        v-model="days"-->
    <!--        :options="dayArray"-->
    <!--        dense-->
    <!--        emit-value-->
    <!--        map-options-->
    <!--        class="mate-chart-select"-->
    <!--    />-->
  </div>
</template>

<style lang="scss" scoped></style>
