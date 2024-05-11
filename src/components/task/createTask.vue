<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import FileCard from "@/components/fileCard/fileCard.vue";
const { user } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const props = defineProps<{
  fatherTeamKey: string;
  fatherTreeInfo: any;
  fatherExecutorInfo?: any;
}>();

const addInput = ref<string>("");
const moreState = ref<boolean>(false);
const treeList = ref<any>([]);
const memberList = ref<any>([]);
const taskList = ref<any>([]);
const searchMemberList = ref<any>([]);
const searchTreeList = ref<any>([]);
const teamKey = ref<string>("");
const treeKey = ref<string>("");
const treeInfo = ref<any>(null);
const executorInfo = ref<any>(null);
const type = ref<number>(0);
const searchTreeInput = ref<string>("");
const searchMemberInput = ref<string>("");
const topRef = ref<any>(null);
onMounted(() => {
  teamKey.value = props.fatherTeamKey;
  treeKey.value = props.fatherTreeInfo._key;
  treeInfo.value = props.fatherTreeInfo;
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
  let taskRes = (await api.request.get("task/card", {
    cardKey: treeInfo.value._key,
    assignor: executorInfo.value.userKey,
    type: type.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
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
    getTaskData();
  }
};
watch(teamKey, () => {
  getMemberData();
});
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
  if (searchMemberInput.value) {
    searchMemberList.value = memberList.value.filter((item) =>
      item.userName.includes(searchMemberInput.value),
    );
  } else {
    searchMemberList.value = [...memberList.value];
  }
});
watchEffect(() => {
  if (treeInfo.value) {
    getTaskData();
  }
});
</script>

<template>
  <div class="create-task" v-if="treeInfo">
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
          <q-checkbox v-model="moreState" label="多任务" dense />
          <q-btn label="保存" color="primary" @click="addTask()" />
        </div>
      </div>
      <div class="create-task-search">
        <div>{{ treeInfo.title }}</div>
        <div>{{ executorInfo.userName }}</div>
        <q-menu style="margin-left: 20px">
          <div class="create-task-choose">
            <div class="create-choose">
              <div class="choose-header">
                <div class="choose-title">树列表</div>
                <div>
                  <q-input
                    v-model="searchTreeInput"
                    outlined
                    dense
                    clearable
                    style="width: 180px"
                    placeholder="请输入任务树"
                  />
                </div>
              </div>
              <div class="choose-container">
                <div
                  v-for="(treeItem, treeIndex) in searchTreeList"
                  :key="`treeItem-${treeIndex}`"
                  :style="{
                    background: treeInfo._key === treeItem._key ? '#eee' : '',
                  }"
                  class="choose-container-item"
                  @click="
                    teamKey = treeItem.projectInfo._key;
                    treeInfo = treeItem;
                  "
                >
                  <div>
                    {{ treeItem.projectInfo.name }} / {{ treeItem.title }}
                  </div>
                </div>
              </div>
            </div>
            <div class="create-choose">
              <div class="choose-header">
                <div class="choose-title">执行人列表</div>
                <div>
                  <q-input
                    v-model="searchMemberInput"
                    outlined
                    dense
                    clearable
                    style="width: 180px"
                    placeholder="请输入执行人"
                  />
                </div>
              </div>
              <div class="choose-container">
                <div
                  v-for="(memberItem, memberIndex) in searchMemberList"
                  :key="`memberItem-${memberIndex}`"
                  :style="{
                    background:
                      executorInfo.userKey === memberItem.userKey ? '#eee' : '',
                  }"
                  v-close-popup
                  class="choose-container-item"
                  @click="executorInfo = memberItem"
                >
                  <div>
                    {{ memberItem.userName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-menu>
      </div>
      <div class="create-task-filter">
        <q-space />
        <q-select
          outlined
          v-model="type"
          :options="[
            { key: 0, value: '全部' },
            { key: 1, value: '未完成' },
            { key: 2, value: '指派他人' },
            { key: 3, value: '已完成' },
          ]"
          :option-value="(opt) => opt.key"
          :option-label="(opt) => opt.value"
          style="width: 120px"
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
    >
      <template
        v-for="(taskItem, taskIndex) in taskList"
        :key="`taskItem${taskIndex}`"
      >
        <FileCard :card="taskItem" :taskIndex="taskIndex" type="taskBox" />
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
    border: 1px solid $grey-5;
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
    border: 1px solid $grey-5;
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
  width: 580px;
  height: 60vh;
  @include p-number(10px, 10px);
  @include flex(space-between, center, null);
  .create-choose {
    width: 50%;
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
}
</style>
