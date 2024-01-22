import { ref } from "vue";
import { defineStore } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { teamStore } from "./team";
// 使用setup模式定义
export const cardStore = defineStore(
  "cardStore",
  () => {
    const cardKey = ref<string>("");
    const cardInfo = ref<any>(null);
    const treeVisible = ref<boolean>(false);
    const docVisible = ref<boolean>(false);
    const docUrl = ref<string>("");
    const taskVisible = ref<boolean>(false);
    const fileVisible = ref<boolean>(false);
    const setCardKey = (newKey) => {
      console.log("???");
      cardKey.value = newKey;
    };
    const setCardInfo = (newInfo) => {
      cardInfo.value = newInfo;
    };
    const getCardInfo = async () => {
      let cardRes = (await api.request.get("card/detail", {
        cardKey: cardKey.value,
      })) as ResultProps;
      if (cardRes.msg === "OK") {
        cardInfo.value = cardRes.data;
        teamStore().teamKey = cardRes.data.projectKey;
      }
    };
    const setCardVisible = (
      visible: boolean,
      type: string,
      visibleValue?: string
    ) => {
      switch (type) {
        case "tasktree":
          treeVisible.value = visible;
          break;
        case "doc":
          docVisible.value = visible;
          docUrl.value = visibleValue!;
          break;
        case "file":
          fileVisible.value = visible;
          break;
      }
    };
    watch(cardKey, (newKey) => {
      console.log(newKey);
      if (newKey) {
        getCardInfo();
      }
    });
    return {
      cardKey,
      setCardKey,
      cardInfo,
      setCardInfo,
      treeVisible,
      docVisible,
      docUrl,
      fileVisible,
      setCardVisible,
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
