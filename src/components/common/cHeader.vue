<script setup lang="ts">
import { storeToRefs } from "pinia";
import { OnClickOutside } from "@vueuse/components";
import Icon from "./Icon.vue";
import appStore from "@/store";
import Left from "@/views/home/left/left.vue";
const { closeNum } = storeToRefs(appStore.commonStore);

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
        @click="
          setClose(1);
          leftVisible = false;
        "
        ref="buttonRef"
        v-if="leftVisible"
      >
        <Icon name="a-zhankai2" :size="36" />
      </q-btn>
      <q-btn
        flat
        round
        class="left-arrow-button"
        @mouseenter="
          closeNum === 0 || closeNum === -2 ? (leftVisible = true) : null
        "
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
  <OnClickOutside
    @trigger="leftVisible = false"
    :options="{
      ignore: [buttonRef],
    }"
    v-if="buttonRef"
  >
    <q-dialog v-model="leftVisible" position="left" class="dialog-nomask">
      <q-card
        style="width: 250px; height: 90%"
        @mouseleave="leftVisible = false"
      >
        <!-- <div class="left-dialog"> -->
        <Left />
        <!-- </div> -->
      </q-card>
    </q-dialog>
  </OnClickOutside>
</template>
<style scoped lang="scss">
.header {
  width: 100%;
  height: 65px;
  padding: 0px 10px;
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
.left-dialog {
  width: 250px;
  height: 90vh;
}
</style>
<style></style>
