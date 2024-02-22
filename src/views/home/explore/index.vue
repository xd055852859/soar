<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cIframe from "@/components/common/cIframe.vue";
import TimeClock from "./clock/timeClock.vue"
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const exploreUrl = ref<string>("");
const exploreTitle = ref<string>("");
const exploreState = ref<boolean>(false);
</script>
<template>
  <div class="explore">
    <cHeader
      :title="exploreState ? exploreTitle : '探索'"
      :isBackOther="exploreState"
      @backOther="exploreState = false"
    />
    <div class="explore-box">
      <TimeClock/>
    </div>
  </div>
</template>
<style scoped lang="scss">
.explore {
  width: 100%;
  height: 100%;
  .explore-box {
    width: 100%;
    height: calc(100% - 70px);
    box-sizing: border-box;
    @include scroll();
    // @include p-number(10px, 25px);
    .explore-box-item {
      height: 100px;
    }
    .explore-content {
      width: 100%;
      height: 65px;
      .explore-content-top {
        width: 100%;
        height: calc(100% - 30px);
        font-size: 16px;
        @include flex(null, flex-start, null);
      }
      .explore-content-bottom {
        width: 100%;
        height: 30px;
        font-size: 14px;
        color: #9e9e9e;
      }
    }
  }
}
</style>
<style></style>
