<script setup lang="ts">
import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Left from "@/views/home/left/index.vue";
import Icon from "@/components/common/Icon.vue";
import api from "@/services/api";
import { useQuasar } from "quasar";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { closeNum, showState,leftVisible } = storeToRefs(appStore.commonStore);

const { spaceKey, spaceMessageNum } = storeToRefs(appStore.spaceStore);
const { getTeamList, getTeamFoldList } = appStore.teamStore;
const { getMateList } = appStore.mateStore;
const { setSpaceKey } = appStore.spaceStore;
const { setClose, setShowState, setIframeVisible,setLeftVisible } = appStore.commonStore;

const leftRef = ref<any>(null);

const clockInText = ref<string>("上班打卡");
const clockIn = ref<any>(null);
const clockType = ref<number>(-1);

const clockTimer = ref<any>(null);
const clockConfig = ref<any>(null);
const clockVisible = ref<boolean>(false);
const clockMessageVisible = ref<boolean>(false);
const closeMessage = ref<any>(null);
let observer: ResizeObserver | null = null;
onMounted(() => {
  console.log(leftRef.value.offsetLeft);
  if (leftRef.value.offsetLeft === -300 && closeNum.value === -2) {
    setShowState(true);
  } else {
    observer = new ResizeObserver(handleResize);
    observer.observe(leftRef.value);
  }
  window.addEventListener("message", getMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", getMessage);
  if (closeMessage.value) {
    closeMessage.value();
  }
  // 在组件销毁前取消观察
  if (observer) {
    observer.disconnect();
  }
  if (clockTimer.value) {
    clearInterval(clockTimer.value);
  }
});
const handleResize = (entries: any) => {
  for (const entry of entries) {
    const { height } = entry.contentRect;
    if (height === 0 && !showState.value) {
      setShowState(true);
    } else if (showState.value) {
      setShowState(false);
    }
    // 这里可以执行针对宽高变化的操作
  }
};
const getMessage = (e) => {
  if (e.data && !e.data.source) {
    const messageData =
      typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    console.log(messageData);
    switch (messageData.eventName) {
      case "check-in-complete":
        // router.push(`/home/taskBoard`);
        setMessage("success", "打卡成功");
        setIframeVisible(false, null);
        clockVisible.value = false;
        clockMessageVisible.value = false;
        clockType.value = clockType.value + 1;
        closeMessage.value();
        break;
    }
  }
};
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
    if (clockIn.value === null) {
      clockType.value = 0;
    } else if (clockIn.value.noonBreakTime === null) {
      clockType.value = 1;
    } else if (clockIn.value.noonEndTime === null) {
      clockType.value = 2;
    } else if (clockIn.value.endWorkTime === null) {
      clockType.value = 3;
    } else {
      clockType.value = 4;
    }
    clockTimer.value = setInterval(() => {
      if (clockConfig.value) {
        let startWorkTime = clockConfig.value.startWorkTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${
                clockConfig.value.startWorkTime
              }`
            ).getTime() - 900000
          : 0;

        let noonBreakTime = clockConfig.value.noonBreakTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${
                clockConfig.value.noonBreakTime
              }`
            ).getTime() - 900000
          : 100000000000000000;
        let noonEndTime = clockConfig.value.noonEndTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${clockConfig.value.noonEndTime}`
            ).getTime() - 900000
          : 100000000000000000;
        let endWorkTime = clockConfig.value.endWorkTime
          ? new Date(
              `${dayjs().format("YYYY-MM-DD")} ${clockConfig.value.endWorkTime}`
            ).getTime() - 900000
          : 0;
        // console.log(startWorkTime);
        // console.log(noonBreakTime);
        // console.log(noonEndTime);
        // console.log(endWorkTime);
        if (
          (clockType.value === 0 && dayjs().valueOf() > startWorkTime) ||
          (clockType.value === 1 && dayjs().valueOf() > noonBreakTime) ||
          (clockType.value === 2 && dayjs().valueOf() > noonEndTime) ||
          (clockType.value === 3 && dayjs().valueOf() > endWorkTime)
        ) {
          clockVisible.value = true;
        }
      }
    }, 1000);
  }
};
const toggleIcon = (state) => {
  if (state) {
    setClose(0);
    setTimeout(() => {
      showState.value = true;
    }, 500);
  } else {
    setClose(1);
    showState.value = false;
  }
};
watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      setSpaceKey(newKey);
      getTeamList(newKey);
      getTeamFoldList(newKey);
      getTodayCheckIn(newKey);
      getMateList(newKey);
    }
  },
  { immediate: true }
);
watch(clockVisible, (newVisible) => {
  if (newVisible) {
    clockMessageVisible.value = true;
  }
});
watch(clockMessageVisible, (newVisible) => {
  if (newVisible) {
    closeMessage.value = $q.notify({
      progress: true,
      icon: "warning",
      color: "warning",
      message: `即将可以${clockInText.value}`,
      position: "top-right",
      multiLine: true,
      timeout: 86400000,
      actions: [
        {
          label: "确认",
          color: "yellow",
          handler: () => {
            closeMessage.value();
          },
        },
      ],
    });
  }
});
watch(clockType, (newType) => {
  switch (newType) {
    case 0:
      clockInText.value = "上班打卡";
      break;
    case 1:
      clockInText.value = "午休打卡";
      break;
    case 2:
      clockInText.value = "下午打卡";
      break;
    case 3:
      clockInText.value = "下班打卡";
      break;
  }
});
watch(showState, (newState) => {
  if (!newState) {
    setLeftVisible(false)
  }
});
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
          @mouseenter="
            showState && closeNum !== 1
              ? (leftVisible = true)
              : null
          "
          v-else
        >
          <Icon name="a-xuanfuhou2" :size="14" />
        </q-btn>
      </template>
    </div>
    <q-btn
      color="primary"
      round
      size="25px"
      @click.stop="
        setIframeVisible(true, {
          url: `https://checkin.qingtime.cn/checkIn?token=${token}&teamKey=${spaceKey}`,
          title: '打卡',
        })
      "
      v-if="clockVisible"
      class="clockIn-button"
      ><div class="clockIn-button-box">{{ clockInText }}</div></q-btn
    >
    <q-dialog v-model="leftVisible" position="left" class="dialog-transparent">
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
    width: 0px;
    // @include p-number(15px, 35px);
  }
  .arrow-button {
    position: fixed;
    z-index: 9999;
    top: 12px;
    left: 280px;
  }
}

.clockIn-button {
  position: fixed;
  z-index: 9000;
  bottom: 20px;
  right: 20px;
  .clockIn-button-box {
    font-size: 15px;
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
    left: 0px;
  }
}

.homeRight {
  padding-left: 0px;

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
