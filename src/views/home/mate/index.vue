<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import riverChart from "@/components/chart/riverChart.vue";
import api from "@/services/api";
import { formatName, dayArray } from "@/services/config/config";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { mateList } = storeToRefs(appStore.mateStore);
const { getMateList } = appStore.mateStore;
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);

const days = ref<number>(7);

const getChartData = async () => {
  let mateRes = (await api.request.get("teamMate/active/all", {
    teamKey: spaceKey.value,
    days: days.value,
  })) as ResultProps;
  if (mateRes.msg === "OK") {
    [chartData.value, chartName.value] = formatName(mateRes.data);
  }
};
watchEffect(() => {
  getChartData();
});
</script>
<template>
  <div class="mate">
    <cHeader title="队友">
      <template #button>
        <q-btn
          style="width: 120px"
          color="primary"
          label="通讯录"
          @click="$router.push('/home/mateSetting')"
        />
      </template>
    </cHeader>
    <div class="mate-chart">
      <riverChart
        riverId="mateRiver"
        :chartData="chartData"
        :chartName="chartName"
        v-if="chartData"
      />
      <q-select
        style="width: 150px"
        v-model="days"
        :options="dayArray"
        dense
        emit-value
        map-options
        class="mate-chart-select"
      />
    </div>
    <div class="mate-box row q-col-gutter-md">
      <div
        class="col-3"
        v-for="(item, index) in mateList"
        :key="`mate${index}`"
        @click="$router.push(`/mateDetail/${item._key}`)"
      >
        <q-card>
          <q-card-section class="row justify-center">
            <q-avatar text-color="white" size="150px">
              <img
                :src="
                  item.userAvatar
                    ? item.userAvatar
                    : '/common/defaultPerson.png'
                "
              />
            </q-avatar>
          </q-card-section>
          <q-card-section
            class="row justify-center items-center"
            style="height: 40px"
          >
            {{ item.userName }}
          </q-card-section>

          <q-card-section style="height: 100px">
            <riverChart
              :riverId="`mate${item._key}River`"
              :chartData="item.chartData"
              :chartName="item.chartName"
              type="simple"
              v-if="item.chartData"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
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
  .mate-box {
    width: 100%;
    height: calc(100% - 360px);
    @include scroll();
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
