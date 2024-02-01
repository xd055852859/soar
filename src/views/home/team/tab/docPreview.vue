<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import Editor from "@/components/note/Editor.vue";
import cIframe from "@/components/common/cIframe.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { token } = storeToRefs(appStore.authStore);
const props = defineProps<{
  fileKey: any;
}>();
const emits = defineEmits<{
  (e: "chooseCard", detail: any, type: string): void;
}>();
const docUrl = ref<string>("");
const fileInfo = ref<any>(null);
const changed = ref<boolean>(false);
const editorRef = ref<any>(null);
let timeout: any = null;

const getFileInfo = async (key) => {
  let cardRes = (await api.request.get("card/detail", {
    cardKey: key,
  })) as ResultProps;
  if (cardRes.msg === "OK") {
    fileInfo.value = cardRes.data;
    formatUrl(fileInfo.value);
    changed.value = false;
    clearTimeout(timeout);
    timeout = null;
    // teamStore().teamKey = cardRes.data.projectKey;
  }
};
const updateDoc = async (title, json) => {
  let cardRes = (await api.request.patch("knowledgeBase", {
    nodeKey: props.fileKey,
    title: title,
    content: json,
  })) as ResultProps;
  if (cardRes.msg === "OK") {
    fileInfo.value.title = title;
    emits("chooseCard", fileInfo.value, "update");
    // teamStore().teamKey = cardRes.data.projectKey;
  }
};
const saveDoc = () => {
  if (editorRef.value) {
    editorRef.value.handlePost();
  }
};
const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    saveDoc();
    changed.value = false;
  }, 2000);
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
watch(
  () => props.fileKey,
  (newKey) => {
    if (newKey) {
      getFileInfo(newKey);
    }
  },
  { immediate: true }
);
</script>
<template>
  <template v-if="fileInfo">
    <template v-if="fileInfo.type === 'text'"> 
      <span class="preview-save">{{ changed ? "有变更" : "已保存" }}</span>
      <Editor
        ref="editorRef"
        :initData="fileInfo"
        :autoSave="true"
        @onChange="handleChange"
        :handleSave="updateDoc"
      />
    </template>

    <c-iframe :url="docUrl" :title="fileInfo.title" v-else />
  </template>
</template>
<style scoped lang="scss">
.preview-save {
  position: absolute;
  z-index: 2;
  top: 15px;
  right: 20px;
  font-size: 16px;
}
</style>
<style></style>
