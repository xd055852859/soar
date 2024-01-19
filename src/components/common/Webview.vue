<template>
  <div :style="{ width, height, pointerEvents: readonly ? 'none' : 'unset' }">
    <iframe
      :src="src"
      frameBorder="0"
      allowFullScreen
      :width="width"
      :height="height"
      @load="loading = false"
    />
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  src: string;
  width: string;
  height: string;
  readonly?: boolean;
}>();
const loading = ref(true);
</script>
<style scoped lang="scss"></style>
