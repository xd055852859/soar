import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
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
    });
    const setExploreConfig = (
      newConfig?: any,
      cover?: boolean,
      clear?: boolean
    ) => {
      if (cover) {
        exploreConfig.value = { ...newConfig };
      } else if (clear) {
        exploreConfig.value = {
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
        };
      } else if (clear) {
        exploreConfig.value = { ...exploreConfig.value, ...newConfig };
      }
    };
    return { exploreConfig, setExploreConfig };
  }
  //   ,
  //   { persist: true }
);
