<template>
  <q-card flat bordered>
    <div
      :class="`file-uploader ${active ? 'active' : ''}`"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @paste="handlePaste"
    >
      <span class="text">Crtl+V或将文件拖至此处</span>
      <div class="file-wrapper">
        <q-btn color="primary" size="sm" label="上传" />
        <input accept="*" type="file" @change="handleFileChange" />
      </div>
    </div>
  </q-card>
</template>
<script setup lang="ts">
import api from "@/services/api";
import { uploadImg } from "@/services/util/uploadImage";
import { isUrl } from "@/services/util/util";
import appStore from "@/store";
const { createNote } = appStore.noteStore;
const active = ref(false);

const handleFileChange = (event: any) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  uploadFile(file);
};

const uploadFile = (file: File) => {
  uploadImg({
    file,
    cardKey: "",
    accept: "*",
  })
    .then((res) => {
      if (res) {
        createNote({
          type: "file",
          title: file.name,
          link: res as string,
        });
      }
    })
    .catch((e) => {
      // ElMessage({
      //   message: e.msg,
      //   type: "warning",
      // });
    });
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  active.value = false;
  const droppedFile = event.dataTransfer?.files[0];
  if (!droppedFile) {
    return;
  }

  uploadFile(droppedFile);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  active.value = true;
};

const handlePaste = async (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData || "";
  if (!clipboardData) return;
  const pastedText = clipboardData.getData("text/plain");
  if (isUrl(pastedText)) {
    const res: any = await api.getUrlInfo(pastedText);
    if (res.status === 200) {
      createNote({
        type: "link",
        title: res.data.title,
        link: pastedText,
        icon: res.data.icon,
        summary: res.data.memo,
      });
    }
  } else {
    alert("不是链接");
  }
};
</script>
<style scoped>
.file-uploader {
  padding: 15px;
  display: flex;
  align-items: center;
  height: 100px;
}
.file-uploader.active {
  background-color: #c1edd2;
}
.text {
  flex: 1;
  color: #c6c6c6;
}
.file-wrapper {
  position: relative;
}
.file-wrapper > input {
  opacity: 0;
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
