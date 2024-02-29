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
import FileCard from "@/components/fileCard/fileCard.vue";
const { spaceKey, spaceMemberList } = storeToRefs(appStore.spaceStore);
const { setTeamKey } = appStore.teamStore;
const { setCardKey, setCardVisible } = appStore.cardStore;
const nodeKey = ref<string>("");
const taskTab = ref<string>("tree");
const taskList = ref<any>([]);
const taskIndex = ref<number>(0);
const taskUser = ref<any>(null);
const { user } = storeToRefs(appStore.authStore);
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
watchEffect(() => {
  if (user.value && !taskUser.value) {
    taskUser.value = { ...user.value };
  }
});
</script>
<template>
  <div class="task">
    <cHeader title="事务">
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
            />
          </q-avatar>
          {{ taskUser.userName }}
          <Icon name="a-xiala2" :size="8" class="q-ml-sm" />
          <q-menu anchor="bottom middle" self="top middle" class="q-pa-sm">
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                v-for="(item, index) in spaceMemberList"
                :key="`searchTask${index}`"
                clickable
                v-close-popup
                @click="chooseCard(item, index)"
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
                      />
                    </q-avatar>
                    {{ item.userName }}
                  </div></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </template>
    </cHeader>
    <div class="task-box">
      <div
        class="taskItem-box"
        v-for="(item, index) in taskList"
        :key="`task${index}`"
      >
        <div class="taskItem-top">
          <div class="taskItem-top-left"></div>
          <div class="taskItem-top-right">
            <div>
              {{ item.userName }}{{ item.userKey === user?._key ? "(我)" : "" }}
            </div>
          </div>
        </div>
        <div class="taskItem-bottom">
          <template
            v-for="(taskItem, taskIndex) in item.taskList"
            :key="`taskItem${taskIndex}`"
          >
            <FileCard
              :card="taskItem"
              type="taskBox"
              @chooseCard="chooseCard"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  height: 100%;
  .task-box {
    min-width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    background: #f2f3f6;
    @include flex(flex-start, center, null);
    .taskItem-box {
      width: 455px;
      height: 100%;
      flex-shrink: 0;
      margin-right: 27px;
      .taskItem-top {
        width: 100%;
        /* prettier-ignore */
        height: 90Px;
        font-size: 14px;
        @include flex(center, center, null);
      }
      .taskItem-bottom {
        width: 100%;
        /* prettier-ignore */
        height: calc(100% - 90Px);
        @include scroll();
        @include p-number(10px, 10px);
      }
    }
  }
}
</style>
<style></style>
