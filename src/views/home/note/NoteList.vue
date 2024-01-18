<template>
  <div class="noteList">
    <div class="head">
      <span class="title">速记</span>
    </div>
    <div class="input-wrapper">
      <NoteInput />
    </div>
    <div class="file-wrapper">
      <FileUploader />
    </div>
    <div class="cards-wrapper">
      <Card
        v-for="card in notes"
        :card="card"
        :selected="selectedNoteKey === card._key"
        :draggable="draggable"
        @click="selectedNoteKey = card._key"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import NoteInput from "@/components/note/NoteInput.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Card from "@/components/note/Card.vue";
import FileUploader from "./FileUploader.vue";

const props = defineProps<{
  draggable?: boolean;
}>();

const { user } = storeToRefs(appStore.authStore);
const { notes } = storeToRefs(appStore.noteStore);
const { getNotes, getNoteDetail, clearNoteDetail } = appStore.noteStore;
const selectedNoteKey = ref("");

watchEffect(() => {
  if (user && notes.value.length === 0) {
    getNotes({ page: 1, limit: 1000 });
  }
});

watch(selectedNoteKey, (newVal) => {
  clearNoteDetail();
  getNoteDetail(newVal);
});
</script>
<style scoped>
.noteList {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.cards-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0 15px;
}
.title {
  font-weight: bold;
  font-size: 23px;
}
.head {
  padding: 15px;
}
.input-wrapper,
.file-wrapper {
  padding: 0 15px;
  margin-bottom: 15px;
}
</style>
