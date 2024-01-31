<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
</script>
<template>
  <div class="report">
    <!-- <c-header title="汇报" /> -->
    <div class="report-box">
      <div class="report-header"><c-header title="汇报" /></div>
      <c-iframe
        :url="`https://hb.qingtime.cn/?token=${token}&teamKey=${spaceKey}`"
        title="汇报"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.report {
  width: 100%;
  height: 100%;

  .report-box {
    width: 100%;
    // height: calc(100% - 70px);
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    z-index: 1;
    padding: 0px;
    // @include p-number(10px, 25px);
    .report-header {
      position: absolute;
      z-index: 2;
      top: 0px;
      left: 0px;
    }
    .report-iframe {
      width: 100%;
      // height: calc(100% - 70px);
      height: 100%;
    }
  }
}
</style>
<style></style>
