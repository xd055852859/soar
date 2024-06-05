<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { spaceKey, privateTeamKey } = storeToRefs(appStore.spaceStore);
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const dayjs: any = inject("dayjs");
const props = defineProps<{
  mateKey: string;
}>();
const monthTitleArr = ref<any>([]);
const monthData = ref<any>([]);
const begTime = ref<number>(0);
const logDate = ref<string>("");
const logList = ref<any>([]);
const monthArr = ["日", "一", "二", "三", "四", "五", "六"];
const getPayNumData = async () => {
  let monthStartTime = dayjs()
    .subtract(3, "month")
    .startOf("month")
    .startOf("day")
    .valueOf();
  let monthEndTime = dayjs()
    .add(1, "month")
    .startOf("month")
    .startOf("day")
    .valueOf();
  let monthObj = {
    begTime: monthStartTime,
    endTime: monthEndTime,
  };
  let monthTimeArr = [
    {
      begTime: dayjs()
        .subtract(2, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
      endTime: dayjs()
        .subtract(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
    },
    {
      begTime: dayjs()
        .subtract(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
      endTime: dayjs().startOf("month").startOf("day").valueOf(),
    },
    {
      begTime: dayjs().startOf("month").startOf("day").valueOf(),
      endTime: dayjs()
        .add(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
    },
  ];
  let monthRes: any = (await await api.request.get("teamMate/payNum", {
    teamKey: spaceKey.value,
    mateKey: mateKey.value,
    ...monthObj,
  })) as ResultProps;
  if (monthRes.msg === "OK") {
    // monthRes.result.forEach((item: any) => {
    //   newMonthData.push({
    //     weekDay: moment(item.begTime).format('dddd'),
    //     value: item.value * 10,
    //   });
    // });
    monthTimeArr.forEach((monthItem, monthIndex) => {
      monthData.value[monthIndex] = [];
      monthRes.data.forEach((item: any, index) => {
        item.begTime = dayjs(item.time).startOf("day").valueOf();
        if (
          item.begTime >= monthItem.begTime &&
          item.begTime < monthItem.endTime
        ) {
          monthData.value[monthIndex].push({
            color: getColor(item.score),
            date: dayjs(item.begTime).date(),
            score: item.score,
            begTime: item.begTime,
          });
        }
      });
    });
    monthData.value.forEach((item: any, index: number) => {
      if (item[0]?.begTime) {
        monthTitleArr.value.unshift(dayjs(item[0].begTime).format("M") + "月");
        item = formatMonth(item[0].begTime, item);
      } else {
        monthTitleArr.value.unshift("");
      }
    });
    monthData.value.reverse();
    begTime.value = dayjs().startOf("day").valueOf();
    logDate.value = dayjs().format("M") + "月" + dayjs().format("D") + "日";
  }
};
const getColor = (num: number) => {
  let color = "";
  if (num <= 0) {
    color = "#D8E2FF";
  } else if (num < 10 && num > 0) {
    color = "#D1DEFF";
  } else if (num < 20 && num >= 10) {
    color = "#94B2FF";
  } else if (num < 30 && num >= 20) {
    color = "#7FA3FF";
  } else if (num < 40 && num >= 30) {
    color = "#376EF8";
  } else if (num < 50 && num >= 40) {
    color = "#476FD5";
  } else if (num < 60 && num >= 50) {
    color = "#1F4CC1";
  } else if (num >= 60) {
    color = "#214EC1";
  }
  return color;
};
const formatMonth = (time: number, arr: any) => {
  let weekIndex = dayjs(time).day();
  for (let i = weekIndex - 1; i > -1; i--) {
    arr.unshift({
      color: "#FFFFFF",
      date: "",
      value: "",
    });
  }
  return arr;
};
watch(
  mateKey,
  (newKey) => {
    if (newKey) {
      getPayNumData();
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="mateScore">
    <div class="mateScore-left">
      <div class="full-width dp--center" style="height: 40px">
        <div
          v-for="(monthItem, monthIndex) in monthArr"
          class="mateScore-left-item-title mateScore-left-item"
          :key="`month${monthIndex}`"
        >
          {{ monthItem }}
        </div>
      </div>
      <div class="mateScore-left-box">
        <template v-for="(item, index) in monthData" :key="`monthData${index}`">
          <div
            class="mateScore-left-title"
            @click=""
            v-if="monthTitleArr[index]"
          >
            {{ monthTitleArr[index] }}
          </div>
          <div class="mateScore-left-info">
            <div
              v-for="(dayItem, dayIndex) in item"
              class="mateScore-left-item"
              :key="`vitality${dayIndex}`"
            >
              <div
                class="mateScore-left-item-day"
                :style="{
                  // backgroundColor: dayItem.color,
                  backgroundColor: dayItem.date
                    ? 'rgba(233, 233, 233, 0.5)'
                    : 'rgba(255, 255, 255, 0)',
                  border: dayItem.date ? '1px solid #fff' : 0,
                }"
                @click=""
              >
                <!-- getTargetLog(dayItem.begTime); -->
                <div
                  class="mateScore-changeNum-box"
                  :style="{
                    color: dayItem.score > 0 ? '#fff' : '#FB7552',
                  }"
                  v-if="dayItem.score"
                >
                  {{ dayItem.score }}
                </div>
                <div
                  class="mateScore-changeNum"
                  :style="{
                    borderColor: `${dayItem.color} transparent transparent transparent`,
                  }"
                  v-if="dayItem.score"
                ></div>

                {{ dayItem.date }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="mateScore-right"></div>
  </div>
</template>

<style lang="scss" scoped>
.mateScore {
  width: 100%;
  height: calc(100% - 50px);
  @include flex(space-between, center, null);
  .mateScore-left {
    width: 320px;
    height: 100%;

    .mateScore-left-box {
      width: 100%;
      height: calc(100% - 40px);
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      -webkit-overflow-scrolling: touch;
      @include scroll();
    }

    .mateScore-left-item {
      width: calc(96% / 7);
      cursor: pointer;
    }

    .mateScore-left-item-day {
      height: 36px;
      box-sizing: border-box;
      text-align: center;
      line-height: 36px;
      color: #333;
      margin-left: -1px;
      margin-bottom: -1px;
      position: relative;
      z-index: 1;
      overflow: hidden;
    }

    .mateScore-left-info {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      position: relative;
      padding-left: 10px;
      box-sizing: border-box;
      margin-bottom: 5px;
    }

    .mateScore-left-title {
      height: 26px;
      line-height: 26px;
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      padding: 0px 10px;
      border-radius: 15px;
      background-color: #1890ff;
      cursor: pointer;
      margin: 10px;
    }

    .mateScore-left-item-title {
      height: 17px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(94, 138, 251, 1);
      line-height: 17px;
      text-align: center;
      border: 1px solid transparent;
      margin-right: 1px;
      margin-bottom: 1px;
    }

    .mateScore-changeNum {
      width: 0;
      height: 0;
      border-width: 20px;
      border-style: solid;
      position: absolute;
      top: 0px;
      right: -20px;
    }

    .mateScore-changeNum-box {
      position: absolute;
      right: 1px;
      top: -12px;
      z-index: 10;
      font-size: 10px;
      transform: scale(0.8);
    }
  }
  .mateScore-right {
    flex: 1;
    height: 100%;
  }
}
</style>
