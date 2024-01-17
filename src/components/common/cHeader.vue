<script setup lang="ts">
const props = defineProps<{
  title: string;
  backPath?: string;
  type?: string;
  noTitle?: boolean;
}>();
</script>
<template>
  <div className="header">
    <div
      v-if="backPath"
      @click="$router.push(backPath)"
      class="icon-point q-mr-sm"
    >
      <q-icon name="navigate_before" size="32px" />
    </div>
    <div className="header-title single-to-long">
      <template v-if="!noTitle">{{ title }}</template>
    </div>
    <slot name="subtitle"></slot>
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
