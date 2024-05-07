<script setup lang="ts">
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { closeNum, leftVisible } = storeToRefs(appStore.commonStore);

const { setLeftVisible } = appStore.commonStore;

const buttonRef = ref<any>(null);
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

// watch(closeNum, (newNum) => {
//   if (newNum === 1) {
//     showState.value = false;
//   }
// });
</script>
<template>
  <div class="header" @click="leftVisible ? setLeftVisible(false) : null">
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
      <q-icon name="navigate_before" size="32px" />
    </div>
    <div
      v-else
      :style="{ width: closeNum === 0 || closeNum === -2 ? '30px' : '20px' }"
    ></div>
    <div class="header-title single-to-long">
      <template v-if="!noTitle">{{ title }}</template>
    </div>
    <slot name="subtitle"></slot>
    <q-space />
    <slot name="button"></slot>
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
  @include flex(space-between, center, null);
  .header-title {
    max-width: 50%;
    font-size: 18px;
    font-weight: 600;
    color: #000000;
    @include flex(flex-start, center, null);
  }
}
</style>
<style></style>
