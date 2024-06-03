<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
// import cHeader from "@/components/common/cHeader.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import CEmpty from "@/components/common/cEmpty.vue";
const dayjs: any = inject("dayjs");
const { iframeDetail } = storeToRefs(appStore.commonStore);
</script>
<template>
  <div class="freedom">
    <!-- <cHeader :title="iframeDetail.title" /> -->
    <c-iframe
      id="freeIframe"
      :url="iframeDetail.url"
      :title="iframeDetail.title"
      v-if="iframeDetail?.url"
    />
    <c-empty title="暂无链接" v-else />
  </div>
</template>
<style scoped lang="scss">
.freedom {
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss"></style>
