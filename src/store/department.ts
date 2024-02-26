import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/interface/User";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { formatData } from "@/services/util/data";
import { spaceStore } from "./space";
// 使用setup模式定义
export const departmentStore = defineStore(
  "departmentStore",
  () => {
    const departmentTree = ref<any>(null);
    const departmentInfo = ref<any>(null);
    const departmentList = computed(() => {
      if (spaceStore().spaceInfo?.rootDepartment && departmentTree.value) {
        return [
          formatData(
            departmentTree.value,
            spaceStore().spaceInfo!.rootDepartment!
          ),
        ];
      }
    });
    const getDepartmentTree = async () => {
      let departmentRes = (await api.request.get("department/tree", {
        departmentKey: spaceStore().spaceInfo!.rootDepartment,
        showStaff: false,
      })) as ResultProps;
      if (departmentRes.msg === "OK") {
        departmentTree.value = { ...departmentRes.data };
        console.log(departmentTree.value);
      }
    };
    const setDepartmentTree = (newTree, coverState) => {
      if (coverState) {
        departmentTree.value = { ...newTree };
      } else {
        departmentTree.value = { ...departmentTree.value, ...newTree };
      }
    };
    const getDepartmentInfo = async (key) => {
      let departmentRes = (await api.request.get("department/info", {
        departmentKey: key,
      })) as ResultProps;
      if (departmentRes.msg === "OK") {
        departmentInfo.value = departmentRes.data;
      }
    };
    return {
      departmentTree,
      departmentList,
      getDepartmentTree,
      setDepartmentTree,
      departmentInfo,
      getDepartmentInfo,
    };
  }
  // { persist: true }
);
