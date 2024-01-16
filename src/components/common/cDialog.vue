<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  dialogStyle?: any;
  title?: string;
  showClose?: boolean;
}>();
const emits = defineEmits<{
  (e: "close"): void;
}>();
const dialogVisible = ref<boolean>(false);
watch(
  () => props.visible,
  (newVisible) => {
    dialogVisible.value = newVisible;
  },
  { immediate: true }
);
</script>
<template>
  <q-dialog v-model="dialogVisible">
    <q-card :style="{ ...dialogStyle }">
      <q-card-section
        v-if="title || showClose"
        class="row items-center q-pb-none"
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
      <q-card-section class="flex items-center">
        <slot name="content"></slot>
      </q-card-section>

      <q-card-actions align="right">
        <slot name="footer" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss"></style>
<style></style>
