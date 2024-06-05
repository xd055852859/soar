<script setup lang="ts">
import cOutLoading from "@/components/common/cOutLoading.vue";
import { useDebounceFn } from "@vueuse/core";
import { ResultProps } from "@/interface/Common";
import { commonscroll } from "@/services/util/common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { typeIcon } from "@/services/config/config";
import CIcon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";
import Task from "@/components/task/task.vue";
import File from "@/components/file/file.vue";
import Icon from "@/components/common/Icon.vue";
import router from "@/router";
import _ from "lodash";

const { spaceKey, spaceRole, privateTeamKey } = storeToRefs(
  appStore.spaceStore,
);
const { tabSearchVisible } = storeToRefs(appStore.teamStore);
const {
  setTargetTeamKey,
  setTeamKey,
  setTeamList,
  setTeamFoldList,
  setTabSearchVisible,
} = appStore.teamStore;

const fileList = ref<any>([]);
const fileKey = ref<string>("");
const tabInput = ref<string>("");
const searchInput = ref<string>("");
const sortType = ref<string>("view");
const page = ref<number>(1);
const total = ref<number>(0);
const loading = ref<boolean>(false);
const getFileList = async () => {
  loading.value = true;
  let fileRes = (await api.request.get("knowledgeBase/card", {
    teamKey: spaceKey.value,
    projectKey: "",
    sortBy: sortType.value,
    keyword: searchInput.value,
    page: page.value,
    limit: 30,
    cardType: "docFile",
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    loading.value = false;
    if (page.value === 1) {
      fileList.value = [];
    }
    fileRes.data.forEach((item) => {
      item.icon = typeIcon[item.type];
    });
    fileList.value = [...fileList.value, ...fileRes.data];
    total.value = fileRes.total as number;
  }
};
const searchResource = useDebounceFn(() => {
  searchInput.value = tabInput.value;
}, 1000);
watch(sortType, () => {
  page.value = 1;
});
const chooseResource = (fileItem) => {
  fileKey.value = fileItem._key;
  if (tabSearchVisible) {
    let index = _.findIndex(fileList.value, {
      _key: fileItem._key,
    });
    console.log(index);
    if (index !== -1) {
      fileList.value.splice(index, 1);
      fileList.value.unshift(fileItem);
    }
    setTabSearchVisible(false);
  }
};
watchEffect(() => {
  if (spaceKey.value) {
    page.value = 1;
    getFileList();
  }
});
watch(tabSearchVisible, (visible) => {
  if (!visible) {
    searchInput.value = "";
  }
});
</script>
<template>
  <div class="resourceMenu" :style="{ zIndex: tabSearchVisible ? 10 : 1 }">
    <c-out-loading :visible="loading" />
    <div class="leftMenu-title">
      <div class="leftMenu-title-left"></div>
      <div class="leftMenu-title-right">
        <q-btn flat round @click="setTabSearchVisible(!tabSearchVisible)">
          <Icon name="sousuo" :size="20" />
        </q-btn>
        <q-btn
          flat
          round
          @click="
            setTeamKey(privateTeamKey);
            setTargetTeamKey(privateTeamKey);
            $router.push(`/home/team`);
          "
        >
          <c-Icon name="a-chuangjian2" :size="20" />
        </q-btn>
      </div>
    </div>
    <div
      class="resourceMenu-list"
      @scroll="
        commonscroll($event, fileList, total, () => {
          page++;
        })
      "
    >
      <template v-if="fileList.length > 0">
        <div
          v-for="(item, index) in fileList"
          :key="`file${index}`"
          @click="chooseResource(item)"
        >
          <File :file="item" :fileIndex="index" :fileKey="fileKey" />
        </div>
      </template>
      <c-empty title="暂无资源" v-else />
    </div>
    <div class="team-searchInput" id="teamSearchInput" v-if="tabSearchVisible">
      <q-input
        outlined
        dense
        autofocus
        v-model="tabInput"
        class="full-width"
        clearable
        @update:model-value="searchResource"
      />
    </div>
  </div>
</template>
<style scoped lang="scss">
.resourceMenu {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 0px;
  }
}
.resourceMenu-list {
  width: 100%;
  height: calc(100% - 50px);
  @include scroll();
}
</style>
<style></style>
