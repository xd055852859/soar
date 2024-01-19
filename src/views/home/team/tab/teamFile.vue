<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import _ from "lodash";
import { commonscroll, setMessage } from "@/services/util/common";
import appStore from "@/store";
import fileCard from "@/components/fileCard/fileCard.vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import cIframe from "@/components/common/cIframe.vue";
import { uploadFile } from "@/services/util/file";
import { fileArray } from "@/services/config/config";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const props = defineProps<{
  type?: string;
}>();
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const subType = ref<string>("");
const page = ref<number>(1);
const fileList = ref<any>([]);
const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
const total = ref<number>(0);

const getFileList = async () => {
  let fileRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
    cardType: "file",
    subType: subType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    if (page.value === 1) {
      fileList.value = [];
    }
    fileList.value = [...fileList.value, ...fileRes.data];
    total.value = fileRes.total as number;
  }
};

const handleUpload = async (file: any) => {
  // const docTypeArr = ["pdf", "docx", "zip", "doc", "pptx"];
  const docTypeArr = ["docx", "doc"];
  const imgTypeArr = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  let subType: string = "";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.split(".")[1].indexOf("docx") !== -1 ||
    file.name.split(".")[1].indexOf("doc") !== -1 ||
    file.type === "application/msword"
  ) {
    if (file.size === 0) {
      setMessage("error", "请上传有内容的docx文件");
      return;
    }
    subType = "doc";
    // } else if (file.type === "application/pdf") {
    //   subType = "pdf";
    // } else if (file.type === "application/msword") {
    //   subType = "doc";
    // } else if (
    //   file.type === "application/x-zip-compressed" ||
    //   file.type === "application/zip"
    // ) {
    //   subType = "zip";
    // } else if (
    //   file.type === "application/x-rar" ||
    //   file.name.indexOf("rar") !== -1
    // ) {
    //   subType = "rar";
  } else if (file.type === "audio/mpeg") {
    subType = "mp3";
  } else if (file.type === "video/mp4") {
    subType = "mp4";
    // } else if (
    //   file.type ===
    //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // ) {
    //   subType = "xlsx";
    // } else if (
    //   file.type === "application/vnd.ms-powerpoint" ||
    //   file.name.indexOf("pptx") !== -1 ||
    //   file.name.split(".")[1].indexOf("ppt") !== -1
    // ) {
    //   subType = "pptx";
  } else if (file.type.indexOf("image") !== -1) {
    subType = "image";
  } else {
    // setMessage("error", "仅支持pdf,docx,xlsx,zip,rar,mp3,mp4,ppt和图片格式");
    setMessage("error", "仅支持图片格式和docx,mp3,mp4");
    return;
  }
  uploadFile(
    file,
    [...imgTypeArr, ...docTypeArr, "audio/*", "video/*"],
    async (url) => {
      let title = file.name.split(".")[0] ? file.name.split(".")[0] : "新文件";
      let fileRes = (await api.request.post("card", {
        projectKey: teamKey.value,
        type: "file",
        subType: subType,
        url: url,
        fileSize: file.size,
        title: title,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", `创建${title}成功`);
        fileList.value.unshift(fileRes.data);
      }
    },
    subType === "image" ? undefined : subType
  );
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
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
  getFileList();
});
</script>
<template>
  <div class="teamFile">
    <div class="teamFile-header">
      <q-btn
        color="primary"
        label="上传"
        dense
        style="width: 120px"
        class="upload-button"
        v-if="!type"
      >
        <input
          type="file"
          @change="
            //@ts-ignore
            handleUpload($event.target.files[0])
          "
          class="upload-img"
        />
      </q-btn>
      <q-space v-else />
      <q-select
        style="width: 150px"
        outlined
        v-model="subType"
        :options="fileArray"
        dense
        emit-value
        map-options
      />
    </div>
    <div
      class="teamFile-box"
      @scroll="
        commonscroll($event, fileList, total, () => {
          page++;
        })
      "
    >
      <template v-for="(item, index) in fileList" :key="`file${index}`">
        <fileCard :card="item" type="file" @chooseCard="chooseCard" />
      </template>
    </div>
  </div>
  <Teleport to="body">
    <div class="teamFile-detail" v-if="detailVisible">
      <cIframe :url="detailUrl" :title="fileDetail.title" />
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.teamFile {
  width: 100%;
  height: 100%;
  .teamFile-header {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
  .teamFile-box {
    width: 100%;
    height: calc(100% - 50px);
    @include scroll();
    @include p-number(10px, 10px);
    .teamFile-box-top {
      width: 100%;
      height: 50px;
      @include flex(space-between, center, null);
    }
    .teamFile-box-bottom {
      width: 100%;
      height: 50px;
      @include flex(space-between, center, null);
    }
  }
}
.teamFile-detail {
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
