<script setup lang="ts">
const props = defineProps<{
  title?: string;
  url: string;
}>();
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
    <iframe
      name="iframe-container"
      class="web-view"
      :title="title"
      :src="`${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}`"
      frameBorder="0"
      width="100%"
      height="100%"
      allow="clipboard-read; clipboard-write;fullscreen"
    ></iframe>
  </div>
</template>
<style scoped lang="scss"></style>
<style></style>
