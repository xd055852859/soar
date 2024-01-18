<template>
  <div>
    <!-- 根据文件类型显示不同的预览内容 -->
    <div v-if="isImage">
      <img :src="fileUrl" alt="Preview" />
    </div>
    <div v-else-if="isVideo">
      <video controls :src="fileUrl" type="video/mp4"></video>
    </div>
    <div v-else-if="isAudio">
      <audio controls :src="fileUrl" type="audio/mp3"></audio>
    </div>
    <div v-else-if="isPdf">
      <iframe :src="fileUrl" class="pdf-preview"></iframe>
    </div>
    <div v-else>
      <p>无法预览此文件类型</p>
      <button @click="downloadFile">下载文件</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from "vue";

const props = defineProps<{
  fileUrl: string;
}>();

const fileType = computed(() => getFileType(props.fileUrl));

// 判断文件类型
const isImage = computed(() => fileType.value.startsWith("image/"));
const isVideo = computed(() => fileType.value.startsWith("video/"));
const isAudio = computed(() => fileType.value.startsWith("audio/"));
const isPdf = computed(() => fileType.value === "application/pdf");

// 下载文件
const downloadFile = () => {
  // 实现文件下载逻辑，可以使用 window.location.href 或者其他方式
  // 例如：window.location.href = props.fileUrl;
  console.log("Downloading file:", props.fileUrl);
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
    default:
      return "application/octet-stream"; // 默认二进制流，用于其他文件类型
  }
}
</script>

<style scoped>
/* 样式可以根据实际需求自行修改 */
img,
video,
audio {
  max-width: 100%;
  max-height: 300px;
  margin: 10px 0;
}
</style>
