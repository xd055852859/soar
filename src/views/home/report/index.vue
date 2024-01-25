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
    <c-header title="汇报" />
    <div class="report-box">
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
    height: calc(100% - 70px);
    box-sizing: border-box;
    @include scroll();
    // @include p-number(10px, 25px);
  }
}
</style>
<style></style>
