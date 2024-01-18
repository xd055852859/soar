<template>
  <div class="note-wrapper">
    <div class="cards-wrapper">
      <NoteList />
    </div>
    <div class="preview-wrapper">
      <NoteEditor />
    </div>
  </div>
</template>
<script setup lang="ts">
import NoteEditor from "./NoteEditor.vue";
import NoteList from "./NoteList.vue";
</script>
<style scoped>
.note-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: grid;
  grid-template-columns: 300px 1fr;
}
.cards-wrapper {
  border-right: 1px solid #ddd;
  overflow: hidden;
}
.preview-wrapper {
  overflow: auto;
}
</style>
