<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
import riverChart from "@/components/chart/riverChart.vue";
import fileCard from "@/components/fileCard/fileCard.vue";
import { nameArray, dayArray, formatName } from "@/services/config/config";
import { commonscroll } from "@/services/util/common";
const props = defineProps<{
  type?: string;
}>();
const { teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const recentList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const days = ref<number>(7);
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);

// onMounted(() => {
//   if (!props.type) {
//     getChartData();
//   }
// });
const getRecentList = async () => {
  let recentRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
    cardType: "",
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (recentRes.msg === "OK") {
    recentList.value = [...recentRes.data];
    total.value = recentRes.total as number;
  }
};
const getChartData = async () => {
  let taskRes = (await api.request.get("project/active", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    days: days.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    [chartData.value, chartName.value] = formatName(taskRes.data);
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      break;
    case "update":
      let updateIndex = _.findIndex(recentList.value, { _key: detail._key });
      if (updateIndex !== -1) {
        recentList.value[updateIndex] = {
          ...recentList.value[updateIndex],
          ...detail,
        };
      }
      break;
    case "delete":
      let delIndex = _.findIndex(recentList.value, { _key: detail._key });
      if (delIndex !== -1) {
        recentList.value.splice(delIndex, 1);
      }
      break;
  }
};
watchEffect(() => {
  getRecentList();
});
watchEffect(() => {
  if (!props.type && teamKey.value) {
    getChartData();
  }
});
</script>
<template>
  <div class="recent">
    <div class="recent-chart" v-if="!type">
      <riverChart
        riverId="recentRiver"
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
        class="recent-chart-select"
      />
    </div>
    <div
      class="recent-box"
      @scroll="
        commonscroll($event, recentList, total, () => {
          page++;
        })
      "
      :style="type ? { height: '100%' } : null"
    >
      <template v-for="(item, index) in recentList" :key="`recent${index}`">
        <fileCard
          :card="item"
          :type="item.type"
          @chooseCard="chooseCard"
          outType="recent"
        />
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.recent {
  width: 100%;
  height: 100%;
  .recent-chart {
    width: 100%;
    height: 300px;
    position: relative;
    z-index: 1;
    .recent-chart-select {
      position: absolute;
      z-index: 2;
      top: 10px;
      right: 10px;
    }
  }
  .recent-box {
    width: 100%;
    height: calc(100% - 300px);
    @include scroll();
    @include p-number(10px, 10px);
  }
}
</style>
<style></style>
