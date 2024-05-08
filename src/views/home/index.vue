<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Left from "@/views/home/left/index.vue";
import Icon from "@/components/common/Icon.vue";
import CelebrateAnimate from "@/components/celebrateAnimate/index.vue";
import api from "@/services/api";
import { useQuasar } from "quasar";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";

const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { closeNum, showState, leftVisible } = storeToRefs(appStore.commonStore);
const { exploreConfig, celebrateAnimate } = storeToRefs(appStore.exploreStore);
const { spaceKey, spaceMessageNum, spaceInfo } = storeToRefs(
  appStore.spaceStore,
);
const { getTeamList, getTeamFoldList } = appStore.teamStore;
const { getMateList } = appStore.mateStore;
const { setSpaceKey } = appStore.spaceStore;
const { setClose, setIframeVisible, setShowState, setLeftVisible } =
  appStore.commonStore;
const { setCelebrateAnimate } = appStore.exploreStore;

const leftRef = ref<any>(null);
const clockInText = ref<string>("上班打卡");
const clockTime = ref<string>("");
const clockDate = ref<string>("");
const clockIn = ref<any>(null);
const clockType = ref<number>(-1);

const clockTimer = ref<any>(null);
const clockConfig = ref<any>(null);
const clockVisible = ref<boolean>(false);
const clockMessageVisible = ref<boolean>(false);
const closeMessage = ref<any>(null);
const timer = ref<any>(null);
onUnmounted(() => {
  if (closeMessage.value) {
    closeMessage.value();
  }
  if (clockTimer.value) {
    clearInterval(clockTimer.value);
  }
});

const getTodayCheckIn = async (key) => {
  let checkInRes = (await api.request.get("clockIn/today", {
    teamKey: key,
    returnConfig: true,
  })) as ResultProps;
  if (checkInRes.msg === "OK") {
    if (closeMessage.value) {
      closeMessage.value();
    }
    if (clockTimer.value) {
      clearInterval(clockTimer.value);
    }
    clockVisible.value = false;
    clockMessageVisible.value = false;
    clockIn.value = checkInRes.data;
    //@ts-ignore
    clockConfig.value = checkInRes.config;
    clockTimer.value = setInterval(() => {
      if (clockConfig.value) {
        let startWorkTime = clockConfig.value.startWorkTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${
                clockConfig.value.startWorkTime
              }`,
            ).getTime() - 900000
          : 0;

        let noonBreakTime = clockConfig.value.noonBreakTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${
                clockConfig.value.noonBreakTime
              }`,
            ).getTime() - 900000
          : 100000000000000000;
        let noonEndTime = clockConfig.value.noonEndTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${clockConfig.value.noonEndTime}`,
            ).getTime() - 900000
          : 100000000000000000;
        let endWorkTime = clockConfig.value.endWorkTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${clockConfig.value.endWorkTime}`,
            ).getTime() - 900000
          : 0;
        if (
          dayjs().valueOf() > startWorkTime &&
          dayjs().valueOf() <= startWorkTime + 4500000 &&
          clockConfig.value.openStartWork &&
          (!clockIn.value || !clockIn.value.startWorkTime)
        ) {
          clockType.value = 1;
          clockVisible.value = true;
        } else if (
          dayjs().valueOf() > noonBreakTime &&
          dayjs().valueOf() <= noonBreakTime + 4500000 &&
          clockConfig.value.openNoonBreak &&
          (!clockIn.value || !clockIn.value.noonBreakTime)
        ) {
          clockType.value = 2;
          clockVisible.value = true;
        } else if (
          dayjs().valueOf() > noonEndTime &&
          dayjs().valueOf() <= noonEndTime + 4500000 &&
          clockConfig.value.openNoonEnd &&
          (!clockIn.value || !clockIn.value.noonEndTime)
        ) {
          clockType.value = 3;
          clockVisible.value = true;
        } else if (
          dayjs().valueOf() > endWorkTime &&
          dayjs().valueOf() <= endWorkTime + 4500000 &&
          clockConfig.value.openEndWork &&
          (!clockIn.value || !clockIn.value.endWorkTime)
        ) {
          clockType.value = 4;
          clockVisible.value = true;
        }
      }
    }, 1000);
  }
};
const setTodayCheckIn = async () => {
  let checkInRes = (await api.request.post("clockIn", {
    teamKey: spaceKey.value,
    clockType: clockType.value,
  })) as ResultProps;
  if (checkInRes.msg === "OK") {
    setMessage("success", `${clockInText.value}成功`);
    clockVisible.value = false;
    console.log(clockType.value);
    if (!clockIn.value) {
      clockIn.value = {};
    }
    switch (clockType.value) {
      case 1:
        clockIn.value.startWorkTime = dayjs().valueOf();
        break;
      case 2:
        clockIn.value.noonBreakTime = dayjs().valueOf();
        break;
      case 3:
        clockIn.value.noonEndTime = dayjs().valueOf();
        break;
      case 4:
        clockIn.value.endWorkTime = dayjs().valueOf();
        break;
    }
    console.log(clockIn.value);
    clockType.value = -1;
    // startInterval();
    setCelebrateAnimate(true);
    setTimeout(() => {
      setCelebrateAnimate(false);
    }, 4000);
  }
};

