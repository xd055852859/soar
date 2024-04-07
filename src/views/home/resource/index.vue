<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cIframe from "@/components/common/cIframe.vue";
import FileCard from "@/components/fileCard/fileCard.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { token } = storeToRefs(appStore.authStore);
const fileList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const sortType = ref<string>("update");
const fileKey = ref<string>("");
const iframeUrl = ref<string>("");
const sortArray = [
  { label: "最近更新", value: "update" },
  { label: "最近打开", value: "view" },
];
onMounted(() => {
  window.addEventListener("message", getMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", getMessage);
});
const getFileList = async () => {
  let fileRes = (await api.request.get("knowledgeBase/card", {
    teamKey: spaceKey.value,
    projectKey: "",
    sortBy: sortType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    if (page.value === 1) {
      fileList.value = [];
    }
    fileList.value = [...fileList.value, ...fileRes.data];
    if (fileRes.data.length > 0 && !fileKey.value) {
      fileKey.value = fileRes.data[0]._key;
    }
    total.value = fileRes.total as number;
  }
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      fileKey.value = detail._key;
      break;
    // case "update":
    //   let updateIndex = _.findIndex(fileList.value, { _key: detail._key });
    //   if (updateIndex !== -1) {
    //     fileList.value[updateIndex] = {
    //       ...fileList.value[updateIndex],
    //       ...detail,
    //     };
    //   }
    //   break;
    // case "delete":
    //   let delIndex = _.findIndex(fileList.value, { _key: detail._key });
    //   if (delIndex !== -1) {
    //     fileList.value.splice(delIndex, 1);
    //   }
    //   break;
  }
};
const getMessage = (e) => {
  if (e.data && !e.data.source) {
    console.log(e.data);
    const messageData =
      typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    switch (messageData.eventName) {
      case "changeName":
        let index = _.findIndex(fileList.value, { _key: fileKey.value });
        if (index !== -1) {
          fileList.value[index].title = messageData.data;
        }
    }
  }
};
watch(sortType, () => {
  page.value = 1;
});
watchEffect(() => {
  if (spaceKey.value) {
    getFileList();
  }
});
watch(fileKey, (newKey) => {
  if (newKey) {
    iframeUrl.value = `https://soar.cn/base/#/login?token=${token.value}&redirectPath=node/${newKey}`;
  }
});
</script>
<template>
  <div class="resource">
    <div class="resource-left">
      <cHeader title="资源">
        <template #button>
          <q-select
            style="width: 150px; margin-right: 10px"
            outlined
            v-model="sortType"
            :options="sortArray"
            dense
            emit-value
            map-options
          />
        </template>
      </cHeader>
      <div class="resource-left-box">
        <template
          v-for="(fileItem, fileIndex) in fileList"
          :key="`fileItem${fileIndex}`"
        >
          <FileCard
            :card="fileItem"
            :chooseKey="fileKey"
            type="file"
            @chooseCard="chooseCard"
          />
        </template>
      </div>
    </div>
    <div class="resource-right">
      <c-iframe :url="iframeUrl" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.resource {
  width: 100%;
  height: 100%;
  @include flex(space-between, center, center);
  .resource-left {
    width: 300px;
    height: 100%;

    .resource-left-box {
      width: 100%;
      height: calc(100% - 65px);
      @include scroll();
      @include p-number(0px, 10px);
    }
  }
  .resource-right {
    width: calc(100% - 300px);
    height: 100%;
  }
}
</style>
<style></style>
