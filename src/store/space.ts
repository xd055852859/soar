import { ref } from "vue";
import { defineStore } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Space, SpaceInfo, SpaceMember } from "@/interface/Space";
import router from "@/router";
import { exploreStore } from "./explore";
// 使用setup模式定义
export const spaceStore = defineStore(
  "spaceStore",
  () => {
    const spaceKey = ref<string>("");
    const spaceList = ref<Space[] | null>(null);
    const spaceMemberList = ref<SpaceMember[]>([]);
    const spaceInfo = ref<SpaceInfo | null>(null);
    const spaceRole = ref<number>(5);
    const spaceMessageNum = ref<number>(0);
    const spaceReportNum = ref<number>(0);
    const spaceTaskNum = ref<number>(0);
    const createState = ref<boolean>(false);
    const lockList = ref<any>([]);
    const privateTeamKey = ref<string>("");
    const reportConfig = ref<any>(null);
    const tagList = ref<any>([]);
    const setSpaceKey = (newKey) => {
      spaceKey.value = newKey;
      localStorage.setItem("spaceKey", newKey);
    };
    const getSpaceList = async () => {
      let spaceRes = (await api.request.get("team")) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceList.value = spaceRes.data ? spaceRes.data : [];
      }
    };
    const setSpaceList = async (newList) => {
      spaceList.value = newList;
    };
    const getSpaceMessageNum = async () => {
      let spaceRes = (await api.request.get("message/num", {
        teamKey: spaceKey.value,
      })) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceMessageNum.value = spaceRes.data.messageNum;
        spaceReportNum.value = spaceRes.data.reviewNum;
        spaceTaskNum.value = spaceRes.data.taskNum;
        reportConfig.value = spaceRes.data.reportStatus;
      }
    };
    const setReportConfig = (newConfig) => {
      reportConfig.value = { ...reportConfig.value, ...newConfig };
    };
    const setSpaceMessageNum = async (newNum) => {
      spaceMessageNum.value = newNum;
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
        checkOpenClock: true,
      })) as ResultProps;
      if (spaceRes.msg === "OK") {
        spaceInfo.value = spaceRes.data;
        spaceRole.value = spaceRes.data.role;
        if (spaceRes.data.config) {
          exploreStore().setExploreConfig({ ...spaceRes.data.config });
        } else {
          exploreStore().setExploreConfig(null, false, true);
        }
        privateTeamKey.value = spaceRes.data.privateProject;
      } else if (spaceRes.status === 202) {
        router.replace("/spaceList");
        spaceKey.value = "";
        localStorage.removeItem("spaceKey");
      }
    };
    const setSpaceInfo = (newInfo) => {
      spaceInfo.value = newInfo;
    };
    const getTag = async () => {
      let tagRes = (await api.request.get("tag", {
        teamKey: spaceKey.value,
      })) as ResultProps;
      if (tagRes.msg === "OK") {
        tagList.value = tagRes.data;
      }
    };
    const setTag = (newList) => {
      tagList.value = newList;
    };
    // const getLockList = async (key) => {
    //   let lockRes = (await api.request.get("app/lock", {
    //     teamKey: key,
    //   })) as ResultProps;
    //   if (lockRes.msg === "OK") {
    //     lockList.value = lockRes.data;
    //   }
    // };
    // const setLockList = (newList) => {
    //   lockList.value = newList;
    // };
    watch(spaceKey, (newKey) => {
      if (newKey) {
        getSpaceInfo(newKey);
        getSpaceMemberList();
        getSpaceMessageNum();
        getTag();
        // getLockList(newKey);
      }
    });
    watch([spaceList, spaceKey], ([newList, newKey]) => {
      if (newKey) {
        if (newList && newList.length > 0) {
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
      privateTeamKey,
      setSpaceKey,
      spaceMessageNum,
      spaceReportNum,
      spaceTaskNum,
      setSpaceMessageNum,
      reportConfig,
      setReportConfig,
      spaceRole,
      spaceInfo,
      setSpaceInfo,
      getSpaceInfo,
      spaceList,
      setSpaceList,
      getSpaceList,
      spaceMemberList,
      setSpaceMemberList,
      lockList,
      // getLockList,
      // setLockList,
      createState,
      tagList,
      getTag,
      setTag,
    };
  },
  // {
  //   persist: {
  //     storage: window.sessionStorage,
  //     // 部分持久化状态的点符号路径数组，[]意味着没有状态被持久化(默认为undefined，持久化整个状态)
  //     // paths: ['nested.data'],
  //   },
  // }
);
