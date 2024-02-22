<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import TeamTree from "@/components/tree/tree.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import Icon from "@/components/common/Icon.vue";
import TeamTask from "../team/tab/teamTask.vue";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setTeamKey } = appStore.teamStore;
const { setCardKey, setCardVisible } = appStore.cardStore;
const nodeKey = ref<string>("");
const taskTab = ref<string>("tree");
const taskList = ref<any>([]);
const taskIndex = ref<number>(0);
const { treeVisible } = storeToRefs(appStore.cardStore);
const getTaskList = async () => {
  let taskRes = (await api.request.get("card/work", {
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
  }
};
const chooseCard = (detail, index) => {
  nodeKey.value = detail._key;
  setTeamKey(detail.projectInfo._key);
  taskIndex.value = index;
};
const chooseTaskTree = (detail) => {
  setCardKey(detail._key);
  setCardVisible(true, "tasktree");
};
watchEffect(() => {
  if (spaceKey.value) {
    getTaskList();
  }
});
</script>
<template>
  <div class="task">
    <cHeader title="事务">
      <template #subtitle>
        <div
          class="icon-point q-ml-lg dp--center"
          v-if="taskList"
          style="height: 40px"
        >
          # {{ taskList[taskIndex]?.projectInfo?.name }} /
          {{ taskList[taskIndex]?.title }}
          <Icon name="a-xiala2" :size="8" class="q-ml-sm" />
          <q-menu anchor="bottom middle" self="top middle" class="q-pa-sm">
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                v-for="(item, index) in taskList"
                :key="`searchTask${index}`"
                clickable
                v-close-popup
                @click="chooseCard(item, index)"
              >
                <q-item-section>
                  <div class="dp--center">
                    <q-btn
                      flat
                      round
                      size="9px"
                      class="q-mr-sm"
                      @click="chooseTaskTree(item)"
                    >
                      <Icon
                        name="a-mokexiaoshumiao-weixinyuan2"
                        :size="18"
                        :color="
                          item.iconStatus === 2
                            ? '#ffc107'
                            : item.iconStatus === 3
                            ? 'red'
                            : 'green'
                        "
                      />
                    </q-btn>
                    # {{ item.projectInfo?.name }} / {{ item.title }}
                  </div></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </template>
    </cHeader>
    <q-tabs
      v-model="taskTab"
      dense
      align="left"
      indicator-color="primary"
      active-class="text-primary"
    >
      <q-tab name="tree" label="任务树" />
      <q-tab name="doc" label="看板" />
      <!-- <q-tab name="mails" label="知识库" /> -->
      <!-- <q-tab name="mails" label="多维表" /> -->
      <!-- <q-tab name="mails" label="洞察" /> -->
    </q-tabs>
    <div class="task-box">
      <template v-if="nodeKey">
        <TeamTree
          :cardKey="nodeKey"
          ref="treeRef"
          v-if="!treeVisible && taskTab === 'tree'"
        />
        <TeamTask :nodeKey="nodeKey" v-else-if="taskTab === 'doc'" />
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  height: 100%;
  .task-box {
    width: 100%;
    height: calc(100% - 105px);
    background-color: #fff;
  }
}
</style>
<style></style>
