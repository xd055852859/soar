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
    const targetTeamKey = ref<any>("");
    const teamList = ref<any>([]);
    const teamFoldList = ref<any>([]);
    const targetTeamMemberList = ref<any>([]);
    const teamMemberList = ref<any[]>([]);
    const targetTeamInfo = ref<any | null>(null);
    const teamInfo = ref<any | null>(null);
    const targetTeamRole = ref<number>(5);
    const teamRole = ref<number>(5);
    const createState = ref<boolean>(false);
    const setTeamKey = (newKey) => {
      teamKey.value = newKey;
      localStorage.setItem("teamKey", newKey);
    };
    const setTargetTeamKey = (newKey) => {
      targetTeamKey.value = newKey;
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
    const getTeamMemberList = async (key, type?: string) => {
      let memberRes = (await api.request.get("projectMember", {
        projectKey: key,
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        if (type) {
          targetTeamMemberList.value = memberRes.data;
        } else {
          teamMemberList.value = memberRes.data;
        }
      }
    };
    const setTeamMemberList = (newList) => {
      teamMemberList.value = newList;
    };
    const getTeamInfo = async (key, type?: string) => {
        let teamRes = (await api.request.get("project/detail", {
          projectKey: key,
        })) as ResultProps;
        if (teamRes.msg === "OK") {
          if (type) {
            targetTeamInfo.value = teamRes.data;
            targetTeamRole.value = teamRes.data.role;
          } else {
            teamInfo.value = teamRes.data;
            teamRole.value = teamRes.data.role;
          }
        }
    };
    const setTeamInfo = (newInfo, type?: string) => {
      if (type) {
        targetTeamInfo.value = newInfo;
      } else {
        teamInfo.value = newInfo;
      }
    };
    watch(teamKey, (newKey) => {
      if (newKey) {
        getTeamInfo(newKey);
        getTeamMemberList(newKey);
      }
    });
    watch(targetTeamKey, (newKey) => {
      if (newKey) {
        getTeamInfo(newKey, "target");
        getTeamMemberList(newKey, "target");
      }
    });

    return {
      teamKey,
      setTeamKey,
      targetTeamKey,
      setTargetTeamKey,
      teamRole,
      teamInfo,
      targetTeamRole,
      targetTeamInfo,
      setTeamInfo,
      getTeamInfo,

      teamList,
      setTeamList,
      getTeamList,
      teamFoldList,
      setTeamFoldList,
      getTeamFoldList,
      targetTeamMemberList,
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
