<script setup lang="ts">
import api from "@/services/api";
import TeamTree from "./teamTree.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
import { useQuasar } from "quasar";
import _ from "lodash";
import riverChart from "@/components/chart/riverChart.vue";
const { teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const detailVisible = ref<boolean>(false);
const taskDetail = ref<any>(null);
const taskList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const treeRef = ref<any>(null);
const nodeKey = ref<string>("");
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);
const nameArray = [
  {
    label: "全部文件",
    key: "totalDoc",
  },
  {
    label: "全部文档",
    key: "totalFile",
  },
  {
    label: "全部任务",
    key: "totalTask",
  },
  {
    label: "全部完成",
    key: "totalFinish",
  },
];
const $q = useQuasar();
onMounted(() => {
  getChartData();
});
const addTask = async () => {
  $q.dialog({
    title: "事务树标题",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk(async (data) => {
    let taskRes = (await api.request.post("card", {
      projectKey: teamKey.value,
      type: "taskTree",
      title: data,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      setMessage("success", `创建事务树成功`);
      taskDetail.value = taskRes.data;
      detailVisible.value = true;
    }
  });
};
const getTaskList = async () => {
  let taskRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    cardType: "taskTree",
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
    total.value = taskRes.total as number;
  }
};
const getChartData = async () => {
  let taskRes = (await api.request.get("user/active", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    let taskArr = taskRes.data.map((item) => {
      let arr: any = [];
      for (let key in item) {
        if (key !== "time") {
          arr.push([
            item.time,
            item[key],
            nameArray[_.findIndex(nameArray, { key: key })].label,
          ]);
          if (
            chartName.value.indexOf(
              nameArray[_.findIndex(nameArray, { key: key })].label
            ) === -1
          ) {
            chartName.value.push(
              nameArray[_.findIndex(nameArray, { key: key })].label
            );
          }
        }
      }
      return arr;
    });
    chartData.value = _.flatten(taskArr);
    console.log(chartName.value);
  }
};
const chooseTask = (detail) => {
  taskDetail.value = detail;
  nodeKey.value = detail._key;
};
watchEffect(() => {
  getTaskList();
});
</script>
<template>
  <div class="teamTask">
    <div class="teamTask-header">
      <q-btn
        color="primary"
        label="创建事务树"
        dense
        style="width: 120px"
        @click="addTask"
      />
    </div>
    <div class="teamTask-box">
      <div class="teamTask-box-left">
        <q-card
          v-for="(item, index) in taskList"
          :key="`file${index}`"
          class="teamTask-box-container q-mb-md icon-point"
          @click="chooseTask(item)"
        >
          <q-card-section class="full-width teamTask-box-top">
            {{ item.title }}
            <q-icon name="send" size="20px" @click="detailVisible = true" />
          </q-card-section>
          <q-card-section class="teamTask-box-bottom">
            <q-circular-progress
              v-for="(taskItem, taskIndex) in item.treeMember"
              :key="`taskProgress${taskIndex}`"
              show-value
              font-size="10px"
              class="q-mr-sm"
              :value="
                taskItem.totalTask === 0
                  ? 0
                  : (taskItem.finishTask / taskItem.totalTask) * 100
              "
              size="45px"
              :thickness="0.25"
              color="primary"
              track-color="grey-3"
            >
              <q-avatar size="35px">
                <img
                  :src="
                    taskItem.userAvatar
                      ? taskItem.userAvatar
                      : '/common/defaultPerson.png'
                  "
                />
              </q-avatar>
            </q-circular-progress>
          </q-card-section>
        </q-card>
      </div>
      <div class="teamTask-box-right">
        <TeamTree
          :cardKey="nodeKey"
          ref="treeRef"
          viewType="mind-single"
          v-if="nodeKey"
        />
        <riverChart
          riverId="taskRiver"
          :chartData="chartData"
          :chartName="chartName"
          v-else-if="chartData"
        />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="teamTask-detail" v-if="detailVisible">
      <TeamTree :cardKey="taskDetail._key" ref="treeRef" viewType="tree" />
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.teamTask {
  width: 100%;
  height: 100%;
  .teamTask-header {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
  .teamTask-box {
    width: 100%;
    height: calc(100% - 50px);
    @include flex(space-between, center, null);
    .teamTask-box-left {
      width: 30%;
      height: 100%;
      @include p-number(10px, 10px);
      @include scroll();
      .teamTask-box-top {
        width: 100%;
        height: 30px;
        @include flex(space-between, center, null);
      }
      .teamTask-box-bottom {
        width: 100%;
        height: 80px;
        @include scroll();
        @include flex(flex-start, center, null);
      }
    }
    .teamTask-box-right {
      width: 70%;
      height: 100%;
    }
  }
}
.teamTask-detail {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0px;
  background-color: #fff;
}
</style>
<style></style>
