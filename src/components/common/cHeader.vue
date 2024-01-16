<script setup lang="ts">
const props = defineProps<{
  title: string;
}>();
</script>
<template>
  <div className="header">
    <div className="header-title single-to-long">
      {{ title }}
      <slot name="subtitle"></slot>
    </div>
    <q-space />
    <slot name="button"></slot>
  </div>
</template>
<style scoped lang="scss">
.header {
  width: 100%;
  height: 65px;
  padding: 0px 15px 0px 25px;
  box-sizing: border-box;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  @include flex(space-between, center, null);
  .header-title {
    max-width: 50%;
    font-size: 20px;
    font-weight: 600;
    color: #000000;
    @include flex(flex-start, center, null);
  }
}
</style>
<style></style>
