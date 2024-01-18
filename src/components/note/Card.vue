<template>
  <q-card
    v-ripple
    flat
    bordered
    :draggable="draggable"
    :class="`note-card cursor-pointer q-hoverable ${
      selected ? 'selected' : ''
    }`"
  >
    <div></div>
    <div>
      <div class="title">
        {{ card.title }}
      </div>
      <div>{{ card.summary }}</div>
    </div>
    <q-btn
      flat
      round
      icon="more_horiz"
      size="sm"
      class="options"
      @click="handleClickOptions"
    >
      <q-menu>
        <q-list style="min-width: 100px">
          <q-item clickable v-close-popup @click="handleDelete">
            <q-item-section>删除</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </q-card>
</template>
<script setup lang="ts">
import { Card } from "@/interface/Card";
import appStore from "@/store";
const { deleteNote } = appStore.noteStore;

const props = defineProps<{
  card: Card;
  draggable?: boolean;
  selected?: boolean;
}>();

const handleClickOptions = (e: Event) => {
  e.stopPropagation();
};

const handleDelete = () => {
  deleteNote(props.card._key);
};
</script>
<style scoped>
.note-card {
  width: 100%;
  margin-bottom: 15px;
  padding: 15px;
}
.note-card.selected {
  background-color: #f5f5f5;
}
.title {
  font-size: 16px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.options {
  position: absolute;
  top: 15px;
  right: 15px;
  opacity: 0;
}
.note-card:hover > .options {
  opacity: 1;
}
</style>
