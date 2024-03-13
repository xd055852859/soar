<template>
  <div class="noteList">
    <div class="head">
      <span class="title">速记</span>
      <q-select outlined v-model="model" :options="options" dense />
      <q-btn flat round icon="add_circle_outline" class="options">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('text')"
            >
              <!-- <Icon name="attachFile" /> -->
              <q-item-section>云文档</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('outline')"
            >
              <q-item-section>大纲笔记</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('mind')"
            >
              <q-item-section>脑图</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('draw')"
            >
              <q-item-section>绘图</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('ppt')"
            >
              <q-item-section>演示</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="() => handleCreateNote('sheet')"
            >
              <q-item-section>表格</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
const { createNote, removeNote, editNote } = appStore.noteStore;

const props = defineProps<{
  draggable?: boolean;
  closable?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { user } = storeToRefs(appStore.authStore);
const { notes, note, nextNoteKey } = storeToRefs(appStore.noteStore);
const { getNotes, getNoteDetail, clearNoteDetail } = appStore.noteStore;
const selectedNoteKey = ref("");
const detailDialog = ref(false);
const model = ref({ value: null, label: "全部" });
const options = [
  { value: null, label: "全部" },
  { value: "text", label: "文本" },
  { value: "outline", label: "大纲" },
  { value: "file", label: "文件" },
  { value: "link", label: "链接" },
  { value: "mind", label: "脑图" },
  { value: "draw", label: "绘图" },
  { value: "ppt", label: "演示" },
  { value: "sheet", label: "表格" },
];

watch(notes, (newVal, oldVal) => {
  if (!props.draggable && newVal.length !== oldVal.length) {
    selectedNoteKey.value = newVal[0]._key;
  }
});

watch(notes, (newVal, oldVal) => {
  if (newVal.length && !oldVal.length && !props.draggable) {
    selectedNoteKey.value = newVal[0]._key;
  }
});

watch(nextNoteKey, (newVal) => {
  selectedNoteKey.value = newVal;
});

watchEffect(() => {
  if (user) {
    getNotes({
      // @ts-ignore
      type: model.value?.value,
      page: 1,
      limit: 1000,
      used: false,
    });
  }
});

watch(selectedNoteKey, (newVal) => {
  clearNoteDetail();
  if (newVal) {
    getNoteDetail(newVal);
  }
});

onUnmounted(() => {
  clearNoteDetail();
});

watch(note, (newVal, oldVal) => {
  if (newVal && !oldVal && props.draggable) {
    detailDialog.value = true;
  }
});

watch(detailDialog, (newVal, oldVal) => {
  if (!newVal) {
    selectedNoteKey.value = "";
    clearNoteDetail();
  }
});

const handleCreateNote = (
  type:
    | "text"
    | "outline"
    | "clip"
    | "link"
    | "file"
    | "ppt"
    | "draw"
    | "mind"
    | "sheet"
) => {
  let content: any = undefined;
  if (type === "text") {
    content = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
        },
      ],
    };
  } else if (type === "outline") {
    content = {
      content: [
        {
          type: "heading",
          attrs: {
            textAlign: "left",
            level: 1,
          },
          content: [
            {
              type: "text",
              text: "未命名文档",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: {
                    textAlign: "left",
                  },
                  content: [
                    {
                      type: "text",
                      text: "title",
                    },
                  ],
                },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          attrs: {
                            textAlign: "left",
                          },
                          content: [
                            {
                              type: "text",
                              text: "title-1",
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: "listItem",
                      content: [
                        {
                          type: "paragraph",
                          attrs: {
                            textAlign: "left",
                          },
                          content: [
                            {
                              type: "text",
                              text: "title-2",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: "left",
          },
        },
      ],
      type: "doc",
    };
  }
  createNote({
    type,
    title: "未命名文档",
    content,
  });
};

const handleMessage = (e: any) => {
  if (e.data.eventName === "drag2base") {
    removeNote(e.data.data);
  }
  if (e.data.eventName === "changeName" && selectedNoteKey.value) {
    editNote({ noteKey: selectedNoteKey.value, title: e.data.data });
  }
};

onMounted(() => {
  // Add event listener for postMessage
  window.addEventListener("message", handleMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleMessage);
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
  font-size: 18px;
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
<style>
.noteList .q-select {
  width: 90px;
}
</style>
