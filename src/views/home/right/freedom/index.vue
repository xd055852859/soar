<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
// import cHeader from "@/components/common/cHeader.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { iframeDetail } = storeToRefs(appStore.commonStore);
</script>
<template>
  <div class="freedom">
    <!-- <cHeader :title="iframeDetail.title" /> -->
    <c-iframe :url="iframeDetail.url" :title="iframeDetail.title" />
  </div>
</template>
<style scoped lang="scss">
.freedom {
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss"></style>
