<script setup lang="ts">
import api from "@/services/api";
import fileCard from "@/components/fileCard/fileCard.vue";
import { storeToRefs } from "pinia";
import TeamTree from "@/components/tree/tree.vue";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { commonscroll, setMessage } from "@/services/util/common";
import { formatName, nameArray } from "@/services/config/config";
import { useQuasar } from "quasar";
import _ from "lodash";
import riverChart from "@/components/chart/riverChart.vue";
import Icon from "@/components/common/Icon.vue";
const props = defineProps<{
  type?: string;
}>();

const { teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { treeVisible } = storeToRefs(appStore.cardStore);
const { setCardKey } = appStore.cardStore;
const { setTeamKey } = appStore.teamStore;
const taskList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const nodeKey = ref<string>("");
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);

const $q = useQuasar();
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
      taskList.value.push(taskRes.data);
      nodeKey.value = taskRes.data._key;
      // taskDetail.value = taskRes.data;
      // detailVisible.value = true;
    }
  });
};
const getTaskList = async () => {
  let taskRes: any = null;
  taskRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    cardType: "taskTree",
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    if (page.value === 1) {
      taskList.value = [];
      if (taskRes.data.length > 0) {
        nodeKey.value = taskRes.data[0]._key;
        setTeamKey(taskRes.data[0].projectInfo._key);
        // setCardKey(taskRes.data[0]._key);
      }
    }
    taskList.value = [...taskList.value, ...taskRes.data];

    total.value = taskRes.total as number;
  }
};
const getChartData = async () => {
  let taskRes = (await api.request.get("user/active", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    [chartData.value, chartName.value] = formatName(taskRes.data);
  }
};

const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      nodeKey.value = detail._key;
      setTeamKey(detail.projectInfo._key);
      break;
    case "update":
      let updateIndex = _.findIndex(taskList.value, { _key: detail._key });
      if (updateIndex !== -1) {
        taskList.value[updateIndex] = {
          ...taskList.value[updateIndex],
          ...detail,
        };
      }
      break;
    case "delete":
      let delIndex = _.findIndex(taskList.value, { _key: detail._key });
      if (delIndex !== -1) {
        taskList.value.splice(delIndex, 1);
      }
      break;
  }
};
watchEffect(() => {
  if (spaceKey.value) {
    getTaskList();
  }
});
watchEffect(() => {
  if (!props.type && teamKey.value) {
    getChartData();
  }
});
</script>
<template>
  <div class="teamTaskTree">
    <div class="teamTaskTree-header">
      <q-btn
        color="primary"
        label="创建事务树"
        dense
        style="width: 120px"
        @click="addTask"
      />

    </div>
    
    <div class="teamTaskTree-box" :style="type ? { height: '100%' } : null">
      <!-- @scroll="
          commonscroll($event, taskList, total, () => {
            page++;
          })
        " -->
      <div class="teamTaskTree-box-left" v-if="!type">
        <template v-for="(item, index) in taskList" :key="`task${index}`">
          <fileCard
            :card="item"
            type="taskTree"
            @chooseCard="chooseCard"
            :outType="type"
            :chooseKey="nodeKey"
          />
        </template>
      </div>
      <div class="teamTaskTree-box-right">
        <TeamTree
          :cardKey="nodeKey"
          v-if="nodeKey && !treeVisible"
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
</template>
<style scoped lang="scss">
.teamTaskTree {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  // @include p-number(10px, 25px);
  .teamTaskTree-header {
    width: 150px;
    height: 70px;
    position: absolute;
    z-index: 5;
    top: -50px;
    right: 0px;
    @include flex(flex-end, center, null);
  }
  .teamTaskTree-out-header {
    height: 65px;
    position: absolute;
    z-index: 3;
    top: -100px;
    left: 110px;
    font-size: 16px;
    @include flex(flex-start, center, null);
  }
  .teamTaskTree-box {
    width: 100%;
    height: calc(100% - 10px);
    @include flex(space-between, center, null);
    .teamTaskTree-box-left {
      width: 350px;
      height: 100%;
      position: relative;
      z-index: 1;
      @include p-number(15px, 30px);
      @include scroll();
    }
    .teamTaskTree-box-right {
      flex: 1;
      height: 100%;
      position: relative;
      z-index: 2;
      overflow: hidden;
      background-color: #fff;
      margin-top: 25px;
      @include p-number(10px, 0px);
    }
  }
}
</style>
<style></style>
