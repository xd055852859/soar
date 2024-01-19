<template>
  <q-card flat bordered class="note-input">
    <Editor
      v-if="initData !== undefined"
      ref="editorRef"
      :initData="initData"
      :auto-save="true"
      @on-change="handleChange"
    />
    <div class="buttons">
      <q-btn
        color="primary"
        size="sm"
        :label="outline ? '保存大纲' : '保存文本'"
        @click="handlePost"
      />
    </div>
  </q-card>
</template>
<script setup lang="ts">
import Editor from "@/components/note/Editor.vue";
import { Card } from "@/interface/Card";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { isOutline } from "@/services/util/util";

const { notes } = storeToRefs(appStore.noteStore);

const editorRef = ref();
const initData = ref<Card | null>();
const changed = ref(false);
const outline = ref(false);

let timeout: number;

onMounted(() => {
  const str = localStorage.getItem("INPUT_DATA");
  if (str) {
    const json = JSON.parse(str);
    initData.value = json;
  } else {
    initData.value = null;
  }
});

watch(notes, (newVal, oldVal) => {
  if (newVal.length - oldVal.length === 1) {
    // 提交成功后删除本地缓存
    localStorage.removeItem("INPUT_DATA");
    if (editorRef.value) {
      editorRef.value.clear();
    }
  }
});

const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    if (editorRef.value) {
      const json = editorRef.value.handleGetJSON();
      outline.value = isOutline(json);
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
<style scoped>
.note-input {
}
.buttons {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 15px;
}
</style>
