<script setup lang="ts">
import cOutLoading from "@/components/common/cOutLoading.vue";
import { ResultProps } from "@/interface/Common";
import { commonscroll } from "@/services/util/common";
import api from "@/services/api";
import { Icon } from "@iconify/vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { typeIcon } from "@/services/config/config";
import _ from "lodash";
import CIcon from "@/components/common/Icon.vue";

const { teamKey } = storeToRefs(appStore.teamStore);
const { token } = storeToRefs(appStore.authStore);
const { spaceKey, spaceRole, privateTeamKey } = storeToRefs(
  appStore.spaceStore,
);
const { setTargetTeamKey, setTeamKey, setTeamList, setTeamFoldList } =
  appStore.teamStore;
const { setIframeDetail } = appStore.commonStore;

const fileList = ref<any>([]);
const fileKey = ref<string>("");
const fileOverKey = ref<string>("");
const detailState = ref<boolean>(false);
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
watch(sortType, () => {
  page.value = 1;
});
watchEffect(() => {
  if (spaceKey.value) {
    page.value = 1;
    getFileList();
  }
});
// watch(fileKey, (newKey) => {
//   if (newKey) {
//     iframeUrl.value = `https://soar.cn/base/#/login?token=${token.value}&redirectPath=node/${newKey}`;
//   }
// });
</script>
<template>
  <div class="resourceMenu">
    <!-- <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading> -->
    <c-out-loading :visible="loading" />
    <!-- <OnClickOutside @trigger="searchVibisible = false"> -->
    <div class="leftMenu-title">
      <div class="leftMenu-title-left"></div>
      <div class="leftMenu-title-right">
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
      <div
        class="resourceMenu-item"
        v-for="(item, index) in fileList"
        :key="`file${index}`"
        @click="
          setIframeDetail({
            url: `https://soar.cn/base/#/login?token=${token}&redirectPath=node/${item._key}`,
            title: item.title,
          });
          $router.push('/home/freedom');
          fileKey = item._key;
        "
        @mouseenter="fileOverKey = item._key"
        :style="{
          background: fileKey === item._key ? '#eee' : '',
        }"
      >
        <div
          class="resourceMenu-item-title icon-point"
          @click="$router.push(`/home/team`)"
        >
          <div class="dp--center" style="width: 100%">
            <Icon
              :icon="item.icon"
              width="20"
              height="20"
              color="#757575"
              class="q-mr-sm"
            />
            <div style="width: calc(100% - 30px)">{{ item.title }}</div>
          </div>
          <!--          <div class="resourceMenu-item-icon" v-if="fileOverKey === item._key">-->
          <!--            <q-btn flat round size="9px" @click.stop="">-->
          <!--              <c-Icon name="gengduo" :size="18" />-->
          <!--              <q-menu anchor="top right" self="top left" class="q-pa-sm">-->
          <!--                <q-list dense>-->
          <!--                  <q-item-->
          <!--                    clickable-->
          <!--                    v-close-popup-->
          <!--                    @click=""-->
          <!--                    v-if="item.role < 3"-->
          <!--                  >-->
          <!--                    <q-item-section class="common-title">编辑</q-item-section>-->
          <!--                  </q-item>-->
          <!--                  <q-item-->
          <!--                    clickable-->
          <!--                    v-close-popup-->
          <!--                    @click=""-->
          <!--                    v-if="item.role < 2"-->
          <!--                  >-->
          <!--                    <q-item-section class="common-title">删除</q-item-section>-->
          <!--                  </q-item>-->
          <!--                </q-list>-->
          <!--              </q-menu>-->
          <!--            </q-btn>-->
          <!--          </div>-->
        </div>

        <div class="resourceMenu-item-subtitle icon-point">
          <template
            v-for="(pathItem, pathIndex) in item.way"
            :key="`${item._key}path${pathIndex}`"
          >
            <div>{{ pathIndex === 0 ? "# " : "" }}{{ pathItem.title }}</div>
            <div v-if="pathIndex < item.way.length - 1" style="margin: 0px 5px">
              /
            </div>
          </template>
        </div>
      </div>
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
  .resourceMenu-item {
    margin-bottom: 10px;
    .resourceMenu-item-title {
      width: 100%;
      min-height: 30px;
      font-size: 14px;
      border-radius: 4px;
      box-sizing: border-box;
      line-height: 30px;

      @include flex(space-between, center, wrap);
    }
    .resourceMenu-item-subtitle {
      width: 100%;
      min-height: 30px;
      font-size: 12px;
      color: $grey-6;
      @include flex(flex-start, center, wrap);
    }
    &:hover {
      background: #f5f5f5;
    }
  }
}
</style>
<style></style>
