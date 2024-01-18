<template>
  <i
    :class="`iconfont icon-${name}`"
    :style="{
      fontSize: `${size}px`,
      color: color,
      ...style,
    }"
  ></i>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
// // import { lightColors, darkColors } from "../../utils/color";
// import { useStore } from "../../store";

// const store = useStore();
// const dark = computed(() => store.state.common.dark);
let color = ref("");

const props = defineProps({
  name: String,
  size: Number,
  style: Object,
  color: String,
});

// watchEffect(() => {
//   if (props.color) {
//     color.value = props.color;
//   } else {
//     if (dark.value) {
//       color.value =
//         darkColors.find((item) => item.name === "--el-text-color-primary")
//           ?.value || "";
//     } else {
//       color.value =
//         lightColors.find((item) => item.name === "--el-text-color-primary")
//           ?.value || "";
//     }
//   }
// });
</script>
<style>
.iconfont {
  font-size: inherit;
  color: inherit;
}
</style>
