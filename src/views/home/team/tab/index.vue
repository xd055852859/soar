<script setup lang="ts">
import appStore from "@/store";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import FileCard from "@/components/fileCard/fileCard.vue";
import { ResultProps } from "@/interface/Common";
const { teamInfo, teamMemberList, teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);

const fileList = ref<any>([]);
const taskList = ref<any>([]);
const homeRef = ref<any>(null);
onMounted(() => {});
const getFileList = async () => {
  let fileRes = (await api.request.get("knowledgeBase/card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    sortBy: "update",
    page: 1,
    limit: 10,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    fileList.value = [...fileRes.data];
  }
};
const getTaskList = async () => {
  let taskRes = (await api.request.get("task/create", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    page: 1,
    limit: 10,
  })) as ResultProps;
  if (taskRes.msg === "OK") {
    taskList.value = [...taskRes.data];
  }
};
const chooseCard = () => {};
watchEffect(() => {
  if (spaceKey.value && teamKey.value) {
    getFileList();
    getTaskList();
  }
});
</script>

<template>
  <div class="team-home" ref="homeRef">
    <div class="team-home-left"></div>
    <div class="team-home-right" v-if="homeRef">
      <q-list>
        <q-expansion-item
          group="team"
          expand-separator
          label="群公告"
          default-opened
          header-class="text-bold text-subtitle1"
        >
          <div
            class="team-right-box"
            :style="{ maxHeight: homeRef.offsetHeight - 190 + 'px' }"
          >
            {{ teamInfo?.memo }}
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="team"
          expand-separator
          label="最新文档"
          header-class="text-bold text-subtitle1"
        >
          <div
            class="team-right-box"
            :style="{ maxHeight: homeRef.offsetHeight - 190 + 'px' }"
          >
            <template
              v-for="(fileItem, fileIndex) in fileList"
              :key="`fileItem${fileIndex}`"
            >
              <FileCard :card="fileItem" type="file" @chooseCard="chooseCard" />
            </template>
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="team"
          expand-separator
          label="最近任务"
          header-class="text-bold text-subtitle1"
        >
          <div
            class="team-right-box"
            :style="{ maxHeight: homeRef.offsetHeight - 190 + 'px' }"
          >
            <template
              v-for="(taskItem, taskIndex) in taskList"
              :key="`taskItem${fileIndex}`"
            >
              <FileCard
                :card="taskItem"
                type="taskBox"
                @chooseCard="chooseCard"
              />
            </template>
          </div>
        </q-expansion-item>
        <q-expansion-item
          group="team"
          expand-separator
          label="群成员"
          header-class="text-bold text-subtitle1"
        >
          <div
            class="team-right-box"
            :style="{ maxHeight: homeRef.offsetHeight - 190 + 'px' }"
          >
            <q-list>
              <q-item
                v-for="(memberItem, memberIndex) in teamMemberList"
                :key="`memberItem${memberIndex}`"
              >
                <div class="dp--center">
                  <q-avatar color="#fff" size="30px" class="q-mr-md">
                    <img
                      :src="
                        memberItem?.userAvatar
                          ? memberItem.userAvatar
                          : '/common/defaultPerson.png'
                      "
                    />
                  </q-avatar>
                  <div class="member-item-nickName">
                    {{ memberItem.userName }}
                  </div>
                </div>
              </q-item>
            </q-list>
          </div>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<style scoped lang="scss">
.team-home {
  width: 100%;
  height: 100%;
  @include flex(space-between, center, null);

  .team-home-left {
    width: calc(100% - 300px);
    height: 100%;
  }

  .team-home-right {
    width: 300px;
    height: 100%;
    border-left: 1px solid $grey-4;

    .team-right-box {
      width: 100%;
      min-height: 50px;
      padding: 5px 10px 0px 15px;
      box-sizing: border-box;
      @include scroll();
    }
  }
}
</style>

<style></style>
