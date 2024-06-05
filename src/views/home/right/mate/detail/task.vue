<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { commonscroll, setMessage } from "@/services/util/common";
import File from "@/components/file/file.vue";
import Task from "@/components/task/task.vue";
import CEmpty from "@/components/common/cEmpty.vue";
const { spaceKey, privateTeamKey } = storeToRefs(appStore.spaceStore);
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const { setTeamKey } = appStore.teamStore;
const mateTab = ref<string>("task");
const mateTeamKey = ref<string>("");
const mateTeamList = ref<any>([]);
const mateJoinList = ref<any>([]);
const mateCardList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const getMateTeam = async () => {
  let detailRes = (await api.request.get("teamMate/project", {
    teamKey: spaceKey.value,
    mateKey: mateKey.value,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    mateTeamList.value = [...detailRes.data.cooperateList];
    mateJoinList.value = [...detailRes.data.notJoinedList];
    total.value = detailRes.total as number;
    mateTeamKey.value = mateTeamList.value[0]._key;
  }
};

const getMateCard = async () => {
  let detailRes = (await api.request.get("teamMate/card", {
    teamKey: spaceKey.value,
    projectKey: mateTeamKey.value,
    mateKey: mateKey.value,
    filterType: mateTab.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    if (page.value === 1) {
      mateCardList.value = [];
    }
    mateCardList.value = [...mateCardList.value, ...detailRes.data];
    total.value = detailRes.total as number;
    console.log(mateCardList.value);
  }
};
const joinTeam = async (key) => {
  let joinRes = (await api.request.post("projectMember/apply", {
    projectKey: key,
  })) as ResultProps;
  if (joinRes.msg === "OK") {
    setMessage("success", "申请加入成功");
    // mateTeamList.value = [...detailRes.data.cooperateList];
    // mateJoinList.value = [...detailRes.data.notJoinedList];
    // total.value = detailRes.total as number;
    // mateTeamKey.value = mateTeamList.value[0]._key;
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "update":
      mateCardList.value[detail.taskIndex] = {
        ...mateCardList.value[detail.taskIndex],
        ...detail,
      };
      break;
    case "delete":
      mateCardList.value.splice(detail.taskIndex, 1);
      break;
  }
};
watch(
  mateKey,
  (newKey) => {
    if (newKey) {
      getMateTeam();
    }
  },
  { immediate: true },
);
watch(
  mateKey,
  (newKey) => {
    if (newKey) {
      getMateTeam();
    }
  },
  { immediate: true },
);
watch(mateTab, () => {
  page.value = 1;
  getMateCard();
});
watchEffect(() => {
  if (spaceKey.value && mateTeamKey.value) {
    getMateCard();
  }
});
</script>
<template>
  <div class="mateTask">
    <div class="mateTask-left">
      <div class="mateTask-left-title">协作群</div>
      <div class="mateTask-left-list">
        <div
          class="mateTask-list-item icon-point bor"
          v-for="(item, index) in mateTeamList"
          :key="`team${index}`"
          @click="mateTeamKey = item._key"
          :style="mateTeamKey === item._key ? { background: '#eee' } : null"
        >
          # {{ item.name }}
        </div>
      </div>
      <div class="mateTask-left-title">我未加入</div>
      <div class="mateTask-left-list">
        <template v-for="(item, index) in mateJoinList" :key="`team${index}`">
          <div
            class="mateTask-list-item icon-point"
            v-if="item._key !== privateTeamKey"
          >
            <div># {{ item.name }}</div>
            <div @click="joinTeam(item._key)">
              <q-btn color="primary" flat label="申请加入" size="12px" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="mateTask-right">
      <q-tabs
        v-model="mateTab"
        dense
        align="left"
        indicator-color="primary"
        active-class="text-primary"
      >
        <q-tab name="task" label="任务" />
        <q-tab name="doc" label="文档" />
      </q-tabs>

      <div
        class="mateTask-right-box"
        @scroll="
          commonscroll($event, mateCardList, total, () => {
            page++;
          })
        "
      >
        <template v-if="mateCardList.length > 0">
          <template v-for="(item, index) in mateCardList" :key="`file${index}`">
            <Task
              :card="item"
              :boxIndex="index"
              :taskIndex="index"
              @chooseCard="chooseCard"
              v-if="mateTab === 'task'"
            />
            <File :file="item" :fileIndex="index" v-else />
          </template>
        </template>
        <div v-else style="width: 100%; height: 250px">
          <c-empty :title="mateTab === 'task' ? '暂无任务' : '暂无文档'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mateTask {
  width: 100%;
  height: calc(100% - 50px);
  @include flex(space-between, center, null);
  .mateTask-left {
    width: 320px;
    height: 100%;
    @include p-number(10px);
    .mateTask-left-title {
      width: 100%;
      height: 40px;
    }
    .mateTask-left-list {
      width: 100%;
      .mateTask-list-item {
        width: 100%;
        height: 40px;
        @include flex(flex-start, center, null);
        @include p-number(0, 10px);
        &:hover {
          background-color: #eee;
        }
      }
    }
  }
  .mateTask-right {
    width: calc(100% - 320px);
    height: 100%;
    .mateTask-right-box {
      width: 100%;
      height: calc(100% - 50px);
      @include p-number(10px);
    }
  }
}
</style>
