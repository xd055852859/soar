<template>
  <div class="note-editor">
    <Editor
      v-if="note && (note.type === 'text' || note.type === 'outline')"
      ref="editorRef"
      :initData="note"
      :auto-save="true"
      @on-change="handleChange"
    />
    <span
      v-if="note && (note.type === 'text' || note.type === 'outline')"
      class="save-status"
      >{{ changed ? "有变更" : "已保存" }}</span
    >
    <FilePreview
      v-if="note && note.type === 'file' && note.url && note.fileType"
      :file-url="note.url"
      :file-type="note.fileType"
      :name="note.title"
    />
    <div class="link-preview" v-if="note && note.type === 'link' && note.url">
      <Webview :src="note.url" width="100%" height="100%" />
    </div>
  </div>
</template>
<script setup lang="ts">
import Webview from "@/components/common/Webview.vue";
import Editor from "@/components/note/Editor.vue";
import FilePreview from "@/components/note/FilePreview.vue";
import { setSingleSizeLimit } from "@/services/util/uploadImage";
import appStore from "@/store";
import { storeToRefs } from "pinia";

let timeout: any;
const { note } = storeToRefs(appStore.noteStore);
const changed = ref(false);
const editorRef = ref();

onMounted(() => {
  setSingleSizeLimit(1024 * 1024 * 20);
});

const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    handleSave();
    changed.value = false;
  }, 2000);
};

function handleSave() {
  if (editorRef.value) {
    editorRef.value.handlePost();
  }
}
</script>
<style scoped>
.note-editor {
  position: relative;
  width: 100%;
  height: 100%;
}
.save-status {
  color: #ddd;
  position: fixed;
  top: 30px;
  right: 55px;
  font-size: 14px;
}
.link-preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
