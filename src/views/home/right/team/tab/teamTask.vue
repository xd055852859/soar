<script setup lang="ts">
import Task from "@/components/task/task.vue";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Icon from "@/components/common/Icon.vue";
import Tree from "@/components/tree/tree.vue";
import CHeader from "@/components/common/cHeader.vue";
import CDrawer from "@/components/common/cDrawer.vue";
import CreateTask from "@/components/task/createTask.vue";
const props = defineProps<{
  cardKey?: string;
}>();

const { user } = storeToRefs(appStore.authStore);
const { teamKey, teamInfo, teamMemberList } = storeToRefs(appStore.teamStore);
const { spaceInfo } = storeToRefs(appStore.spaceStore);

const taskList = ref<any>([]);
const menuTab = ref<string>("tree");
const assignor = ref<string>("");
const showTaskDays = ref<number>(99999);
const taskVisible = ref<boolean>(false);
const executorInfo = ref<any>(null);
const getTaskList = async () => {
  let obj: any = {
    projectKey: teamKey.value,
    assignor: assignor.value,
    showTaskDays: showTaskDays.value,
  };
  if (props.cardKey) {
    obj.cardKey = props.cardKey;
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
            ...taskList.value[userIndex].taskList[updateIndex],
            ...detail,
          };
        }
        break;
      }
  }
};
const chooseAssignor = (key) => {
  console.log(key);
  assignor.value === key ? (assignor.value = "") : (assignor.value = key);
};
const chooseExecutor = (item) => {
  taskVisible.value = true;
  executorInfo.value = item;
};
watch(
  spaceInfo,
  (info) => {
    if (info) {
      showTaskDays.value = info.showTaskDays;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (teamKey.value && menuTab.value === "board") {
    getTaskList();
  }
});
</script>
<template>
  <div class="teamTask">
    <c-header title="任务">
      <template #center>
        <q-tabs dense v-model="menuTab" active-color="primary">
          <q-tab name="tree" label="任务树" style="width: 60px" />
          <q-tab name="board" label="看板" style="width: 60px" />
        </q-tabs>
      </template>
      <template #button v-if="menuTab === 'board'">
        <q-select
          borderless
          v-model="showTaskDays"
          style="margin-right: 70px"
          :options="[
            {
              label: '1天',
              value: 1,
            },
            {
              label: '3天',
              value: 3,
            },
            {
              label: '7天',
              value: 7,
            },
            {
              label: '30天',
              value: 30,
            },
            {
              label: '90天',
              value: 90,
            },
            {
              label: '永久',
              value: 99999,
            },
          ]"
          dense
          emit-value
          map-options
        />
      </template>
    </c-header>
    <div class="teamTask-box">
      <div
        class="teamTask-container"
        v-for="(item, index) in taskList"
        :key="`task${index}`"
        v-if="menuTab === 'board'"
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
                  alt=""
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
          <q-btn round flat size="16px" @click="chooseExecutor(item)">
            <Icon name="a-chuangjian2" :size="20" />
          </q-btn>
        </div>
        <div class="teamTask-bottom">
          <template
            v-for="(taskItem, taskIndex) in item.taskList"
            :key="`taskItem${taskIndex}`"
          >
            <Task :card="taskItem" @chooseCard="chooseCard" />
          </template>
        </div>
        <div class="teamTask-right" @click.stop="">
          <div class="teamTask-right-title">创建人</div>
          <div class="teamTask-right-box">
            <div
              class="icon-point q-my-xs"
              v-for="(item, index) in teamMemberList"
              :key="`task${index}`"
              @click.stop="chooseAssignor(item.userKey)"
              :style="
                assignor === item.userKey ? { border: '3px solid #07be51' } : {}
              "
            >
              <q-avatar color="#fff" size="35px">
                <img
                  :src="
                    item.userAvatar
                      ? item.userAvatar
                      : '/common/defaultPerson.png'
                  "
                  alt=""
                />
              </q-avatar>
              <q-tooltip :offset="[0, -5]">
                {{ item.userName }}
              </q-tooltip>
            </div>
          </div>
        </div>
      </div>
      <Tree :card-key="cardKey" v-else />
    </div>
    <c-drawer
      :visible="taskVisible"
      @close="taskVisible = false"
      :drawerStyle="{
        width: '450px',
      }"
      opacityMask
    >
      <template #content>
        <CreateTask
          :father-team-key="teamKey"
          :father-tree-info="{
            _key: cardKey,
          }"
          :father-executor-info="executorInfo"
          taskType="tree"
        />
      </template>
    </c-drawer>
  </div>
</template>
<style scoped lang="scss">
.teamTask {
  width: 100%;
  height: 100%;
  .teamTask-box {
    min-width: 100%;
    height: calc(100% - 50px);

    overflow-x: auto;
    overflow-y: hidden;
    background: #f2f3f6;
    position: relative;
    z-index: 1;
    @include flex(flex-start, center, null);

    .teamTask-container {
      width: 455px;
      height: 100%;
      flex-shrink: 0;
      margin-right: 27px;
      padding-right: 40px;
      box-sizing: border-box;
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
    .teamTask-right {
      /* prettier-ignore */
      width: 60px;
      height: calc(100vh - 50px);
      position: fixed;
      z-index: 2;
      top: 50px;
      right: 0;
      color: #7c84a0;
      align-content: flex-start;
      background-color: #fff;
      @include p-number(10px, 0);
      @include flex(center, center, wrap);

      .teamTask-right-title {
        //margin: 10px 0px;
        font-size: 14px;
        font-weight: bolder;
      }
      .teamTask-right-box {
        height: calc(100% - 40px);
        @include scroll();
        > div {
          border-radius: 50%;
          margin-bottom: 10px;
          @include flex(center, center, wrap);
        }
      }
    }
  }
}
</style>
<style></style>
