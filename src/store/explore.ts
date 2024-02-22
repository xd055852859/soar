import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
// 使用setup模式定义
export const exploreStore = defineStore(
  "exploreStore",
  () => {
    const exploreConfig = ref<any>({ fontPoint: true });
    return { exploreConfig };
  }
//   ,
//   { persist: true }
);
