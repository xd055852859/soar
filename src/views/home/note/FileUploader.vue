<template>
  <q-card flat bordered class="file-uploader">
    <span class="text">Crtl+V或将文件拖至此处</span>
    <div class="file-wrapper">
      <q-btn color="primary" size="sm" label="上传" />
      <input accept="*" type="file" @change="handleFileChange" />
    </div>
  </q-card>
</template>
<script setup lang="ts">
import { uploadImg } from "@/services/util/uploadImage";
import appStore from "@/store";
const { createNote } = appStore.noteStore;

const handleFileChange = (event: any) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
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
</script>
<style scoped>
.file-uploader {
  padding: 15px;
  display: flex;
  align-items: center;
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