const toggleIcon = (state) => {
  if (state) {
    setClose(0);
  } else {
    setClose(1);
    setShowState(false);
    setLeftVisible(false);
  }
};

watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      setSpaceKey(newKey);
      getTeamList(newKey);
      getTeamFoldList(newKey);
      getMateList(newKey);
    }
  },
  { immediate: true },
);
watch(
  spaceInfo,
  (newInfo) => {
    if (newInfo) {
      getTodayCheckIn(newInfo._key);
    }
  },
  { immediate: true },
);
watch(
  clockVisible,
  (newVisible) => {
    if (newVisible) {
      clockTime.value = dayjs().format("H:mm");
      clockDate.value =
        dayjs().format("M月D日") + " 星期" + "日一二三四五六"[dayjs().day()];
      timer.value = setInterval(() => {
        clockTime.value = dayjs().format("H:mm");
        clockDate.value =
          dayjs().format("M月") + " 星期" + "日一二三四五六"[dayjs().day()];
      }, 60000);
    } else {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    }
  },
  { immediate: true },
);
// watch(clockMessageVisible, (newVisible) => {
//   if (newVisible) {
//     closeMessage.value = $q.notify({
//       progress: true,
//       icon: "warning",
//       color: "warning",
//       message: `即将可以${clockInText.value}`,
//       position: "top-right",
//       multiLine: true,
//       timeout: 86400000,
//       actions: [
//         {
//           label: "确认",
//           color: "yellow",
//           handler: () => {
//             closeMessage.value();
//           },
//         },
//       ],
//     });
//   }
// });
watch(clockType, (newType) => {
  switch (newType) {
    case 1:
      clockInText.value = "上班打卡";
      break;
    case 2:
      clockInText.value = "午休打卡";
      break;
    case 3:
      clockInText.value = "下午打卡";
      break;
    case 4:
      clockInText.value = "下班打卡";
      break;
  }
});
watch(
  closeNum,
  (newNum) => {
    if (newNum === -2 || newNum === 0) {
      setTimeout(() => {
        setShowState(true);
      }, 500);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="home"
    :class="{
      homeLeft: closeNum === -1,
      homeRight: closeNum === -2,
      moveLeft: closeNum === 0,
      moveRight: closeNum === 1,
    }"
  >
    <div class="left" ref="leftRef">
      <Left />
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
    <div
      class="arrow-button"
      :style="
        closeNum === 0 || closeNum === 1
          ? {
              animation: `${
                closeNum === 0 ? 'iconLeft' : 'iconRight'
              } 0.5s forwards`,
            }
          : { left: closeNum === -1 ? '280px' : '0px' }
      "
    >
      <q-btn
        flat
        round
        @click="toggleIcon(true)"
        v-if="closeNum === 1 || closeNum === -1"
      >
        <Icon name="shouqi" :size="15" />
      </q-btn>
      <template v-else>
        <q-btn
          flat
          round
          @click.stop="toggleIcon(false)"
          ref="buttonRef"
          v-if="leftVisible && showState"
        >
          <Icon name="danchu" :size="15" />
        </q-btn>
        <q-btn
          flat
          round
          @mouseover="
            showState && (closeNum === 0 || closeNum === -2)
              ? setLeftVisible(true)
              : null
          "
          v-else
        >
          <Icon name="a-xuanfuhou2" :size="14" />
        </q-btn>
      </template>
    </div>
    <!-- -->
    <div v-if="clockVisible" class="clockIn-box">
      <div class="clockIn-left">
        <div class="clockIn-time">{{ clockTime }}</div>
        <div class="clockIn-date">{{ clockDate }}</div>
      </div>
      <div class="clockIn-button">
        <q-btn flat round size="45px" @click="setTodayCheckIn">
          <div style="font-size: 22px">{{ clockInText }}</div>
        </q-btn>
      </div>
      <div
        class="clockIn-link"
        @click="
          setIframeVisible(true, {
            url: `https://checkin.qingtime.cn/checkIn?token=${token}&teamKey=${spaceKey}`,
            title: '打卡',
          })
        "
      >
        查看工作
        <Icon name="rightArrow" :size="12" class="q-ml-xs" />
      </div>
    </div>
    <CelebrateAnimate v-if="celebrateAnimate" />
    <!-- <q-btn
      color="primary"
      round
      size="25px"
      @click.stop="
        setIframeVisible(true, {
          url: `https://checkin.qingtime.cn/checkIn?token=${token}&teamKey=${spaceKey}`,
          title: '打卡',
        })
      "
  
      ><div class="clockIn-button-box">{{ clockInText }}</div></q-btn
    > -->
    <q-dialog
      v-model="leftVisible"
      position="left"
      class="dialog-transparent"
      style="top: 0 !important"
    >
      <q-card class="left-dialog">
        <!-- <div class="left-dialog"> -->
        <Left />
        <!-- </div> -->
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  // background: #f2f3f6;
  background-color: transparent;
  @include flex(space-between, center, null);

  .left {
    width: 300px;
    height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    background: #fafafb;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: absolute;
    z-index: 2;
    left: 0px;
    top: 0px;
    display: flex;
    flex-direction: column;
    @include p-number(0px, 15px);

    .left-notice-button {
      position: absolute;
      z-index: 2;
      top: 18px;
      right: 30px;
      cursor: pointer;
    }
  }

  .right {
    flex: 1;
    height: 100vh;
    position: relative;

    z-index: 1;
    width: 0;
    // @include p-number(15px, 35px);
  }

  .arrow-button {
    position: fixed;
    z-index: 9999;
    top: 5px;
    left: 280px;
  }
}

.clockIn-box {
  width: 370px;
  height: 220px;
  position: fixed;
  z-index: 9000;
  bottom: 20px;
  right: 20px;
  background-image: url("/clockBg.png");
  background-size: 100% 100%;
  // background-attachment: fixed;
  .clockIn-left {
    width: 180px;
    height: 150px;
    position: absolute;
    z-index: 2;
    left: 0px;
    top: 60px;
    text-align: center;

    .clockIn-time {
      font-size: 50px;
    }

    .clockIn-date {
      font-size: 14px;
    }
  }

  .clockIn-link {
    position: absolute;
    z-index: 2;
    right: 20px;
    top: 15px;
    color: #2a8a51;
    cursor: pointer;
  }

  .clockIn-button {
    width: 140px;
    height: 140px;
    position: absolute;
    z-index: 2;
    right: 20px;
    bottom: 20px;
    background: linear-gradient(132deg, #16ca4c 14%, #18ae44 86%);
    border: 1px solid #33ba69;
    border-radius: 50%;
    box-shadow: 0px 0px 22px 0px #07be51;
    font-size: 18px;
    color: #fff;
    text-align: center;
    line-height: 140px;
  }
}

.left-dialog {
  width: 280px;
  height: 90%;
  @include p-number(25px, 10px);
}

.homeLeft {
  padding-left: 300px;

  .left {
    left: 0;
  }
}

.homeRight {
  padding-left: 0;

  .left {
    left: -300px;
  }
}

.moveLeft {
  animation: toLeft 0.5s forwards;

  .left {
    animation: moveLeft 0.5s forwards;
  }
}

.moveRight {
  animation: toRight 0.5s forwards;

  .left {
    animation: moveRight 0.5s forwards;
  }
}
</style>

<style>
@keyframes moveLeft {
  0% {
    left: 0px;
    /* top: 0px; */
    /* height: 100vh; */
  }

  100% {
    left: -300px;
    /* top: 100%; */
    /* height: 0px; */
  }
}

@keyframes moveRight {
  0% {
    left: -300px;
    /* top: 100%;
    height: 0px; */
  }

  100% {
    left: 0px;
    /* top: 0px;
    height: 100vh; */
  }
}

@keyframes toLeft {
  0% {
    padding-left: 300px;
  }

  100% {
    padding-left: 0px;
  }
}

@keyframes toRight {
  0% {
    padding-left: 0px;
  }

  100% {
    padding-left: 300px;
  }
}

@keyframes iconLeft {
  0% {
    left: 280px;
  }

  100% {
    left: 0px;
  }
}

@keyframes iconRight {
  0% {
    left: 0px;
  }

  100% {
    left: 280px;
  }
}
</style>
