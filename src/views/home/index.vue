<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import TeamTree from "@/components/tree/tree.vue";
import TaskBoard from "@/views/home/task/index.vue";
import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Left from "./left/left.vue";
import Icon from "@/components/common/Icon.vue";
import FilePreview from "@/components/note/FilePreview.vue";
const { closeNum, iframeTaskInfo, iframeTaskVisible } = storeToRefs(
  appStore.commonStore
);

const { spaceKey } = storeToRefs(appStore.spaceStore);
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
const { setCardVisible, setCardKey, setCardInfo } = appStore.cardStore;
const { setClose } = appStore.commonStore;
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
    <div class="left">
      <q-btn flat round class="left-arrow-button" @click="setClose(0)" size="10px">
        <Icon name="a-shousuo2" :size="30" />
      </q-btn>
      <Icon
        name="a-xiaoxi2"
        class="left-notice-button"
        :size="16"
        @click.stop="$router.push('/home/notice')"
      />
      <Left />
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="treeVisible" style="z-index: 10">
      <q-btn
        color="primary"
        round
        icon="navigate_before"
        class="card-back"
        @click="setCardVisible(false, 'tasktree')"
      />
      <TeamTree :cardKey="cardKey" ref="treeRef" viewType="tree" />
    </div>
  </Teleport>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="docVisible" style="z-index: 20">
      <q-btn
        round
        color="primary"
        icon="navigate_before"
        class="card-back"
        @click="setCardVisible(false, 'doc')"
      />
      <c-iframe :url="docUrl" :title="cardInfo.title" v-if="cardInfo" />
    </div>
  </Teleport>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="fileVisible" style="z-index: 20">
      <q-btn
        round
        color="primary"
        icon="navigate_before"
        class="card-back"
        @click="setCardVisible(false, 'file')"
      />
      <FilePreview
        :file-url="cardInfo.url"
        :name="cardInfo.title"
        :fileType="cardInfo.fileType"
        v-if="cardInfo"
      />
    </div>
  </Teleport>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="iframeTaskVisible" style="z-index: 20">
      <q-btn
        round
        color="primary"
        icon="navigate_before"
        class="card-back"
        @click="setCardVisible(false, 'file')"
      />
      <TaskBoard
        :targetKey="iframeTaskInfo.userKey"
        :targetTag="iframeTaskInfo.planTag"
      />
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
    @include p-number(5px, 25px);
    .left-arrow-button{
      position: absolute;
      z-index: 2;
      top: 20px;
      right: 0px;
    }
    .left-notice-button {
      position: absolute;
      z-index: 2;
      top: 23px;
      right: 35px;
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
  z-index: 10;
  top: 0px;
  left: 0px;
  background-color: #fff;
  .card-back {
    position: absolute;
    z-index: 20;
    top: 10px;
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
