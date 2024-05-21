import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { commonStore } from "./common";
import { authStore } from "./auth";
import { spaceStore } from "./space";
import router from "@/router";
// 使用setup模式定义
export const exploreStore = defineStore(
  "exploreStore",
  () => {
    const exploreConfig = ref<any>({
      backType: 0,
      mask: 0,
      radius: 20,
      fontSize: 14,
      iconSize: 60,
      showDate: false,
      right: 30,
      bottom: 10,
      fontWeight: 10,
      fontPoint: true,
      fontOpacity: 70,
      backImg: "",
      backColor: "",
      search: { label: "百度", url: "https://www.baidu.com/s?ie=utf-8&word=" },
    });
    const celebrateAnimate = ref<boolean>(false);
    let initConfig = {
      backType: 0,
      mask: 0,
      radius: 20,
      fontSize: 14,
      iconSize: 60,
      showDate: false,
      right: 30,
      bottom: 10,
      fontWeight: 10,
      fontPoint: true,
      fontOpacity: 70,
      backImg: "",
      backColor: "",
      search: { label: "百度", url: "https://www.baidu.com/s?ie=utf-8&word=" },
    };
    const setExploreConfig = (
      newConfig?: any,
      cover?: boolean,
      clear?: boolean,
    ) => {
      if (cover) {
        exploreConfig.value = { ...newConfig };
      } else if (clear) {
        exploreConfig.value = {
          ...initConfig,
        };
      } else {
        exploreConfig.value = { ...initConfig, ...newConfig };
      }
      console.log(exploreConfig.value);
    };
    const clickExplore = (type, url?: string) => {
      switch (type) {
        case "report":
          commonStore().setIframeVisible(true, {
            url: `https://hb.qingtime.cn/?token=${authStore().token}&teamKey=${
              spaceStore().spaceKey
            }`,
            title: "汇报",
          });
          break;
        case "clockIn":
          commonStore().setIframeVisible(true, {
            url: `https://checkin.qingtime.cn/?token=${
              authStore().token
            }&teamKey=${spaceStore().spaceKey}`,
            title: "打卡",
          });
          break;
        case "ai":
          commonStore().setIframeVisible(true, {
            url: `https://soar.cn/chatbot?token=${authStore().token}`,
            title: "AI",
          });
          break;
        case "apiTable":
          window.open(`https://table.qingtime.cn`);
          break;
        case "url":
          window.open(url);
          break;
        default:
          router.push(`/home/${type}`);
      }
    };
    const setCelebrateAnimate = (state) => {
      celebrateAnimate.value = state;
    };
    return {
      exploreConfig,
      setExploreConfig,
      clickExplore,
      celebrateAnimate,
      setCelebrateAnimate,
    };
  },
  //   ,
  //   { persist: true }
);
