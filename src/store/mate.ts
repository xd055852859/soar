import { ref } from "vue";
import { defineStore } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { formatName } from "@/services/config/config";
import { spaceStore } from "./space";
// 使用setup模式定义
export const mateStore = defineStore(
  "mateStore",
  () => {
    const mateKey = ref<string>("");
    const mateList = ref<any>([]);
    const mateInfo = ref<any>(null);
    const setMateKey = (newKey) => {
      console.log(newKey);
      mateKey.value = newKey;
    };
    const getMateList = async (key) => {
      let mateRes = (await api.request.get("teamMate", {
        teamKey: key,
      })) as ResultProps;
      if (mateRes.msg === "OK") {
        mateRes.data = mateRes.data.map((item) => {
          [item.chartData, item.chartName] = formatName(item.activeList);
          return item;
        });
        mateList.value = [...mateRes.data];
      }
    };
    const setMateList = async (newList) => {
      mateList.value = newList;
    };
    const setMateInfo = (newInfo) => {
      mateInfo.value = newInfo;
    };
    watch([mateKey, mateList], ([newKey, newList]) => {
      if (newKey && newList.length > 0) {
        let index = _.findIndex(newList, { _key: newKey });
        console.log(newList,newKey);
        if (index !== -1) {
          setMateInfo({ ...newList[index] });
        }
      }
    });
    return {
      mateKey,
      setMateKey,
      mateList,
      getMateList,
      setMateList,
      mateInfo,
    };
  }
  // {
  //   persist: {
  //     storage: window.sessionStorage,
  //     // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  //     // paths: ['nested.data'],
  //   },
  // }
);
