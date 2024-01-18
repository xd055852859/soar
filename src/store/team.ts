import { ref } from "vue";
import { defineStore } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { Space, SpaceInfo, SpaceMember } from "@/interface/Space";
import router from "@/router";
import { spaceStore } from "./space";
// 使用setup模式定义
export const teamStore = defineStore(
  "teamStore",
  () => {
    const teamKey = ref<string>("");
    const teamList = ref<any>([]);
    const teamFoldList = ref<any>([]);
    const teamMemberList = ref<any[]>([]);
    const teamInfo = ref<any | null>(null);
    const teamRole = ref<number>(5);
    const createState = ref<boolean>(false);
    const setTeamKey = (newKey) => {
      teamKey.value = newKey;
      localStorage.setItem("teamKey", newKey);
    };
    const getTeamList = async (key) => {
      let teamRes = (await api.request.get("project", {
        teamKey: key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        teamList.value = teamRes.data;
      }
    };
    const setTeamList = async (newList) => {
      teamList.value = newList;
    };
    const getTeamFoldList = async (key) => {
      let teamRes = (await api.request.get("project", {
        teamKey: key,
        fold: true,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        teamFoldList.value = teamRes.data;
      }
    };
    const setTeamFoldList = async (newList) => {
      teamFoldList.value = newList;
    };
    const getTeamMemberList = async () => {
      let memberRes = (await api.request.get("projectMember", {
        projectKey: teamKey.value,
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        teamMemberList.value = memberRes.data;
      }
    };
    const setTeamMemberList = (newList) => {
      teamMemberList.value = newList;
    };
    const getTeamInfo = async (key) => {
      let teamRes = (await api.request.get("project/detail", {
        projectKey: key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        teamInfo.value = teamRes.data;
        teamRole.value = teamRes.data.role;
      }
    };
    const setTeamInfo = (newInfo) => {
      teamInfo.value = newInfo;
    };
    watch(teamKey, (newKey) => {
      if (newKey) {
        getTeamInfo(newKey);
        getTeamMemberList();
      }
    });

    return {
      teamKey,
      setTeamKey,
      teamRole,
      teamInfo,
      setTeamInfo,
      getTeamInfo,
      teamList,
      setTeamList,
      getTeamList,
      teamFoldList,
      setTeamFoldList,
      getTeamFoldList,
      teamMemberList,
      setTeamMemberList,
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
