<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import riverChart from "@/components/chart/riverChart.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Icon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";
const { user } = storeToRefs(appStore.authStore);
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
    <template v-if="mateList.length > 0">
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
        <div class="mate-item-online" v-if="item.online">
          <Icon name="a-diannaozaixian2" :size="14" color="#fff" />
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
    </template>
    <c-empty title="暂无队友" v-else />
  </div>
</template>
<style scoped lang="scss">
.mate-box {
  width: 100%;
  height: calc(100% - 60px);
  align-content: flex-start;
  background-color: #f2f3f6;
  @include scroll();
  @include p-number(10px, 25px);
  @include flex(flex-start, flex-start, wrap);
  .mate-box-item {
    width: 23.5%;
    min-width: 220px;
    // height: 328px;
    background: #ffffff;
    border-radius: 14px;
    margin-right: 2%;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
    @include p-number(20px, 0px);
    // @include scroll();
    .mate-box-avatar {
      width: 100%;
      height: 120px;
      @include flex(center, center, null);
      .mate-item-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    &:nth-child(4n) {
      margin-right: 0px;
    }
    .mate-item-name {
      width: 100%;
      height: 28px;
      font-size: 16px;
      text-align: center;
      color: #161616;
      line-height: 28px;
      margin: 28px 0px;
    }
    .mate-item-online {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: $commonColor;
      @include flex(center, center, null);
      position: absolute;
      z-index: 2;
      top: 110px;
      right: 60px;
    }
    .mate-item-chart {
      width: 100%;
      height: 40px;
    }
    .mate-item-signature {
      position: absolute;
      z-index: 2;
      top: 10px;
      right: 10px;
    }
  }
}
</style>
<style></style>
