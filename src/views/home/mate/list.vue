<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import riverChart from "@/components/chart/riverChart.vue";
import { storeToRefs } from "pinia";
import { signatureArray } from "@/services/config/config";
import appStore from "@/store";
import _ from "lodash";
const { user } = storeToRefs(appStore.authStore);
const { mateList } = storeToRefs(appStore.mateStore);
const signVisible = ref<boolean>(false);

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
      <div class="mate-item-signature">
        <q-btn
          flat
          dense
          rounded
          padding="2px 16px"
          class="createSpace-button full-width"
          :style="{
            backgroundColor: `${
              signatureArray[
                _.findIndex(signatureArray, {
                  label: item.signature ? item.signature : '在岗',
                })
              ].color
            } !important`,
            color: '#fff',
          }"
          :label="
            signatureArray[
              _.findIndex(signatureArray, {
                label: item.signature ? item.signature : '在岗',
              })
            ].label
          "
          @click.stop="item._key === user?._key ? (signVisible = true) : null"
        />
        <!-- <q-menu v-model="signVisible">
          <q-list>
            <q-item
              v-for="(item, index) in signatureArray"
              :key="`signature${index}`"
              clickable
              v-close-popup
              :style="{
                backgroundColor: item.color,
              }"
            >
              <q-item-section class="text-white common-title">
                {{ item.label }}</q-item-section
              ></q-item
            >
          </q-list>
        </q-menu> -->
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
    position: relative;
    z-index: 1;
    @include p-number(30px, 0px);
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
      height: 28px;
      font-size: 20px;
      text-align: center;
      color: #161616;
      line-height: 28px;
      margin: 28px 0px;
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
