<template>
  <div class="note-wrapper">
    <div class="cards-wrapper">
      <NoteInput />
    </div>
    <div class="preview-wrapper"></div>
  </div>
</template>
<script setup lang="ts">
import NoteInput from "@/components/note/NoteInput.vue";
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
}
</style>
