<template>
  <div class="noteList">
    <div class="head">
      <span class="title">速记</span>
      <q-btn
        v-if="closable"
        flat
        round
        icon="close"
        class="options"
        @click="emit('close')"
      >
      </q-btn>
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
    <q-dialog v-if="draggable" v-model="detailDialog">
      <q-card style="width: 80%; height: 80%; max-width: 1200px">
        <NoteEditor />
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import NoteInput from "@/components/note/NoteInput.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import Card from "@/components/note/Card.vue";
import NoteEditor from "@/views/home/note/NoteEditor.vue";
import FileUploader from "./FileUploader.vue";

const props = defineProps<{
  draggable?: boolean;
  closable?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { user } = storeToRefs(appStore.authStore);
const { notes } = storeToRefs(appStore.noteStore);
const { getNotes, getNoteDetail, clearNoteDetail } = appStore.noteStore;
const { note } = storeToRefs(appStore.noteStore);
const selectedNoteKey = ref("");
const detailDialog = ref(false);

watch(notes, (newVal, oldVal) => {
  if (newVal.length - oldVal.length === 1) {
    selectedNoteKey.value = newVal[0]._key;
  }
});

watch(notes, (newVal, oldVal) => {
  if (newVal.length && !oldVal.length && !props.draggable) {
    selectedNoteKey.value = newVal[0]._key;
  }
});

watchEffect(() => {
  if (user && notes.value.length === 0) {
    getNotes({ page: 1, limit: 1000 });
  }
});

watch(selectedNoteKey, (newVal) => {
  clearNoteDetail();
  getNoteDetail(newVal);
});

onUnmounted(() => {
  clearNoteDetail();
});

watch(note, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    detailDialog.value = true;
  }
});

watch(detailDialog, (newVal, oldVal) => {
  if (!newVal) {
    clearNoteDetail();
  }
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
  flex: 1;
}
.head {
  padding: 15px;
  display: flex;
  align-items: center;
}
.input-wrapper,
.file-wrapper {
  padding: 0 15px;
  margin-bottom: 15px;
}
</style>
