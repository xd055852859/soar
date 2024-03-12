<template>
  <div
    :draggable="draggable"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <q-card
      v-ripple
      flat
      bordered
      :class="`note-card cursor-pointer q-hoverable ${
        selected ? 'selected' : ''
      }`"
    >
      <div class="logo">
        <i v-if="card.icon" :style="{ backgroundImage: `url(${card.icon})` }" />
      </div>
      <div class="content">
        <div class="title">
          {{ card.title }}
        </div>
        <div class="summary">{{ card.summary }}</div>
      </div>
      <q-btn flat round size="9px" class="options" @click="handleClickOptions">
        <Icon name="gengduo" :size="18" />
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup @click="handleDelete">
              <q-item-section>删除</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import { Card } from "@/interface/Card";
import appStore from "@/store";
import Icon from "@/components/common/Icon.vue";

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

const handleMouseEnter = () => {
  const iframe: any = document.getElementsByClassName("web-view")[0];
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ eventName: "drag-start" }, "*");
  }
};

const handleMouseLeave = () => {
  const iframe: any = document.getElementsByClassName("web-view")[0];
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ eventName: "drag-end" }, "*");
  }
};

const handleDragStart = (event: DragEvent) => {
  event.dataTransfer?.setData("text/plain", props.card._key);
};

const handleDragEnd = (event: DragEvent) => {};
</script>
<style scoped>
.note-card {
  width: 100%;
  margin-bottom: 15px;
  padding: 15px;
  display: flex;
}
.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  line-height: 25px;
}
.summary {
  font-size: 14px;
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  overflow: hidden;
  /* autoprefixer: ignore next */
  -webkit-box-orient: vertical;
}
.options {
  position: absolute;
  top: 15px;
  right: 8px;
  opacity: 0;
}
.note-card:hover > .options {
  opacity: 1;
}
.logo > i {
  width: 25px;
  height: 25px;
  display: block;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  margin-right: 8px;
}
.content-wrapper {
  height: 500px;
}
</style>
