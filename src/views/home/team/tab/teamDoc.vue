<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import cIframe from "@/components/common/cIframe.vue";
import api from "@/services/api";
import _ from "lodash";
import { commonscroll, setMessage } from "@/services/util/common";
import appStore from "@/store";
import fileCard from "@/components/fileCard/fileCard.vue";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const { cardInfo, cardKey } = storeToRefs(appStore.cardStore);
const { setCardKey, setCardInfo } = appStore.cardStore;
const { setTeamKey } = appStore.teamStore;
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
const docArray = [
  {
    label: "全部类型",
    value: "",
  },
  {
    label: "文档",
    value: "text",
  },
  {
    label: "绘图",
    value: "draw",
  },
  {
    label: "脑图",
    value: "mind",
  },
  {
    label: "表格",
    value: "table",
  },
  {
    label: "演示",
    value: "ppt",
  },
  {
    label: "知识库",
    value: "knowledgeBase",
  },
];
const getDocList = async () => {
  let fileRes = (await api.request.get("card", {
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
      setTeamKey(fileRes.data[0].projectInfo._key)
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
  switch (detail.subType) {
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
    case "table":
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
      setTeamKey(detail.projectInfo._key)
      console.log(fileKey.value,fileInfo.value)
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
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-space v-else />
      <q-select
        style="width: 150px"
        outlined
        v-model="subType"
        :options="docArray"
        dense
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
          <fileCard :card="item" type="doc" @chooseCard="chooseCard" :chooseKey="fileKey"/>
        </template>
      </div>
      <div class="teamDoc-box-right">
        <c-iframe
          :url="docUrl"
          :title="fileInfo.title"
          v-if="fileInfo"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.teamDoc {
  width: 100%;
  height: 100%;
  @include p-number(10px, 25px);
  .teamDoc-header {
    width: 100%;
    height: 70px;
    @include flex(space-between, center, null);
  }
  .teamDoc-box {
    width: 100%;
    height: calc(100% - 70px);
    @include flex(space-between, center, null);
    .teamDoc-box-left {
      width: 35%;
      height: 100%;
      @include p-number(10px, 10px);
      @include scroll();
    }
    .teamDoc-box-right {
      width: 65%;
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
