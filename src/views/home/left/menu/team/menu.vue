<script setup lang="ts">
import api from "@/services/api";
import { useQuasar } from "quasar";
import _ from "lodash";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
import router from "@/router";
const { teamList } = storeToRefs(appStore.teamStore);
const { setTeamKey, setTeamList } = appStore.teamStore;
const props = defineProps<{
  info: any;
}>();
const $q = useQuasar();
const deleteTeam = () => {
  $q.dialog({
    title: "删除群组",
    message: `是否删除${props.info.name},请将资源(任务、文档、文件)全部删除后再删除`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.delete("project", {
        projectKey: props.info._key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "删除群组成功");
        let index = _.findIndex(list, { _key: props.info._key });
        index !== -1 && list.splice(index, 1);
        setTeamKey("");
        setTeamList(list);
        router.push("/home/explore");
      }
    })
    .onCancel(() => {});
};
const outTeam = () => {
  $q.dialog({
    title: "退出群组",
    message: `是否退出群组${props.info.name}`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.delete("projectMember/exit", {
        projectKey: props.info._key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "退出群组成功");
        let index = _.findIndex(list, { _key: props.info._key });
        index !== -1 && list.splice(index, 1);
        setTeamList(list);
        router.push("/home/explore");
      }
    })
    .onCancel(() => {});
};
const mergeTeam = (item) => {
  $q.dialog({
    title: "合并群组",
    message: `是否将群组 ${props.info.name} 合并到 ${item.name} `,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.post("project/merge", {
        projectKey: props.info._key,
        targetProject: item._key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "合并群组成功");
        let index = _.findIndex(list, { _key: props.info._key });
        index !== -1 && list.splice(index, 1);
        setTeamList(list);
        setTeamKey(item._key);
      }
    })
    .onCancel(() => {});
};
const copyTeam = () => {
  $q.dialog({
    title: "克隆群组",
    message: "是否克隆群组(克隆群名和群成员)",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.post("project/copy", {
        projectKey: props.info._key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "克隆群组成功");
        list.push(teamRes.data);
        setTeamList([...list]);
        setTeamKey(teamRes.data._key);
      }
    })
    .onCancel(() => {});
};
</script>
<template>
  <q-item clickable @click="" v-if="info.role === 0">
    <q-item-section class="common-title">合并到 </q-item-section>
    <q-item-section side>
      <q-icon name="keyboard_arrow_right" />
    </q-item-section>
    <q-menu anchor="top end" self="top start">
      <q-list>
        <template v-for="(item, index) in teamList" :key="`merge${index}`">
          <q-item
            v-if="item._key !== info._key"
            clickable
            @click="mergeTeam(item)"
            v-close-popup
          >
            <q-item-section>{{ item.name }}</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-item>
  <q-item clickable v-close-popup @click="copyTeam()">
    <q-item-section class="common-title">克隆</q-item-section>
  </q-item>
  <q-item clickable v-close-popup @click="deleteTeam()" v-if="info.role === 0">
    <q-item-section class="common-title">删除</q-item-section>
  </q-item>
  <q-item clickable v-close-popup @click="outTeam()" v-else>
    <q-item-section class="common-title">退出</q-item-section>
  </q-item>
</template>
<style scoped lang="scss"></style>
<style></style>
