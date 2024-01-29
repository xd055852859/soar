import { ref } from "vue";
import { defineStore } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Space, SpaceInfo, SpaceMember } from "@/interface/Space";
import router from "@/router";
import { mateStore } from "./mate";
// 使用setup模式定义
export const spaceStore = defineStore(
  "spaceStore",
  () => {
    const spaceKey = ref<string>("");
    const spaceList = ref<Space[]>([]);
    const spaceMemberList = ref<SpaceMember[]>([]);
    const spaceInfo = ref<SpaceInfo | null>(null);
    const spaceRole = ref<number>(5);
    const createState = ref<boolean>(false);
    const setSpaceKey = (newKey) => {
      spaceKey.value = newKey;
      localStorage.setItem("spaceKey", newKey);
    };
    const getSpaceList = async () => {
      let spaceRes = (await api.request.get("team")) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceList.value = spaceRes.data;
      }
    };
    const setSpaceList = async (newList) => {
      spaceList.value = newList;
    };

    const getSpaceMemberList = async () => {
      let memberRes = (await api.request.get("teamMember", {
        teamKey: spaceKey.value,
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        spaceMemberList.value = memberRes.data;
      }
    };
    const setSpaceMemberList = (newList) => {
      spaceMemberList.value = newList;
    };
    const getSpaceInfo = async (key) => {
      let spaceRes = (await api.request.get("team/detail", {
        teamKey: key,
      })) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceInfo.value = spaceRes.data;
        spaceRole.value = spaceRes.data.role;
      } else if (spaceRes.status === 202) {
        router.replace("/spaceList");
        spaceKey.value = "";
        localStorage.removeItem("spaceKey");
      }
    };
    const setSpaceInfo = (newInfo) => {
      spaceInfo.value = newInfo;
    };
    watch(spaceKey, (newKey) => {
      if (newKey) {
        getSpaceInfo(newKey);
        getSpaceMemberList();
      }
    });
    watch([spaceList, spaceKey], ([newList, newKey]) => {
      if (newKey) {
        if (newList.length > 0) {
          let index = _.findIndex(newList, { _key: newKey });
          if (index === -1) {
            spaceKey.value = "";
            router.replace("/spaceList");
            localStorage.removeItem("spaceKey");
          }
        } else {
          getSpaceList();
        }
      }
    });
    return {
      spaceKey,
      setSpaceKey,
      spaceRole,
      spaceInfo,
      setSpaceInfo,
      getSpaceInfo,
      spaceList,
      setSpaceList,
      getSpaceList,
      spaceMemberList,
      setSpaceMemberList,
      createState,
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
