<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cOutLoading from "@/components/common/cOutLoading.vue";
import Icon from "@/components/common/Icon.vue";
import Task from "@/components/task/task.vue";
import CDrawer from "@/components/common/cDrawer.vue";
import CreateTask from "@/components/task/createTask.vue";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import CEmpty from "@/components/common/cEmpty.vue";

const dayjs: any = inject("dayjs");
const { spaceKey, spaceInfo } = storeToRefs(appStore.spaceStore);
const { token, user } = storeToRefs(appStore.authStore);
const taskTab = ref<string>("execute");
const taskList = ref<any>([]);
const chooseTaskList = ref<any>([]);
const memberList = ref<any>([]);
const treeInfo = ref<any>(null);
const teamKey = ref<any>(null);
const drawerVisible = ref<boolean>(false);
const chooseKey = ref<string>("");
const showTaskDays = ref<number>(0);
const loading = ref<boolean>(false);

const getTaskList = async () => {
  let obj: any = {
    teamKey: spaceKey.value,
    type: taskTab.value,
    showTaskDays: showTaskDays.value,
  };
  if (taskTab.value === "relate") {
    obj.targetUserKey = chooseKey.value;
  }
  let taskRes = (await api.request.get("task/team/new", {
    ...obj,
  })) as ResultProps;
  loading.value = true;
  console.log(loading.value);
  if (taskRes.msg === "OK") {
    loading.value = false;
    console.log(loading.value);
    taskList.value = [...taskRes.data];
    chooseTaskList.value = [...taskRes.data];
  }
};
const getRelateMemberList = async () => {
  let memberRes = (await api.request.get("task/team/users", {
    teamKey: spaceKey.value,
    type: taskTab.value,
    showTaskDays: showTaskDays.value,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    let index = _.findIndex(memberRes.data, { _key: user.value!._key });
    if (index !== -1) {
      let memberItem = { ...memberRes.data[index] };
      memberRes.data.splice(index, 1);
      memberRes.data.unshift(memberItem);
      memberList.value = [...memberRes.data];
    }
  }
};
const chooseMember = (memberItem) => {
  chooseTaskList.value = [];
  if (memberItem) {
    chooseKey.value = memberItem._key;
    if (taskTab.value !== "relate") {
      let list: any = [];
      taskList.value.forEach((item, index) => {
        list[index] = { ...item };
        list[index].taskList = [];
        item.taskList.forEach((taskItem, taskIndex) => {
          switch (taskTab.value) {
            case "create":
              if (chooseKey.value === taskItem.executorInfo._key) {
                list[index].taskList.push(taskItem);
              }
              break;
            case "execute":
              if (chooseKey.value === taskItem.assignorInfo._key) {
                list[index].taskList.push(taskItem);
              }
              break;
          }
        });
        if (list[index].taskList.length > 0) {
          chooseTaskList.value.push(list[index]);
        }
      });
    }
  } else {
    chooseKey.value = "";
    chooseTaskList.value = [...taskList.value];
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "update":
      taskList.value[detail.boxIndex].taskList[detail.taskIndex] = {
        ...taskList.value[detail.boxIndex].taskList[detail.taskIndex],
        ...detail,
      };
      console.log(taskList.value[detail.boxIndex].taskList[detail.taskIndex]);
      break;
    case "delete":
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
      showTaskDays.value = info.showTaskDays ? info.showTaskDays : 99999;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (
    user.value &&
    showTaskDays.value &&
    spaceKey.value &&
    ((taskTab.value === "relate" && chooseKey.value) ||
      taskTab.value !== "relate")
  ) {
    getTaskList();
  }
});
watchEffect(() => {
  if (user.value && showTaskDays.value && spaceKey.value) {
    if (taskTab.value === "relate") {
      chooseKey.value = user.value._key;
    } else {
      chooseKey.value = "";
    }
    getRelateMemberList();
  }
});
</script>
<template>
  <div class="task">
    <c-out-loading :visible="loading" />
    <cHeader title="任务">
      <template #center>
        <q-tabs
          dense
          v-model="taskTab"
          active-color="primary"
          class="text-grey-7"
        >
          <q-tab name="execute" label="我执行的" style="width: 100px" />
          <q-tab name="create" label="我创建的" style="width: 100px" />
          <q-tab name="relate" label="干系人" style="width: 80px" />
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
      <template v-if="taskTab !== 'relate' && chooseTaskList.length > 0">
        <div
          class="taskItem-box"
          v-for="(item, index) in chooseTaskList"
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
      <template v-else-if="taskTab === 'relate' && taskList.length > 0">
        <div
          class="teamTask-container"
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
                    alt=""
                  />
                </q-avatar>
              </q-circular-progress>
            </div>
            <div class="teamTask-top-right">
              <div>
                {{ item.userName
                }}{{ item.userKey === user?._key ? "(我)" : "" }}
              </div>
              <!--              <div>{{ item.finishTask }} / {{ item.totalTask }}</div>-->
            </div>
          </div>
          <div class="teamTask-bottom">
            <template
              v-for="(taskItem, taskIndex) in item.taskList"
              :key="`taskItem${taskIndex}`"
            >
              <Task :card="taskItem" @chooseCard="chooseCard" />
            </template>
          </div>
        </div>
      </template>
      <c-empty title="暂无任务" v-else />
      <div class="taskItem-right">
        <div class="taskItem-right-title">
          {{
            taskTab === "create"
              ? "执行人"
              : taskTab === "execute"
                ? "指派人"
                : "干系人"
          }}
        </div>
        <div class="taskItem-right-box" v-if="memberList.length > 0">
          <div
            class="icon-point q-my-xs"
            @click.stop="chooseMember(null)"
            :style="chooseKey === '' ? { border: '3px solid #07be51' } : {}"
            v-if="taskTab !== 'relate'"
          >
            <q-avatar color="secondary" text-color="white" size="32px"
              >全</q-avatar
            >
          </div>
          <div
            class="icon-point q-my-xs"
            v-for="(item, index) in memberList"
            :key="`task${index}`"
            @click.stop="chooseMember(item)"
            :style="
              chooseKey === item._key ? { border: '3px solid #07be51' } : {}
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
    <c-drawer
      :visible="drawerVisible"
      title="我的任务"
      @close="drawerVisible = false"
      :drawerStyle="{
        width: '450px',
      }"
      noMask
      showClose
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
  position: relative;
  z-index: 1;
  .task-box {
    min-width: 100%;
    height: calc(100% - 50px);
    overflow-x: auto;
    overflow-y: hidden;
    background: #f2f3f6;
    padding-right: 60px;
    box-sizing: border-box;
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
    .taskItem-right {
      /* prettier-ignore */
      width: 60px;
      height: calc(100vh - 50px);
      position: fixed;
      z-index: 2;
      top: 50px;
      right: 0;
      color: #7c84a0;
      background-color: #fff;
      @include p-number(10px, 0);
      @include flex(center, flex-start, wrap);

      .taskItem-right-title {
        //margin: 10px 0px;
        font-size: 14px;
        font-weight: bolder;
      }
      .taskItem-right-box {
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
