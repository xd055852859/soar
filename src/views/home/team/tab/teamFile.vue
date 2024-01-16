<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import _ from "lodash";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import fileCard from "@/components/fileCard/fileCard.vue";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import cIframe from "@/components/common/cIframe.vue";
import { uploadFile } from "@/services/util/file";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const subType = ref<string>("image");
const page = ref<number>(1);
const fileList = ref<any>([]);
const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
const total = ref<number>(0);
const fileArray = [
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
const getFileList = async () => {
  let fileRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    cardType: "file",
    subType: subType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    fileList.value = [...fileList.value, ...fileRes.data];
    total.value = fileRes.total as number;
  }
};

const deleteFile = async (key, index) => {
  $q.dialog({
    title: "删除文档",
    message: "是否删除该文档",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("card", {
        cardKey: key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", "删除文档成功");
        fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const scrollFile = (e) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    fileList.value.length < total.value
  ) {
    page.value++;
  }
};
const handleUpload = async (file: any) => {
  const docTypeArr = ["pdf", "docx", "zip", "doc", "pptx"];
  const imgTypeArr = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  let subType: string = "";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.split(".")[1].indexOf("docx") !== -1 ||
    file.name.split(".")[1].indexOf("doc") !== -1
  ) {
    if (file.size === 0) {
      setMessage("error", "请上传有内容的docx文件");
      return;
    }
    subType = "docx";
  } else if (file.type === "application/pdf") {
    subType = "pdf";
  } else if (file.type === "application/msword") {
    subType = "doc";
  } else if (
    file.type === "application/x-zip-compressed" ||
    file.type === "application/zip"
  ) {
    subType = "zip";
  } else if (
    file.type === "application/x-rar" ||
    file.name.indexOf("rar") !== -1
  ) {
    subType = "rar";
  } else if (file.type === "audio/mpeg") {
    subType = "mp3";
  } else if (file.type === "video/mp4") {
    subType = "mp4";
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    subType = "xlsx";
  } else if (
    file.type === "application/vnd.ms-powerpoint" ||
    file.name.indexOf("pptx") !== -1 ||
    file.name.split(".")[1].indexOf("ppt") !== -1
  ) {
    subType = "pptx";
  } else if (file.type.indexOf("image") !== -1) {
    subType = "image";
  } else {
    setMessage("error", "仅支持pdf,docx,xlsx,zip,rar,mp3,mp4,ppt和图片格式");
    return;
  }
  uploadFile(
    file,
    [...imgTypeArr, ...docTypeArr, "audio/*", "video/*"],
    async (url) => {
      let title = file.name.split(".")[0] ? file.name.split(".")[0] : "新文件";
      let fileRes = (await api.request.post("card", {
        projectKey: teamKey.value,
        type: "doc",
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
const chooseFile = (type, detail) => {};
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
      >
        <input
          type="file"
          accept="image/*"
          @change="
            //@ts-ignore
            handleUpload($event.target.files[0])
          "
          class="upload-img"
        />
      </q-btn>
      <q-select
        style="width: 150px"
        outlined
        v-model="subType"
        :options="fileArray"
        label="类型"
        dense
        emit-value
        map-options
      />
    </div>
    <div class="teamFile-box" @scroll="scrollFile">
      <template v-for="(item, index) in fileList" :key="`file${index}`">
        <fileCard :card="item" type="file" />
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
