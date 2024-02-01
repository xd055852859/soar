<script setup lang="ts">
import api from "@/services/api";
import { useQuasar } from "quasar";
import _ from "lodash";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
const { teamList } = storeToRefs(appStore.teamStore);
const { setTeamKey, setTeamList } = appStore.teamStore;
const props = defineProps<{
  info: any;
}>();
const $q = useQuasar();
const deleteTeam = (key) => {
  $q.dialog({
    title: "删除小组",
    message: "请将资源(任务、文档、文件)全部删除后再删除",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.delete("project", {
        projectKey: key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "删除小组成功");
        let index = _.findIndex(list, { _key: key });
        index !== -1 && list.splice(index, 1);
        setTeamList(list);
        setTeamKey(list[0]._key);
      }
    })
    .onCancel(() => {});
};
</script>
<template>
  <q-item clickable v-close-popup @click="" v-if="info.role === 0">
    <q-item-section class="common-title">合并到</q-item-section>
  </q-item>
  <q-item clickable v-close-popup @click="">
    <q-item-section class="common-title">克隆</q-item-section>
  </q-item>
  <q-item
    clickable
    v-close-popup
    @click="deleteTeam(info._key)"
    v-if="info.role === 0"
  >
    <q-item-section class="common-title">删除</q-item-section>
  </q-item>
</template>
<style scoped lang="scss"></style>
<style></style>
