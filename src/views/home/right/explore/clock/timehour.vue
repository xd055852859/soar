<script setup lang="ts">
import dayjs from "dayjs";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { exploreConfig } = storeToRefs(appStore.exploreStore);
//defineProps,defineEmits
const nowHour = ref<string>("");
const nowMinute = ref<string>("");
onMounted(() => {
  nowHour.value = dayjs().format("HH");
  nowMinute.value = dayjs().format("mm");
  setInterval(() => {
    nowHour.value = dayjs().format("HH");
    nowMinute.value = dayjs().format("mm");
  }, 60000);
});
</script>
<template>
  <div class="time dp-center-center">
    <div>{{ nowHour }}</div>
    <div
      class="point dp-center-center"
      :style="exploreConfig.fontPoint ? { animation: `show 2s infinite` } : {}"
    >
      :
    </div>
    <div>{{ nowMinute }}</div>
  </div>
</template>
<style scoped lang="scss">
.time {
  width: 100%;
  height: 100%;
  text-align: center;
  color: #333;
  div {
    text-align: center;
  }
  .point {
    // display: inline-block;
    vertical-align: center;
    box-sizing: border-box;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
}
</style>
