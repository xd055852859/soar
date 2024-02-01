<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import cIframe from "@/components/common/cIframe.vue";
import api from "@/services/api";
import _ from "lodash";
import { commonscroll, setMessage } from "@/services/util/common";
import appStore from "@/store";
import fileCard from "@/components/fileCard/fileCard.vue";
import { docArray } from "@/services/config/config";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const { cardInfo, cardKey } = storeToRefs(appStore.cardStore);
const { setCardKey, setCardInfo } = appStore.cardStore;
const { setTargetTeamKey } = appStore.teamStore;
const props = defineProps<{
  type?: string;
}>();
const subType = ref<string>("");
const page = ref<number>(1);
const fileList = ref<any>([]);
const docUrl = ref<string>("");
const fileKey = ref<string>("");
const fileInfo = ref<any>(null);
const total = ref<number>(0);
const getDocList = async () => {
  let fileRes = (await api.request.get("knowledgeBase/card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
    cardType: "doc",
    subType: subType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    if (page.value === 1) {
      fileList.value = [];
    }
    fileList.value = [...fileList.value, ...fileRes.data];
    if (fileRes.data.length > 0 && !fileKey.value) {
      // setCardKey(fileRes.data[0]._key);
      // // setCardKey(fileRes.data[0]._key);
      fileKey.value = fileRes.data[0]._key;
      fileInfo.value = fileRes.data[0];
      setTargetTeamKey(fileRes.data[0].projectInfo._key);
    }
    total.value = fileRes.total as number;
  }
};
const formatUrl = (detail) => {
  const getApi = api.API_URL + "card/detail";
  const getParams = `{"cardKey": "${detail._key}" }`;
  const patchApi = api.API_URL + "card";
  const patchData = `["content", "title"]`;
  const uptokenApi = api.API_URL + "account/qiniuToken";
  const uptokenParams = `{"target": "cdn-soar"}`;
  switch (detail.type) {
    case "text":
      docUrl.value = `https://notecute.com/#/editor?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "draw":
      docUrl.value = `https://draw.workfly.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":${patchData}}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "mind":
      docUrl.value = `https://mind.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "ppt":
      docUrl.value = `https://ppt.mindcute.com/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "sheet":
      docUrl.value = `https://sheets.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
  }
};
const addDoc = async (type, typeName) => {
  let fileRes = (await api.request.post("card", {
    projectKey: teamKey.value,
    type: "doc",
    subType: type,
    title: "新" + typeName,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    setMessage("success", `创建${typeName}成功`);
    fileList.value.unshift(fileRes.data);
  }
};
watch(fileInfo, (newInfo) => {
  if (newInfo) {
    formatUrl(newInfo);
  }
});
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      fileKey.value = detail._key;
      fileInfo.value = detail;
      setTargetTeamKey(detail.projectInfo._key);
      console.log(fileKey.value, fileInfo.value);
      break;
    case "update":
      let updateIndex = _.findIndex(fileList.value, { _key: detail._key });
      if (updateIndex !== -1) {
        fileList.value[updateIndex] = {
          ...fileList.value[updateIndex],
          ...detail,
        };
      }
      break;
    case "delete":
      let delIndex = _.findIndex(fileList.value, { _key: detail._key });
      if (delIndex !== -1) {
        fileList.value.splice(delIndex, 1);
      }
      break;
  }
};
watchEffect(() => {
  getDocList();
});
</script>
<template>
  <div class="teamDoc">
    <div class="teamDoc-header">
      <q-btn
        color="primary"
        label="创建"
        dense
        style="width: 120px"
        v-if="!type"
      >
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              v-for="(item, index) in docArray.slice(1, docArray.length)"
              :key="`fileType${index}`"
              clickable
              v-close-popup
              @click="addDoc(item.value, item.label)"
            >
              <q-item-section class="common-title">{{
                item.label
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-space v-else />
      <q-select
        style="width: 100px"
        v-model="subType"
        :options="docArray"
        dense
        class="q-mr-sm"
        emit-value
        map-options
      />
    </div>
    <div class="teamDoc-box">
      <div
        class="teamDoc-box-left"
        @scroll="
          commonscroll($event, fileList, total, () => {
            page++;
          })
        "
      >
        <template v-for="(item, index) in fileList" :key="`file${index}`">
          <fileCard
            :card="item"
            type="doc"
            @chooseCard="chooseCard"
            :chooseKey="fileKey"
            :outType="type"
          />
        </template>
      </div>
      <div class="teamDoc-box-right">
        <c-iframe :url="docUrl" :title="fileInfo.title" v-if="fileInfo" />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.teamDoc {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  .teamDoc-header {
    width: 150px;
    // height: 70px;
    position: absolute;
    z-index: 5;
    top: -40px;
    right: 0px;
    @include flex(flex-end, center, null);
  }
  .teamDoc-box {
    width: 100%;
    height: calc(100% - 70px);
    @include flex(space-between, center, null);
    .teamDoc-box-left {
      width: 350px;
      height: 100%;
      @include p-number(10px, 10px);
      @include scroll();
    }
    .teamDoc-box-right {
      width: calc(100% - 350px);
      height: 100%;
    }
  }
}
.teamDoc-detail {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0px;
  background-color: #fff;
}
</style>
<style></style>
