<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cOutLoading from "@/components/common/cOutLoading.vue";
import Icon from "@/components/common/Icon.vue";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import CEmpty from "@/components/common/cEmpty.vue";
import TaskTreeBox from "@/components/task/taskTreeBox.vue";
import TaskMemberBox from "@/components/task/taskMemberBox.vue";
const { spaceKey, spaceInfo } = storeToRefs(appStore.spaceStore);
const { user } = storeToRefs(appStore.authStore);
const taskTab = ref<string>("execute");
const taskList = ref<any>([]);
const memberList = ref<any>([]);

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
    taskList.value = [...taskRes.data];
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
          <!--           @click="chooseTree(null)"-->
          <q-btn round flat size="16px">
            <Icon name="a-chuangjian2" :size="20" />
          </q-btn>
        </div>
      </template>
    </cHeader>
    <div class="task-bottom-box">
      <TaskTreeBox
        :task-list="taskList"
        :member-list="memberList"
        :task-tab="taskTab"
        @setChooseKey="(key) => (chooseKey = key)"
        v-if="taskTab !== 'relate'"
      />
      <TaskMemberBox
        :task-list="taskList"
        :member-list="memberList"
        @setChooseKey="(key) => (chooseKey = key)"
        v-else-if="taskTab === 'relate'"
      />
      <c-empty title="暂无任务" v-else />
    </div>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  .task-bottom-box {
    width: 100%;
    height: 100%;
  }
}
</style>
<style></style>
