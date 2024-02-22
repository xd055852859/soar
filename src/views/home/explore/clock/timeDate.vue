<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue";
import dayjs from "dayjs";
// import newCalendar from "../../components/common/newCalendar";
//defineProps,defineEmits

const nowDate = ref<string>("");
const oldDate = ref<string>("");

onMounted(() => {
  // const year = dayjs().year();
  // const month = dayjs().month() + 1;
  // const date = dayjs().date();
  // console.log(newCalendar(2022, 1, 24).lunarYear);
  // nowDate.value = `${dayjs().format(
  //   "YYYY.MM.DD"
  // )} 星期${"日一二三四五六".charAt(dayjs().day())} ${dayjs().format("HH:mm")}`;
  // oldDate.value = `${newCalendar(year, month, date).lunarYear}年 ${
  //   newCalendar(year, month, date).lunarMonth
  // }月${newCalendar(year, month, date).lunarDay}`;
  // setInterval(() => {
  //   nowDate.value = `${dayjs().format(
  //     "YYYY.MM.DD"
  //   )} 星期${"日一二三四五六".charAt(dayjs().day())} ${dayjs().format(
  //     "HH:mm"
  //   )}`;
  // }, 60000);
});
</script>
<template>
  <!-- <div
    class="date dp-center-center"
    :style="{
      color: `rgba(255, 255, 255, ${config.fontOpacity / 100}`,
    }"
  >
    <div>{{ config.showDate ? nowDate : "" }}</div>
    <div>{{ config.showDate ? oldDate : "" }}</div>
  </div> -->
</template>
<style scoped lang="scss">
.date {
  width: 100vw;
  height: 40px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  flex-wrap: wrap;
  position: fixed;
  bottom: 35px;
  left: 0px;
  div {
    width: 100%;
    text-align: center;
    // margin-bottom: 10px;
  }
}
</style>
