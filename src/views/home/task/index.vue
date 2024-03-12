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
import search from "@/components/search/search.vue";
const { spaceKey, spaceMemberList } = storeToRefs(appStore.spaceStore);
const { token } = storeToRefs(appStore.authStore);
const { setTeamKey } = appStore.teamStore;
const { setCardKey, setCardVisible } = appStore.cardStore;
const { setIframeVisible } = appStore.commonStore;
const nodeKey = ref<string>("");
const taskTab = ref<string>("tree");
const taskList = ref<any>([]);
const searchMemberList = ref<any>([]);
const taskIndex = ref<number>(0);
const taskUser = ref<any>(null);
const searchName = ref<string>("");
const { user } = storeToRefs(appStore.authStore);
const { treeVisible } = storeToRefs(appStore.cardStore);

const getTaskList = async () => {
  let taskRes = (await api.request.get("task/team", {
    teamKey: spaceKey.value,
    targetUserKey: taskUser.value._key
      ? taskUser.value._key
      : taskUser.value.userKey,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
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
  console.log(taskUser.value);
  if (spaceKey.value && taskUser.value) {
    getTaskList();
  }
});
watchEffect(() => {
  if (user.value && !taskUser.value) {
    taskUser.value = { ...user.value };
  }
});
watch(
  searchName,
  (newName) => {
    let memberList: any = [];
    if (newName) {
      // let list = _.cloneDeep(searchMemberList);
      memberList = spaceMemberList.value.filter((item) => {
        return item.userName && item.userName.indexOf(newName) !== -1;
      });
    } else {
      memberList = [...spaceMemberList.value];
    }
    searchMemberList.value = memberList;
  },
  { immediate: true, deep: true }
);
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
            <q-input
              dense
              outlined
              v-model="searchName"
              class="full-width q-my-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                v-for="(item, index) in searchMemberList"
                :key="`searchTask${index}`"
                clickable
                v-close-popup
                @click="taskUser = item"
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
          <div>{{ item.projectName }} / {{ item.title }}</div>
          <div>
            <q-btn
              round
              flat
              size="16px"
              @click="
                setIframeVisible(true, {
                  url: `https://soar.cn/base/#/login?token=${token}&redirectPath=node/${item._key}`,
                  title: item.title,
                })
              "
            >
              <Icon name="quanping_o" :size="20" />
            </q-btn>
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
    height: calc(100% - 68px);
    overflow-x: auto;
    overflow-y: hidden;
    background: #f2f3f6;
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
  }
}
</style>
<style></style>
