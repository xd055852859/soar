<script setup lang="ts">
import fileCard from "@/components/fileCard/fileCard.vue";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const props = defineProps<{
  type?: string;
  nodeKey?: string;
}>();
const { user } = storeToRefs(appStore.authStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const taskList = ref<any>([]);
const getTaskList = async () => {
  let obj: any = {
    projectKey: props.type ? "" : teamKey.value,
  };
  if (props.nodeKey) {
    obj.cardKey = props.nodeKey;
  }
  let taskRes = (await api.request.get("node/task/project", {
    ...obj,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    console.log(taskRes.data);
    taskList.value = [...taskRes.data];
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "update":
      let userIndex = _.findIndex(taskList.value, {
        _key: detail.executorInfo._key,
      });
      if (userIndex !== -1) {
        let updateIndex = _.findIndex(taskList.value[userIndex].taskList, {
          _key: detail._key,
        });
        if (updateIndex !== -1) {
          console.log(taskList.value[userIndex]);
          if (detail.hasDone) {
            taskList.value[userIndex].finishTask++;
          } else {
            taskList.value[userIndex].finishTask--;
          }
          taskList.value[userIndex].taskList[updateIndex] = {
            ...taskList.value[userIndex].taskList[updateIndex] ,
            ...detail,
          };
        }
        break;
      }
  }
};
watchEffect(() => {
  if (teamKey.value) {
    getTaskList();
  }
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
            class="q-mr-md"
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
            <q-avatar color="#fff" size="73px">
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
          <div>
            {{ item.userName }}{{ item.userKey === user?._key ? "(我)" : "" }}
          </div>
          <div>{{ item.finishTask }} / {{ item.totalTask }}</div>
        </div>
      </div>
      <div class="teamTask-bottom">
        <template
          v-for="(taskItem, taskIndex) in item.taskList"
          :key="`taskItem${taskIndex}`"
        >
          <fileCard
            :card="taskItem"
            type="taskBox"
            :outType="type"
            @chooseCard="chooseCard"
          />
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
  background: #f2f3f6;
  @include flex(flex-start, center, null);
  .teamTask-box {
    width: 455px;
    height: 100%;
    flex-shrink: 0;
    margin-right: 27px;
    .teamTask-top {
      width: 100%;
      /* prettier-ignore */
      height: 90Px;
      font-size: 14px;
      @include flex(center, center, null);
    }
    .teamTask-bottom {
      width: 100%;
      /* prettier-ignore */
      height: calc(100% - 90Px);
      @include scroll();
      @include p-number(10px, 10px);
    }
  }
}
</style>
<style></style>
