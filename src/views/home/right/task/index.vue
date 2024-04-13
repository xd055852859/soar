<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import TeamTree from "@/components/tree/tree.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import Icon from "@/components/common/Icon.vue";

import FileCard from "@/components/fileCard/fileCard.vue";
import search from "@/components/search/search.vue";
const dayjs: any = inject("dayjs");
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { token, user } = storeToRefs(appStore.authStore);
const { mateList } = storeToRefs(appStore.mateStore);
const { setTeamKey } = appStore.teamStore;
const { setIframeVisible } = appStore.commonStore;
const nodeKey = ref<string>("");
const nodeInfo = ref<any>(null);
const taskTab = ref<string>("execute");
const taskList = ref<any>([]);
const searchMemberList = ref<any>([]);
const lineIndex = ref<number>(0);
const taskLineIndex = ref<number>(0);
const taskUser = ref<any>(null);
const searchName = ref<string>("");

const getTaskList = async () => {
  let taskRes = (await api.request.get("task/team", {
    teamKey: spaceKey.value,
    targetUserKey: taskUser.value._key
      ? taskUser.value._key
      : taskUser.value.userKey,
    type: taskTab.value,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "update":
      taskList.value[detail.boxIndex].taskList[detail.taskIndex] = {
        ...taskList.value[detail.boxIndex].taskList[detail.taskIndex],
        ...detail,
      };
      break;
    case "delete":
    taskList.value[detail.boxIndex].taskList.splice(detail.taskIndex, 1);
      break;
  }
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
watchEffect(() => {
  if (user.value && mateList.value) {
    let memberList: any = [];
    if (searchName.value) {
      // let list = _.cloneDeep(searchMemberList);
      memberList = [user.value, ...mateList.value].filter((item) => {
        return item.userName && item.userName.indexOf(searchName.value) !== -1;
      });
    } else {
      memberList = [user.value, ...mateList.value];
    }
    searchMemberList.value = memberList;
    console.log(memberList);
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
                    {{ item?.userName }}
                  </div></q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </div>
        <div class="q-ml-lg">
          <q-tabs
            dense
            v-model="taskTab"
            active-color="primary"
            class="text-grey-7"
          >
            <q-tab name="execute" label="执行" style="width: 60px" />
            <q-tab name="create" label="创建" style="width: 60px" />
          </q-tabs>
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
          <!-- <div>
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
          </div> -->
        </div>
        <div class="taskItem-bottom">
          <template
            v-for="(taskItem, taskIndex) in item.taskList"
            :key="`taskItem${taskIndex}`"
          >
            <FileCard
              :card="taskItem"
              :boxIndex="lineIndex"
              :taskIndex="taskIndex"
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
