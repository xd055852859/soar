import { ref } from "vue";
import { defineStore } from "pinia";
import { Card } from "@/interface/Card";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { JSONContent } from "@tiptap/vue-3";
// 使用setup模式定义
export const noteStore = defineStore("noteStore", () => {
  const notes = ref<Card[]>([]);
  const note = ref<Card | null>(null);

  const clearNoteDetail = () => {
    note.value = null;
  };

  const createNote = async (props: {
    type: "text" | "outline" | "clip" | "link" | "file";
    title: string;
    content?: JSONContent;
    summary?: string;
    icon?: string;
    url?: string;
    fileType?: string;
  }) => {
    const res = (await api.note.create(props)) as ResultProps<Card>;
    if (res.status === 200) {
      // note.value = res.data;
      notes.value = [res.data, ...notes.value];
    }
  };

  const getNotes = async (props: {
    page: number;
    limit: number;
    type?: "text" | "outline" | "clip" | "link" | "file";
    used?: boolean;
  }) => {
    const res = (await api.note.get(props)) as ResultProps<Card[]>;
    if (res.status === 200) {
      notes.value = res.data;
    }
  };

  const deleteNote = async (noteKey: string) => {
    const res = (await api.note.delete(noteKey)) as ResultProps;
    if (res.status === 200) {
      const index = notes.value.findIndex((note) => note._key === noteKey);
      if (index !== -1) {
        notes.value.splice(index, 1);
      }
    }
  };

  const editNote = async (props: {
    noteKey: string;
    type: "text" | "outline" | "clip" | "link" | "file";
    title: string;
    content: JSONContent;
    summary: string;
    icon?: string;
  }) => {
    const res = (await api.note.edit(props)) as ResultProps<Card>;
    if (res.status === 200) {
      const index = notes.value.findIndex(
        (note) => note._key === props.noteKey
      );
      if (index !== -1) {
        notes.value[index] = {
          ...notes.value[index],
          title: props.title,
          type: props.type,
          summary: props.summary,
          icon: props.icon,
        };
      }
    }
  };

  const getNoteDetail = async (noteKey: string) => {
    const res = (await api.note.detail(noteKey)) as ResultProps<Card>;
    if (res.status === 200) {
      note.value = res.data;
    }
  };

  return {
    note,
    notes,
    createNote,
    getNotes,
    deleteNote,
    editNote,
    getNoteDetail,
    clearNoteDetail,
  };
});
