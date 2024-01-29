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
const props = defineProps<{
  type?: string;
}>();
const { teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { cardInfo } = storeToRefs(appStore.cardStore);
const { setCardKey } = appStore.cardStore;
const { setTeamKey } = appStore.teamStore;
const taskList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const treeRef = ref<any>(null);
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
  if (props.type) {
    taskRes = (await api.request.get("card/work", {
      teamKey: spaceKey.value,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      taskList.value = [...taskRes.data];
      if (taskRes.data.length > 0) {
        nodeKey.value = taskRes.data[0]._key;
        setTeamKey(taskRes.data[0].projectInfo._key);
        // setCardKey(taskRes.data[0]._key);
      }
      console.log(taskList.value);
      total.value = taskList.value.length;
    }
  } else {
    taskRes = (await api.request.get("card", {
      teamKey: spaceKey.value,
      projectKey: teamKey.value,
      cardType: "taskTree",
      page: page.value,
      limit: 30,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      if ((page.value = 1)) {
        taskList.value = [];
      }
      taskList.value = [...taskList.value, ...taskRes.data];
      total.value = taskRes.total as number;
    }
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
    <div class="teamTaskTree-header" v-if="!type">
      <q-btn
        color="primary"
        label="创建事务树"
        dense
        style="width: 120px"
        @click="addTask"
      />
      <q-btn
        flat
        icon="o_task_alt"
        color="primary"
        class="q-ml-sm"
        @click="$router.push('/home/team/task')"
      />
    </div>
    <div class="teamTaskTree-box" :style="type ? { height: '100%' } : null">
      <div
        class="teamTaskTree-box-left"
        @scroll="
          commonscroll($event, taskList, total, () => {
            page++;
          })
        "
      >
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
</template>
<style scoped lang="scss">
.teamTaskTree {
  width: 100%;
  height: 100%;
  @include p-number(10px, 25px);
  .teamTaskTree-header {
    width: 100%;
    height: 70px;
    @include flex(flex-start, center, null);
  }
  .teamTaskTree-box {
    width: 100%;
    height: calc(100% - 70px);
    @include flex(space-between, center, null);
    .teamTaskTree-box-left {
      width: 35%;
      height: 100%;
      position: relative;
      z-index: 1;
      @include p-number(10px, 10px);
      @include scroll();
    }
    .teamTaskTree-box-right {
      width: 65%;
      height: 100%;
      position: relative;
      z-index: 2;
      overflow: hidden;
    }
  }
}
</style>
<style></style>
