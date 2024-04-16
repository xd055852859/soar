<script setup lang="ts">
import cOutLoading from "@/components/common/cOutLoading.vue";
const props = defineProps<{
  title?: string;
  url: string;
}>();
const loading = ref<boolean>(true);
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
    <!-- <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading> -->
    <c-out-loading :visible="loading" />
    <!-- `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}` -->
    <iframe
      id="iframe-container"
      class="web-view"
      :title="title"
      :src="url"
      frameBorder="0"
      width="100%"
      height="100%"
      @load="loading = false"
      allow="clipboard-read; clipboard-write;fullscreen"
    ></iframe>
    <!--       -->
  </div>
</template>
<style scoped lang="scss"></style>
<style></style>
