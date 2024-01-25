import { ref } from "vue";
import { defineStore } from "pinia";
import { authStore } from "./auth";
import { spaceStore } from "./space";
import { mateStore } from "./mate";
import { noteStore } from "./note";
import { teamStore } from "./team";
// 使用setup模式定义
export const commonStore = defineStore("commonStore", () => {
  const deviceType = ref<string>("pc");
  const deviceWidth = ref<number>(0);
  const deviceHeight = ref<number>(0);
  const deviceSize = ref<string>("md");
  const deviceFontSize = ref<string>("100px");
  const deviceIconSize = ref<string>("20px");
  const musicSrc = ref<string>("");
  const musicNum = ref<number>(0);

  const closeNum = ref<number>(-1);
  const setDeviceType = (newDeviceType: string) => {
    deviceType.value = newDeviceType;
    if (deviceWidth.value < 400) {
      deviceSize.value = "xs";
      deviceFontSize.value = "100px";
      deviceIconSize.value = "20px";
    } else if (400 <= deviceWidth.value && deviceWidth.value <= 500) {
      deviceSize.value = "sm";
      deviceFontSize.value = "120px";
      deviceIconSize.value = "25px";
    } else if (500 < deviceWidth.value && deviceWidth.value <= 800) {
      deviceSize.value = "md";
      deviceFontSize.value = "140px";
      deviceIconSize.value = "28px";
    } else if (800 < deviceWidth.value && deviceWidth.value < 1024) {
      deviceSize.value = "lg";
      deviceFontSize.value = "180px";
      deviceIconSize.value = "30px";
    } else if (1024 <= deviceWidth.value) {
      deviceSize.value = "xl";
      deviceFontSize.value = "200px";
      deviceIconSize.value = "18px";
    }
  };
  const setDeviceInfo = (width: number, height: number) => {
    let html: any = document.getElementById("htmlId");
    deviceWidth.value = width;
    deviceHeight.value = height;
  };
  const setMusicSrc = (newSrc) => {
    musicNum.value = musicNum.value + 1;
    musicSrc.value = newSrc;
  };

  const setClose = (newNum) => {
    closeNum.value = newNum;
    if (newNum === 0) {
      localStorage.setItem("closeNum", "-2");
    } else if (newNum === 1) {
      localStorage.setItem("closeNum", "-1");
    }
  };
  const clearStore = () => {
    authStore().$reset();
    noteStore().$reset();
    teamStore().$reset();
    mateStore().$reset();
    spaceStore().$reset();
  };
  return {
    deviceType,
    setDeviceType,
    deviceWidth,
    deviceHeight,
    deviceSize,
    deviceFontSize,
    deviceIconSize,
    setDeviceInfo,
    musicSrc,
    musicNum,
    setMusicSrc,
    closeNum,
    setClose,
    clearStore,
  };
});
