<script setup lang="ts">
import { setLoading } from "@/services/util/common";

const props = defineProps<{
  title?: string;
  url: string;
}>();
onMounted(() => {
  setLoading(true);
});
</script>
<template>
  <div
    :style="{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }"
  >
    <!-- `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}` -->
    <iframe
      id="iframe-container"
      class="web-view"
      :title="title"
      :src="url"
      frameBorder="0"
      width="100%"
      height="100%"
      @load="setLoading(false)"
      allow="clipboard-read; clipboard-write;fullscreen"
    ></iframe>
  </div>
</template>
<style scoped lang="scss"></style>
<style></style>
