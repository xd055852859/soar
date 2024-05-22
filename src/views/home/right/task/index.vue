<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import Icon from "@/components/common/Icon.vue";
import Task from "@/components/task/task.vue";
import CDrawer from "@/components/common/cDrawer.vue";
import CreateTask from "@/components/task/createTask.vue";

import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import CEmpty from "@/components/common/cEmpty.vue";

const dayjs: any = inject("dayjs");
const { spaceKey, spaceInfo } = storeToRefs(appStore.spaceStore);
const { token, user } = storeToRefs(appStore.authStore);
const { mateList } = storeToRefs(appStore.mateStore);
const taskTab = ref<string>("execute");
const taskList = ref<any>([]);
const searchMemberList = ref<any>([]);
const treeInfo = ref<any>(null);
const teamKey = ref<any>(null);
const taskUser = ref<any>(null);
const searchName = ref<string>("");
const drawerVisible = ref<boolean>(false);
const showTaskDays = ref<number>(99999);
const getTaskList = async () => {
  let taskRes = (await api.request.get("task/team", {
    teamKey: spaceKey.value,
    targetUserKey: taskUser.value._key
      ? taskUser.value._key
      : taskUser.value.userKey,
    type: taskTab.value,
    showTaskDays: showTaskDays.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "update":
      taskList.value[detail.boxIndex].taskList[detail.taskIndex] = {
        ...taskList.value[detail.boxIndex].taskList[detail.taskIndex],
        ...detail,
      };
      break;
    case "delete":
      console.log(detail.boxIndex, detail.taskIndex);
      console.log(taskList.value[detail.boxIndex]);
      console.log(taskList.value[detail.boxIndex].taskList);
      console.log(taskList.value[detail.boxIndex].taskList[detail.taskIndex]);
      taskList.value[detail.boxIndex].taskList.splice(detail.taskIndex, 1);
      if (taskList.value[detail.boxIndex].taskList.length === 0) {
        taskList.value.splice(detail.boxIndex, 1);
      }
      break;
  }
};
const chooseTree = (item) => {
  drawerVisible.value = true;
  treeInfo.value = item;
  teamKey.value = item ? item.projectKey : "";
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
  console.log(taskUser.value);
  if (spaceKey.value && taskUser.value) {
    getTaskList();
  }
});
watchEffect(() => {
  if (user.value && !taskUser.value) {
    taskUser.value = { ...user.value };
  }
});
watchEffect(() => {
  if (user.value && mateList.value) {
    let memberList: any = [];
    if (searchName.value) {
      // let list = _.cloneDeep(searchMemberList);
      memberList = [user.value, ...mateList.value].filter((item) => {
        return item.userName && item.userName.indexOf(searchName.value) !== -1;
      });
    } else {
      memberList = [user.value, ...mateList.value];
    }
    searchMemberList.value = memberList;
    console.log(memberList);
  }
});
</script>
<template>
  <div class="task">
    <cHeader title="任务">
      <template #subtitle>
        <div
          class="icon-point q-ml-lg dp--center"
          style="height: 40px"
          v-if="taskUser"
        >
          <q-avatar color="#fff" size="22px" class="q-mr-sm">
            <img
              :src="
                taskUser.userAvatar
                  ? taskUser.userAvatar
                  : '/common/defaultPerson.png'
              "
              alt=""
            />
          </q-avatar>
          {{ taskUser.userName }}
          <Icon name="a-xiala2" :size="8" class="q-ml-sm" />
          <q-menu anchor="bottom middle" self="top middle" class="q-pa-sm">
            <q-input
              dense
              outlined
              v-model="searchName"
              class="full-width q-my-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                v-for="(item, index) in searchMemberList"
                :key="`searchTask${index}`"
                clickable
                v-close-popup
                @click="taskUser = item"
              >
                <q-item-section>
                  <div class="dp--center">
                    <q-avatar color="#fff" size="22px" class="q-mr-sm">
                      <img
                        :src="
                          item.userAvatar
                            ? item.userAvatar
                            : '/common/defaultPerson.png'
                        "
                        alt=""
                      />
                    </q-avatar>
                    {{ item?.userName }}
                  </div></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </template>
      <template #center>
        <q-tabs
          dense
          v-model="taskTab"
          active-color="primary"
          class="text-grey-7"
        >
          <q-tab name="execute" label="执行" style="width: 60px" />
          <q-tab name="create" label="创建" style="width: 60px" />
        </q-tabs>
      </template>
      <template #button>
        <div class="dp--center">
          <q-select
            borderless
            v-model="showTaskDays"
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
          <q-btn round flat size="16px" @click="chooseTree(null)">
            <Icon name="a-chuangjian2" :size="20" />
          </q-btn>
        </div>
      </template>
    </cHeader>
    <div class="task-box">
      <template v-if="taskList.length > 0">
        <div
          class="taskItem-box"
          v-for="(item, index) in taskList"
          :key="`task${index}`"
        >
          <div class="taskItem-top">
            <div>{{ item.projectName }} / {{ item.title }}</div>
            <div>
              <q-btn round flat size="16px" @click="chooseTree(item)">
                <Icon name="a-chuangjian2" :size="20" />
              </q-btn>
            </div>
          </div>
          <div class="taskItem-bottom">
            <template
              v-for="(taskItem, taskIndex) in item.taskList"
              :key="`taskItem${taskIndex}`"
            >
              <Task
                :card="taskItem"
                :boxIndex="index"
                :taskIndex="taskIndex"
                @chooseCard="chooseCard"
              />
            </template>
          </div>
        </div>
      </template>
      <c-empty title="暂无任务" v-else />
    </div>
    <c-drawer
      :visible="drawerVisible"
      @close="drawerVisible = false"
      :drawerStyle="{
        width: '450px',
      }"
      opacityMask
    >
      <template #content>
        <CreateTask :father-team-key="teamKey" :father-tree-info="treeInfo" />
      </template>
    </c-drawer>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  height: 100%;
  .task-box {
    min-width: 100%;
    height: calc(100% - 50px);
    overflow-x: auto;
    overflow-y: hidden;
    background: #f2f3f6;
    @include flex(flex-start, center, null);
    .taskItem-box {
      width: 455px;
      height: 100%;
      flex-shrink: 0;
      margin-right: 5px;
      @include p-number(5px, 10px);
      .taskItem-top {
        width: 100%;
        /* prettier-ignore */
        height: 50Px;
        margin-bottom: 10px;
        font-size: 14px;
        background-color: #fff;
        border-radius: 10px;
        @include flex(space-between, center, null);
        @include p-number(0px, 10px);
      }
      .taskItem-bottom {
        width: 100%;
        /* prettier-ignore */
        height: calc(100% - 50Px);
        @include scroll();
      }
    }
  }
}
</style>
<style></style>
