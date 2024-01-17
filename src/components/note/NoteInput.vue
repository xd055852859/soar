<template>
  <div class="note-input">
    <Editor
      v-if="initData !== undefined"
      ref="editorRef"
      :initData="initData"
      :auto-save="true"
      @on-change="handleChange"
    />
    <q-btn color="primary" label="保存" @click="handlePost" />
  </div>
</template>
<script setup lang="ts">
import Editor from "@/components/note/Editor.vue";
import { Card } from "@/interface/Card";

const editorRef = ref();
const initData = ref<Card | null>();
const changed = ref(false);

let timeout: any;

onMounted(() => {
  const str = localStorage.getItem("INPUT_DATA");
  if (str) {
    const json = JSON.parse(str);
    initData.value = json;
  } else {
    initData.value = null;
  }
});

const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    if (editorRef.value) {
      const json = editorRef.value.handleGetJSON();
      if (json) {
        localStorage.setItem("INPUT_DATA", JSON.stringify({ content: json }));
      }
    }
    changed.value = false;
  }, 2000);
};

const handlePost = () => {
  if (editorRef.value) {
    editorRef.value.handlePost();
  }
};
</script>
<style scoped></style>
