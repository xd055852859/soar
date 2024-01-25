<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import riverChart from "@/components/chart/riverChart.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { mateList } = storeToRefs(appStore.mateStore);
</script>
<template>
  <cHeader title="队友">
    <template #button>
      <q-btn
        style="width: 120px"
        color="primary"
        label="通讯录"
        @click="$router.push('/home/mate/setting')"
      />
    </template>
  </cHeader>
  <div class="mate-box row q-col-gutter-xl">
    <div
      class="col-3"
      v-for="(item, index) in mateList"
      :key="`mate${index}`"
      @click="$router.push(`/home/mate/detail/${item._key}`)"
    >
      <q-card>
        <q-card-section class="row justify-center">
          <q-avatar text-color="white" size="120px">
            <img
              :src="
                item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
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
</template>
<style scoped lang="scss">
.mate-box {
  width: 100%;
  height: calc(100% - 60px);
  @include scroll();
  @include p-number(10px, 25px);
}
</style>
<style></style>
