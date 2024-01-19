<script setup lang="ts">
import fileCard from "@/components/fileCard/fileCard.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { teamKey } = storeToRefs(appStore.teamStore);
const taskList = ref<any>([]);
const getTaskList = async () => {
  let taskRes = (await api.request.get("node/task/project", {
    projectKey: teamKey.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
  }
};
watchEffect(() => {
  getTaskList();
});
</script>
<template>
  <div class="teamTask">
    <div
      class="teamTask-box"
      v-for="(item, index) in taskList"
      :key="`task${index}`"
    >
      <div class="teamTask-top">
        <div class="teamTask-top-left">
          <q-circular-progress
            show-value
            font-size="10px"
            class="q-mr-sm"
            :value="
              item.totalTask === 0
                ? 0
                : (item.finishTask / item.totalTask) * 100
            "
            size="80px"
            :thickness="0.25"
            color="primary"
            track-color="grey-3"
          >
            <q-avatar size="65px">
              <img
                :src="
                  item.userAvatar
                    ? item.userAvatar
                    : '/common/defaultPerson.png'
                "
              />
            </q-avatar>
          </q-circular-progress>
        </div>
        <div class="teamTask-top-right">
          <div>{{ item.userName }}</div>
          <div>{{ item.finishTask }} / {{ item.totalTask }}</div>
        </div>
      </div>
      <div class="teamTask-bottom">
        <template
          v-for="(taskItem, taskIndex) in item.taskList"
          :key="`taskItem${taskIndex}`"
        >
          <fileCard :card="taskItem" type="task" />
        </template>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.teamTask {
  min-width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  @include flex(flex-start, center, null);
  .teamTask-box {
    width: 350px;
    height: 100%;
    flex-shrink: 0;
    .teamTask-top {
      width: 100%;
      height: 90px;
      font-size: 16px;
      @include flex(flex-start, center, null);
    }
    .teamTask-bottom {
      width: 100%;
      height: calc(100% - 90px);
      @include scroll();
      @include p-number(10px, 10px);
    }
  }
}
</style>
<style></style>
