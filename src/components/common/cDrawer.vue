<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    visible: boolean;
    drawerStyle?: any;
    title?: string;
    noMask?: boolean;
    opacityMask?: boolean;
    showClose?: boolean;
    position?: "right" | "standard" | "top" | "bottom" | "left" | undefined;
  }>(),
  { position: "right" }
);
const emits = defineEmits<{
  (e: "close"): void;
}>();
const drawerVisible = ref<boolean>(false);
watch(
  () => props.visible,
  (newVisible) => {
    drawerVisible.value = newVisible;
  },
  { immediate: true }
);
watch(drawerVisible, (newVisible) => {
  if (!newVisible) {
    emits("close");
  }
});
</script>
<template>
  <q-dialog
    v-model="drawerVisible"
    :position="position"
    :class="{ 'drawer-noMask': noMask,'drawer-opacity':opacityMask }"
    class="drawer"
  >
    <q-card :style="{ ...drawerStyle }" class="drawer-box">
      <q-card-section
        v-if="title || showClose"
        class="row items-center q-pb-none drawer-header"
      >
        <div class="text-h6 dp-space-center" v-if="title">
          {{ title }}
        </div>
        <q-space />
        <q-btn
          icon="close"
          color="grey-5"
          flat
          round
          dense
          @click="emits('close')"
          v-if="!showClose"
        />
      </q-card-section>
      <q-card-section
        class="flex q-pa-sm drawer-bottom"
        :style="!title ? { height: '100%' } : null"
      >
        <div class="drawer-container q-px-sm q-pt-sm">
          <slot name="content"></slot>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.drawer-box {
  width: 100%;
  height: 100vh;
  .drawer-header {
    width: 100%;
    height: 45px;
  }
  .drawer-bottom {
    width: 100%;
    height: calc(100% - 45px);
    @include scroll();
    .drawer-container {
      width: 100%;
    }
  }
}
</style>
<style lang="scss">
.drawer {
  .q-dialog__inner {
    padding: 0px;
    > div {
      border-radius: 0px;
    }
  }
  .q-dialog__inner--minimized > div {
    max-height: 100vh;
  }
}

.drawer-noMask {
  .q-dialog__backdrop {
    display: none;
  }
}
</style>
