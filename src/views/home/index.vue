<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import cDialog from "@/components/common/cDialog.vue";
import TeamTree from "@/components/tree/tree.vue";
import TaskBoard from "@/views/home/task/taskBoard/index.vue";
import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Left from "./left/left.vue";
import Icon from "@/components/common/Icon.vue";
import Search from "@/components/search/search.vue";

import FilePreview from "@/components/note/FilePreview.vue";
import Editor from "@/components/note/Editor.vue";
import DocPreview from "./team/tab/docPreview.vue";
const { closeNum, iframeInfo, iframeVisible, searchVisible } = storeToRefs(
  appStore.commonStore
);

const { spaceKey, spaceMessageNum } = storeToRefs(appStore.spaceStore);
const {
  cardKey,
  cardInfo,
  treeVisible,
  docVisible,
  docUrl,
  fileVisible,
  noteVisible,
} = storeToRefs(appStore.cardStore);
const { note } = storeToRefs(appStore.noteStore);
const { getTeamList, getTeamFoldList } = appStore.teamStore;
const { setSpaceKey } = appStore.spaceStore;
const { setCardVisible } = appStore.cardStore;
const { setClose, setIframeVisible, setSearchVisible } = appStore.commonStore;
const showButton = ref<boolean>(false);
const route = useRoute();
// const outSpace = (index) => {
//   ElMessageBox.confirm("是否退出该空间", "退出空间", {
//     confirmButtonText: "确认",
//     cancelButtonText: "取消",
//   }).then(async () => {
//     let outRes = (await api.request.delete("spaceMember/exit", {
//       spaceKey: spaceKey.value,
//     })) as ResultProps;
//     if (outRes.msg === "OK") {
//       ElMessage.success("退出空间成功");
//       const list = _.cloneDeep(spaceList.value);
//       list.splice(index, 1);
//       setSpaceKey(list[0]._key);
//       setSpaceList(list);
//     }
//   });
// };

watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      setSpaceKey(newKey);
      getTeamList(newKey);
      getTeamFoldList(newKey);
    }
  },
  { immediate: true }
);
// watch(route, () => {
//   setCardKey("");
//   setCardInfo(null);
// });
</script>
<template>
  <div
    class="home"
    :class="{
      homeLeft: closeNum === -1,
      homeRight: closeNum === -2,
      moveLeft: closeNum === 0,
      moveRight: closeNum === 1,
    }"
  >
    <div
      class="left"
      @mouseenter="showButton = true"
      @mouseleave="showButton = false"
    >
      <div class="left-arrow-button">
        <q-btn round @click="setClose(0)" size="12px" v-if="showButton">
          <Icon name="a-shousuo2" :size="36" :style="{ marginTop: '5px' }" />
        </q-btn>
      </div>
      <q-btn
        flat
        round
        @click.stop="$router.push('/home/notice')"
        size="11px"
        class="left-notice-button"
      >
        <q-badge floating rounded color="red" v-if="spaceMessageNum">{{
          spaceMessageNum
        }}</q-badge>
        <Icon name="xiaoxi1" :size="20" />
      </q-btn>
      <Left />
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
  <c-dialog
    :visible="searchVisible"
    title="搜索文件"
    @close="setSearchVisible(false)"
    :dialogStyle="{ width: '550px' }"
  >
    <template #content><Search /></template>
  </c-dialog>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="iframeVisible">
      <q-btn
        round
        flat
        size="16px"
        class="card-back"
        @click="setIframeVisible(false, null)"
      >
        <Icon name="a-fanhuikongjian21" :size="20" />
      </q-btn>
      <!-- <TaskBoard
        :targetKey="iframeInfo.userKey"
        :targetTag="iframeInfo.planTag"
      /> -->
      <c-iframe :url="iframeInfo.url" :title="iframeInfo.title" />
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.home {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  z-index: 10;
  @include flex(space-between, center, null);

  .left {
    width: 300px;
    height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    background: #fafafb;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: absolute;
    z-index: 2;
    left: 0px;
    top: 0px;
    display: flex;
    flex-direction: column;
    @include p-number(0px, 10px);
    .left-arrow-button {
      width: 100px;
      position: absolute;
      z-index: 2;
      top: 14px;
      right: -80px;
    }
    .left-notice-button {
      position: absolute;
      z-index: 2;
      top: 20px;
      right: 18px;
      cursor: pointer;
    }
  }
  .right {
    flex: 1;
    height: 100vh;
    position: relative;
    background: #f2f3f6;
    z-index: 1;
    width: 0px;
    // @include p-number(15px, 35px);
  }
}

.card-fullDialog {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 9999;
  top: 0px;
  left: 0px;
  background-color: #fff;
  @include scroll();
  .card-back {
    position: absolute;
    z-index: 20;
    top: 5px;
    left: 10px;
  }
}
.homeLeft {
  padding-left: 300px;
  .left {
    left: 0px;
  }
}
.homeRight {
  padding-left: 0px;
  .left {
    left: -300px;
  }
}
.moveLeft {
  animation: toLeft 0.5s forwards;
  .left {
    animation: moveLeft 0.5s forwards;
  }
}
.moveRight {
  animation: toRight 0.5s forwards;
  .left {
    animation: moveRight 0.5s forwards;
  }
}
</style>

<style>
@keyframes moveLeft {
  0% {
    left: 0px;
  }
  100% {
    left: -300px;
  }
}
@keyframes moveRight {
  0% {
    left: -300px;
  }
  100% {
    left: 0px;
  }
}
@keyframes toLeft {
  0% {
    padding-left: 300px;
  }
  100% {
    padding-left: 0px;
  }
}
@keyframes toRight {
  0% {
    padding-left: 0px;
  }
  100% {
    padding-left: 300px;
  }
}
</style>
