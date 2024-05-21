<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Task from "@/components/task/task.vue";
import { commonscroll, setMessage } from "@/services/util/common";
import Icon from "@/components/common/Icon.vue";
import { searchArray } from "@/services/config/config";
const { user } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const props = defineProps<{
  fatherTeamKey?: string;
  fatherTreeInfo?: any;
  fatherExecutorInfo?: any;
  taskType?: string;
}>();

const addInput = ref<string>("");
const moreState = ref<boolean>(false);
const showMore = ref<boolean>(false);
const treeList = ref<any>([]);
const memberList = ref<any>([]);
const taskList = ref<any>([]);
const searchMemberList = ref<any>([]);
const searchTreeList = ref<any>([]);
const searchVisible = ref<boolean>(false);
const teamKey = ref<string>("");
const treeKey = ref<string>("");
const cardKey = ref<string>("");
const treeInfo = ref<any>(null);
const executorInfo = ref<any>(null);
const type = ref<number>(0);
const searchTreeInput = ref<string>("");
const searchMemberInput = ref<string>("");
const topRef = ref<any>(null);
const page = ref<number>(1);
const total = ref<number>(0);
onMounted(() => {
  if (props.fatherTeamKey) {
    teamKey.value = props.fatherTeamKey;
  }
  if (props.fatherTreeInfo) {
    treeKey.value = props.fatherTreeInfo._key;
    treeInfo.value = props.fatherTreeInfo;
    if (props.taskType === "tree") {
      cardKey.value = props.fatherTreeInfo._key;
    }
  }
  executorInfo.value = props.fatherExecutorInfo
    ? props.fatherExecutorInfo
    : { ...user.value, userKey: user.value!._key };

  getData();
});
const getData = async () => {
  let dataRes = (await api.request.get("card/myTaskTree", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    treeList.value = [...dataRes.data];
  }
};
const getMemberData = async () => {
  let memberRes = (await api.request.get("projectMember", {
    projectKey: teamKey.value,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    memberList.value = [...memberRes.data];
  }
};
const getTaskData = async () => {
  let obj: any = {
    teamKey: spaceKey.value,
    type: type.value,
    page: page.value,
    limit: 50,
  };
  if (props.taskType === "tree") {
    obj.onTree = false;
    obj.cardKey = cardKey.value;
  }
  let taskRes = (await api.request.get("task/create/all", {
    ...obj,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    if (page.value === 1) {
      taskList.value = [];
    }
    taskList.value = [...taskList.value, ...taskRes.data];
    total.value = taskRes.total!;
  }
};
// const changeInput = (value) => {
//   let inputArray=value.split(/\r?\n|\r/g);
//   if(inputArray.length){
//
//   }
// };
const addTask = async () => {
  let inputArray = [addInput.value];
  if (moreState.value) {
    inputArray = addInput.value.split(/\r?\n|\r/g);
  }
  let taskRes = (await api.request.post("task", {
    cardKey: treeInfo.value._key,
    executor: executorInfo.value.userKey,
    titleArr: inputArray,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    setMessage("success", "发布任务成功");
    addInput.value = "";
    getTaskData();
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "delete":
      taskList.value.splice(detail.taskIndex, 1);
      break;
  }
};
watch(teamKey, () => {
  page.value = 1;
  getMemberData();
});
watch(type, () => {
  page.value = 1;
});
watch(
  addInput,
  (newInput) => {
    if (newInput) {
      let arr = newInput.split(/\r?\n|\r/g);
      if (arr.length > 1) {
        showMore.value = true;
      } else {
        showMore.value = false;
      }
    } else {
      showMore.value = false;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (searchTreeInput.value) {
    searchTreeList.value = treeList.value.filter((item) =>
      item.title.includes(searchTreeInput.value),
    );
  } else {
    searchTreeList.value = [...treeList.value];
  }
});
watchEffect(() => {
  if (spaceKey.value) {
    if (props.taskType === "tree" && cardKey.value) {
      getTaskData();
    } else if (props.taskType !== "tree") {
      getTaskData();
    }
  }
});
</script>

<template>
  <div class="create-task">
    <div class="create-task-top" ref="topRef">
      <div class="create-task-header">
        <q-input
          v-model="addInput"
          borderless
          dense
          autogrow
          class="create-task-textarea"
          placeholder="请输入任务"
        />
        <div class="create-task-button dp-space-center">
          <q-checkbox
            v-model="moreState"
            label="多任务"
            dense
            v-if="showMore"
          />
          <q-space v-else />
          <q-btn
            label="发布"
            :color="
              !treeInfo || !executorInfo || !addInput ? 'grey-5' : 'primary'
            "
            @click="addTask()"
            :disable="!treeInfo || !executorInfo || !addInput"
          />
        </div>
      </div>
      <div v-if="!taskType" class="create-task-search">
        <template v-if="treeInfo">
          <div>
            #
            {{
              treeInfo.projectName
                ? treeInfo.projectName
                : treeInfo.projectInfo
                  ? treeInfo.projectInfo.name
                  : ""
            }}
            / {{ treeInfo.title }}
          </div>
          <div>
            <q-avatar color="#fff" size="30px" class="shadow-3 q-mr-sm">
              <img
                :src="
                  executorInfo?.userAvatar
                    ? executorInfo?.userAvatar
                    : '/common/defaultPerson.png'
                "
                alt=""
              />
            </q-avatar>
            {{ executorInfo?.userName
            }}<q-icon
              name="arrow_drop_down"
              color="grey-7"
              style="margin-left: 8px"
              size="25px"
              class="select-icon"
            />
          </div>
        </template>
        <template v-else
          ><div style="font-size: 14px" class="text-grey-5">
            请选择任务树与执行人
          </div>
          <q-icon
            name="arrow_drop_down"
            color="grey-7"
            style="margin-left: 8px"
            size="25px"
            class="select-icon"
          />
        </template>

        <q-menu style="margin-left: 20px">
          <div class="create-task-choose">
            <div class="create-choose-tree create-choose">
              <div class="choose-header">
                <div class="choose-title">任务树</div>
                <div
                  class="dp--center justify-end"
                  style="width: calc(100% - 90px)"
                >
                  <q-input
                    v-model="searchTreeInput"
                    outlined
                    dense
                    clearable
                    style="width: calc(100% - 20px)"
                    placeholder="请输入任务树"
                    v-if="searchVisible"
                  />
                  <q-space v-else />
                  <q-btn flat round @click="searchVisible = !searchVisible">
                    <Icon name="sousuo" :size="20" />
                    <q-tooltip> 搜索</q-tooltip>
                  </q-btn>
                </div>
              </div>
              <div class="choose-container choose-container-tree">
                <div
                  v-for="(treeItem, treeIndex) in searchTreeList"
                  :key="`treeItem-${treeIndex}`"
                  :style="{
                    background: treeInfo?._key === treeItem._key ? '#eee' : '',
                  }"
                  class="choose-container-item"
                  @click="
                    console.log(treeItem);
                    teamKey = treeItem.projectInfo._key;
                    treeInfo = { ...treeItem };
                  "
                >
                  <div>
                    # {{ treeItem.projectInfo.name }} /
                    {{ treeItem.title }}
                  </div>
                </div>
              </div>
            </div>
            <div class="create-choose-member create-choose">
              <div class="choose-header">
                <div class="choose-title">执行人</div>
              </div>
              <div class="choose-container">
                <div
                  v-for="(memberItem, memberIndex) in memberList"
                  :key="`memberItem-${memberIndex}`"
                  :style="{
                    background:
                      executorInfo?.userKey === memberItem.userKey
                        ? '#eee'
                        : '',
                  }"
                  v-close-popup
                  class="choose-container-item"
                  @click="executorInfo = memberItem"
                >
                  <div class="full-width single-to-long">
                    {{ memberItem.userName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-menu>
      </div>
      <div class="create-task-filter">
        <div class="dp--center" v-if="taskType === 'tree'">
          {{ executorInfo?.userName }}
          <q-menu style="width: 100px">
            <div class="create-member">
              <div
                v-for="(memberItem, memberIndex) in searchMemberList"
                :key="`memberItem-${memberIndex}`"
                :style="{
                  background:
                    executorInfo?.userKey === memberItem.userKey ? '#eee' : '',
                }"
                v-close-popup
                class="create-member-item"
                @click="executorInfo = memberItem"
              >
                <div>
                  {{ memberItem.userName }}
                </div>
              </div>
            </div>
          </q-menu>
        </div>
        <q-space v-else />
        <q-select
          borderless
          v-model="type"
          :options="[
            { key: 0, value: '全部(我相关)' },
            { key: 1, value: '我待执行' },
            { key: 2, value: '我已执行' },
            { key: 3, value: '指派给我' },
            { key: 4, value: '指派他人' },
          ]"
          :option-value="(opt) => opt.key"
          :option-label="(opt) => opt.value"
          style="width: 150px; margin-right: 10px"
          dense
          emit-value
          map-options
        />
      </div>
    </div>
    <div
      class="create-task-container"
      v-if="topRef"
      :style="{ height: `calc(100vh - ${topRef.offsetHeight + 40}px)` }"
      @scroll="
        commonscroll($event, taskList, total, () => {
          page++;
        })
      "
    >
      <template
        v-for="(taskItem, taskIndex) in taskList"
        :key="`taskItem${taskIndex}`"
      >
        <Task
          :card="taskItem"
          :taskIndex="taskIndex"
          @chooseCard="chooseCard"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.create-task {
  .create-task-header {
    width: 100%;
    margin-bottom: 10px;
    border-radius: 6px;
    border: 1px solid $grey-7;
    @include p-number(0px, 10px, 10px, 10px);
    .create-task-textarea {
      margin-bottom: 10px;
    }
  }
  .create-task-search {
    width: 100%;
    height: 50px;
    border-radius: 6px;
    margin-bottom: 10px;
    border: 1px solid $grey-2;
    @include p-number(0px, 10px);
    @include flex(space-between, center, null);
  }
  .create-task-filter {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    @include flex(space-between, center, null);
  }
  .create-task-container {
    width: 100%;
    @include p-number(5px, 5px);
    @include scroll();
  }
}
.create-task-choose {
  width: 420px;
  height: 60vh;
  @include p-number(10px, 10px);
  @include flex(space-between, center, null);
  .create-choose {
    width: 100px;
    height: 100%;
    @include p-number(0px, 5px);
    .choose-header {
      width: 100%;
      height: 40px;
      margin-bottom: 10px;
      @include flex(flex-start, center, null);
      .choose-title {
        width: 80px;
        height: 100%;
        line-height: 40px;
        font-weight: bolder;
      }
    }
    .choose-container {
      width: 100%;
      height: calc(100% - 50px);
      @include scroll();
      .choose-container-item {
        min-height: 30px;
        line-height: 25px;
        cursor: pointer;
      }
    }
  }
  .create-choose-tree {
    width: calc(100% - 110px);
    padding-right: 5px;
    box-sizing: border-box;
    border-right: 2px solid $grey-3;
    .choose-container-tree {
    }
  }
  .create-choose-member {
    width: 100px;
  }
}
.create-member {
  width: 100%;
  max-height: 60vh;
  @include scroll();
  .create-member-item {
    min-height: 30px;
    line-height: 25px;
    cursor: pointer;
    @include flex(center, center, null);
  }
}
</style>
