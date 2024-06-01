<script setup lang="ts">
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { closeNum, leftVisible } = storeToRefs(appStore.commonStore);

const { setLeftVisible } = appStore.commonStore;

const centerRef = ref<any>(null);
const props = defineProps<{
  title: string;
  backPath?: string;
  type?: string;
  noTitle?: boolean;
  isBackOther?: boolean;
}>();
const emits = defineEmits<{
  (e: "backOther"): void;
}>();
</script>
<template>
  <div class="header" @click="leftVisible ? setLeftVisible(false) : null">
    <div class="header-left">
      <div
        v-if="backPath || isBackOther"
        @click="
          isBackOther
            ? emits('backOther')
            : backPath
              ? $router.push(backPath)
              : null
        "
        class="icon-point q-mr-sm"
      >
        <Icon name="left" :size="32" />
      </div>
      <div
        class="header-title single-to-long"
        :style="{
          paddingLeft: closeNum === 0 || closeNum === -2 ? '40px' : '20px',
        }"
      >
        <template v-if="!noTitle">{{ title }}</template>
      </div>
      <slot name="subtitle"></slot>
    </div>
    <div
      class="header-center"
      ref="centerRef"
      :style="
        centerRef ? { left: `calc(50% - ${centerRef.offsetWidth}px)` } : {}
      "
    >
      <slot name="center"></slot>
    </div>
    <div class="header-right"><slot name="button"></slot></div>
  </div>
  <!-- <OnClickOutside
    @trigger="leftVisible = false"
    :options="{
      ignore: [buttonRef],
    }"
    v-if="buttonRef"
  > -->
  <!--         @mouseleave="leftVisible = false" -->

  <!-- </OnClickOutside> -->
</template>
<style scoped lang="scss">
.header {
  width: 100%;
  height: 50px;
  padding: 0 10px;
  box-sizing: border-box;
  line-height: 75px;
  position: relative;
  z-index: 1;
  @include flex(space-between, center, null);
  .header-left {
    max-width: 50%;
    height: 100%;
    @include flex(flex-start, center, null);
    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #000000;
      box-sizing: border-box;
      @include flex(flex-start, center, null);
    }
  }
  .header-center {
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 2;
    @include flex(flex-start, center, null);
  }
}
</style>
<style></style>
