<script setup lang="ts">
import request from "@/services/api";
import { storeToRefs } from "pinia";
import router from "@/router";
import appStore from "@/store";
import api from "@/services/api";
import _ from "lodash";
import { getSearchParamValue } from "./services/util/url";
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const {
  musicSrc,
  musicNum,
  deviceWidth,
  deviceHeight,
  deviceSize,
  deviceFontSize,
} = storeToRefs(appStore.commonStore);
const { setToken, getUserInfo } = appStore.authStore;
const { setSpaceKey } = appStore.spaceStore;
const { setTeamKey } = appStore.teamStore;
const { setDeviceInfo, setDeviceType, setClose } = appStore.commonStore;
const musicRef = ref<any>(null);
onMounted(() => {
  changeDevice();
  // 检测设备方向
  window.addEventListener("orientationchange", _.debounce(changeDevice, 100));
  // // 检测设备方向
  window.addEventListener(
    "resize",
    //   document.documentElement.style.setProperty(
    //     "--vh",
    //     `${window.innerHeight * 0.01}px`
    //   );
    changeDevice
    // _.debounce(changeDevice, 1000)
  );
  setClose(
    localStorage.getItem("closeNum") ? +localStorage.getItem("closeNum")! : -1
  );
  const search = window.location.search
    ? window.location.search.split("?")[1]
    : window.location.hash.split("?")[1];
  const token = getSearchParamValue(search, "token")
    ? (getSearchParamValue(search, "token") as string)
    : localStorage.getItem("auth_token");
  console.log(token);
  if (token) {
    request.setToken(token);
    setToken(token);
    setSpaceKey(
      localStorage.getItem("spaceKey") ? localStorage.getItem("spaceKey") : ""
    );
    setTeamKey(
      localStorage.getItem("teamKey") ? localStorage.getItem("teamKey") : ""
    );
  } else {
    router.replace("/");
  }
});
const changeDevice = () => {
  setDeviceInfo(
    document.documentElement.offsetWidth,
    document.documentElement.offsetHeight
  );
  let html: any = document.getElementById("htmlId");

  var keyboardHeight =
    window.innerHeight - document.documentElement.clientHeight;
  // 判断键盘是否弹起（假设键盘高度大于 0）
  if (keyboardHeight > 0) {
    html.style.height = window.innerHeight + "px";
  } else {
    if (deviceWidth.value < deviceHeight.value) {
      setDeviceType("phone");
      html.style.fontSize = deviceFontSize.value;
    } else {
      setDeviceType("pc");
    }
  }
};
//初始化
watch(
  token,
  (newVal) => {
    if (newVal) {
      getUserInfo();
    }
  },
  { immediate: true }
);
watch([musicSrc, musicNum], ([newSrc, newNum]) => {
  if (musicRef.value) {
    musicRef.value.pause();
    musicRef.value.src = newSrc;
    nextTick(() => {
      musicRef.value.play();
    });
  }
});
</script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
// *::-webkit-scrollbar {
//   width: 4px;
//   height: 2px;
// }

*::-webkit-scrollbar-thumb {
  border-radius: 100px;
  background-color: var(--el-text-color-secondary);
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px;
  /*高宽分别对应横竖滚动条的尺寸*/
  height: 8px;
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2);
  background: "#474747";
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 2px;
  background-color: var(--q-primary);
}
</style>
