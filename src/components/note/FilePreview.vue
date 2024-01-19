<template>
  <div class="preview">
    <!-- 根据文件类型显示不同的预览内容 -->
    <img v-if="isImage" :src="fileUrl" alt="Preview" />
    <video v-else-if="isVideo" controls :src="fileUrl" type="video/mp4"></video>
    <div v-else-if="isAudio">
      <audio controls :src="fileUrl" type="audio/mp3"></audio>
    </div>
    <Webview
      v-else-if="isPdf"
      :src="fileUrl"
      :width="'100%'"
      :height="'100%'"
    />
    <Webview
      v-else-if="isOffice"
      :src="`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`"
      :width="'100%'"
      :height="'100%'"
    />
    <div v-else>
      <p>无法预览此文件类型</p>
      <q-btn color="primary" @click="downloadFile">下载文件</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { download } from "@/services/util/util";
import { ref, computed, defineProps } from "vue";
import Webview from "@/components/common/Webview.vue";

const props = defineProps<{
  name: string;
  fileUrl: string;
}>();

const fileType = computed(() => getFileType(props.fileUrl));

// 判断文件类型
const isImage = computed(() => fileType.value.startsWith("image/"));
const isVideo = computed(() => fileType.value.startsWith("video/"));
const isAudio = computed(() => fileType.value.startsWith("audio/"));
const isPdf = computed(() => fileType.value === "application/pdf");
const isOffice = computed(() => fileType.value === "application/ms");

// 下载文件
const downloadFile = () => {
  download(props.fileUrl, props.name);
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
</script>

<style scoped>
.preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
audio {
  max-width: 100%;
  max-height: 300px;
}
img,
video {
  max-width: 100%;
  max-height: 100%;
}
</style>
