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

const taskList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const treeRef = ref<any>(null);
const nodeKey = ref<string>("");
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);
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
      taskList.value.push(taskRes.data);
      nodeKey.value = taskRes.data._key;
      // taskDetail.value = taskRes.data;
      // detailVisible.value = true;
    }
  });
};
const getTaskList = async () => {
  let taskRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
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
    projectKey: props.type ? "" : teamKey.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    [chartData.value, chartName.value] = formatName(taskRes.data);
  }
};
const scrollTask = (e) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    taskList.value.length < total.value
  ) {
    page.value++;
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      nodeKey.value = detail._key;
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
  getTaskList();
});
</script>
<template>
  <div class="teamTask">
    <div class="teamTask-header" v-if="!type">
      <q-btn
        color="primary"
        label="创建事务树"
        dense
        style="width: 120px"
        @click="addTask"
      />
    </div>
    <div class="teamTask-box" :style="type ? { height: '100%' } : null">
      <div
        class="teamTask-box-left"
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
          />
        </template>
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
    }
    .teamTask-box-right {
      width: 70%;
      height: 100%;
    }
  }
}
</style>
<style></style>
