<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
defineProps({
  iconName: { type: String, required: true },
  title: { type: String, required: false },
  size: { type: Number, default: 28 },
  padding: { type: Number, default: 6 },
  bubbleMmenu: { type: Boolean, default: false },
});
const emit = defineEmits<{
  (e: "onClick"): void;
}>();

const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit("onClick");
};
</script>
<template>
  <div class="icon-button" @click="handleClick">
    <Icon :name="iconName" :size="size" />
  </div>
</template>
<style scoped>
.icon-button {
  cursor: pointer;
  display: inline-block;
  padding: 0;
  /* background-color: var(--notes-color-gray-3); */
}
</style>
