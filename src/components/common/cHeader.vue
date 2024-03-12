<script setup lang="ts">
import { storeToRefs } from "pinia";
import { OnClickOutside } from "@vueuse/components";
import Icon from "./Icon.vue";
import appStore from "@/store";
import Left from "@/views/home/left/left.vue";
const { closeNum, showState } = storeToRefs(appStore.commonStore);

const { setClose } = appStore.commonStore;
const leftVisible = ref<boolean>(false);
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
watch(showState, (newState) => {
  if (!newState) {
    leftVisible.value = false;
  }
});
// watch(closeNum, (newNum) => {
//   if (newNum === 1) {
//     showState.value = false;
//   }
// });
</script>
<template>
  <div className="header">
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
    <div v-else class="dp-center-center">
      <q-btn
        flat
        round
        class="left-arrow-button"
        @click.stop="
          setClose(1);
          leftVisible = false;
        "
        ref="buttonRef"
        v-if="leftVisible && showState"
      >
        <Icon name="danchu" :size="15" />
      </q-btn>
      <!-- @mouseenter="showState ? (leftVisible = true) : null" -->
      <q-btn
        flat
        round
        class="left-arrow-button"
        @mouseenter="showState && closeNum !== 1 ? (leftVisible = true) : null"
        v-else
      >
        <Icon name="a-xuanfuhou2" :size="14" />
      </q-btn>
    </div>
    <div className="header-title single-to-long">
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
  <q-dialog v-model="leftVisible" position="left" class="dialog-transparent">
    <q-card class="left-dialog">
      <!-- <div class="left-dialog"> -->
      <Left />
      <!-- </div> -->
    </q-card>
  </q-dialog>
  <!-- </OnClickOutside> -->
</template>
<style scoped lang="scss">
.header {
  width: 100%;
  height: 65px;
  padding: 0px 10px;
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
.left-dialog {
  width: 350px;
  height: 90%;
  @include p-number(25px, 10px);
}
</style>
<style></style>
