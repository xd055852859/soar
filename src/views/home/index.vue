<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import TeamTree from "@/components/tree/tree.vue";
import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Left from "./left/left.vue";
import Icon from "@/components/common/Icon.vue";
import FilePreview from "@/components/note/FilePreview.vue";
const { closeNum } = storeToRefs(appStore.commonStore);

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
      <q-btn flat round class="left-arrow-button" @click="setClose(0)">
        <Icon name="a-shousuo2" :size="36" />
      </q-btn>
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
        v-if="cardInfo"
      />
    </div>
  </Teleport>
  <Teleport to="body">
    <div class="card-fullDialog" v-if="noteVisible" style="z-index: 20">
      <q-btn
        round
        color="primary"
        icon="navigate_before"
        class="card-back"
        @click="setCardVisible(false, 'file')"
      />
      <FilePreview :file-url="note.link!" :name="note.title" v-if="note" />
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
    width: 350px;
    height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    background-color: #f2f3f6;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: absolute;
    z-index: 2;
    left: 0px;
    top: 0px;
    @include p-number(25px, 10px);
    .left-arrow-button {
      position: absolute;
      z-index: 2;
      top: 14px;
      right: 0px;
    }
  }
  .right {
    flex: 1;
    height: 100vh;
    position: relative;
    background-color: #fafafb;
    z-index: 1;
    width: 0px;
    @include p-number(15px, 35px);
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
  padding-left: 350px;
  .left {
    left: 0px;
  }
}
.homeRight {
  padding-left: 0px;
  .left {
    left: -350px;
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
    left: -350px;
  }
}
@keyframes moveRight {
  0% {
    left: -350px;
  }
  100% {
    left: 0px;
  }
}
@keyframes toLeft {
  0% {
    padding-left: 350px;
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
    padding-left: 350px;
  }
}
</style>
