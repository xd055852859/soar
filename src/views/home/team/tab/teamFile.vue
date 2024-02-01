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
import FilePreview from "@/components/note/FilePreview.vue";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const props = defineProps<{
  type?: string;
}>();
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const { cardInfo, cardKey } = storeToRefs(appStore.cardStore);
const { setCardKey, setCardInfo } = appStore.cardStore;
const { setTargetTeamKey } = appStore.teamStore;
const subType = ref<string>("全部");
const page = ref<number>(1);
const fileList = ref<any>([]);
const fileKey = ref<string>("");
const fileInfo = ref<any>(null);
const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
const total = ref<number>(0);
const getFileList = async () => {
  let fileRes = (await api.request.get("knowledgeBase/card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
    cardType: "file",
    subType: subType.value === "全部" ? "" : subType.value,
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
// 获取文件类型
function getFileType(url: string): string {
  const extension = url.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return "image/" + extension;
    case "mp4":
    case "mov":
      return "video/" + extension;
    case "mp3":
      return "audio/mp3";
    case "pdf":
      return "application/pdf";
    case "doc":
    case "docx":
    case "xls":
    case "xlsx":
      return "application/ms";
    default:
      return "application/octet-stream"; // 默认二进制流，用于其他文件类型
  }
}
const handleUpload = async (file: any) => {
  // const docTypeArr = ["pdf", "docx", "zip", "doc", "pptx"];
  const docTypeArr = ["docx", "doc"];
  const imgTypeArr = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  let subType: string = "";
  if (file.size === 0) {
    setMessage("error", "请上传有内容的文件");
    return;
  }
  if (
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    subType = "文档";
  } else if (file.type.startsWith("audio/")) {
    subType = "音频";
  } else if (file.type.startsWith("video/")) {
    subType = "视频";
  } else if (file.type.startsWith("image/")) {
    subType = "图片";
  } else {
    subType = "其他";
  }
  uploadFile(file, ["*"], async (url) => {
    let title = file.name.split(".")[0] ? file.name.split(".")[0] : "新文件";
    let fileRes = (await api.request.post("card", {
      projectKey: teamKey.value,
      type: "file",
      subType: subType,
      fileType: file.type,
      url: url,
      fileSize: file.size,
      title: title,
    })) as ResultProps;
    if (fileRes.msg === "OK") {
      setMessage("success", `创建${title}成功`);
      fileList.value.unshift(fileRes.data);
    }
  });
};
const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      fileKey.value = detail._key;
      fileInfo.value = detail;
      setTargetTeamKey(detail.projectInfo._key);
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
      <!-- <q-select
        style="width: 100px"
        class="q-mr-sm"
        v-model="subType"
        :options="fileArray"
        dense
      /> -->
    </div>
    <div
      class="teamFile-box"
      @scroll="
        commonscroll($event, fileList, total, () => {
          page++;
        })
      "
    >
      <div
        class="teamFile-box-left"
        @scroll="
          commonscroll($event, fileList, total, () => {
            page++;
          })
        "
      >
        <template v-for="(item, index) in fileList" :key="`file${index}`">
          <fileCard
            :card="item"
            type="file"
            @chooseCard="chooseCard"
            :chooseKey="fileKey"
            :outType="type"
          />
        </template>
      </div>
      <div class="teamFile-box-right">
        <FilePreview
          :fileUrl="fileInfo.url"
          :name="fileInfo.title"
          :fileType="fileInfo.fileType"
          v-if="fileInfo"
        />
      </div>
    </div>
  </div>
  <!-- <Teleport to="body">
    <div class="teamFile-detail" v-if="detailVisible">
      <cIframe :url="detailUrl" :title="fileDetail.title" />
    </div>
  </Teleport> -->
</template>
<style scoped lang="scss">
.teamFile {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  .teamFile-header {
    width: 150px;
    // height: 70px;
    position: absolute;
    z-index: 5;
    top: -40px;
    right: 0px;
    @include flex(flex-end, center, null);
  }
  .teamFile-box {
    width: 100%;
    height: calc(100% - 70px);
    @include scroll();
    @include flex(space-between, center, null);
    .teamFile-box-left {
      width: 350px;
      height: 100%;
      @include p-number(10px, 10px);
      @include scroll();
    }
    .teamFile-box-right {
      width: calc(100% - 350px);
      height: 100%;
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
