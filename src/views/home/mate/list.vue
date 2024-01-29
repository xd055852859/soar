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
  <div class="mate-box">
    <div
      class="mate-box-item"
      v-for="(item, index) in mateList"
      :key="`mate${index}`"
      @click="$router.push(`/home/mate/detail/${item._key}`)"
    >
      <div class="mate-box-avatar">
        <div text-color="white" class="mate-item-avatar">
          <img
            :src="
              item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
            "
          />
        </div>
      </div>
      <div class="mate-item-name">
        {{ item.userName }}
      </div>

      <div class="mate-item-chart">
        <riverChart
          :riverId="`mate${item._key}River`"
          :chartData="item.chartData"
          :chartName="item.chartName"
          type="simple"
          v-if="item.chartData"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mate-box {
  width: 100%;
  height: calc(100% - 60px);
  align-content: flex-start;
  @include scroll();
  @include p-number(10px, 25px);
  @include flex(flex-start, flex-start, null);
  .mate-box-item {
    width: 302px;
    // height: 328px;
    background: #ffffff;
    border-radius: 14px;
    margin-right: 60px;
    @include p-number(30px,0px);
    @include scroll();
    .mate-box-avatar {
      width: 100%;
      height: 198px;
      @include flex(center, center, null);
      .mate-item-avatar {
        width: 198px;
        height: 198px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .mate-item-name {
      width: 100%;
      height:28px;
      font-size: 20px;
      text-align: center;
      color: #161616;
      line-height: 28px;
      margin: 28px 0px;
    }
    .mate-item-chart {
      width: 100%;
      height:40px;
    }
  }
}
</style>
<style></style>
