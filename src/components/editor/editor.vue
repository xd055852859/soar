<script setup lang="ts">
import {
  EditorContent,
  JSONContent,
  useEditor,
  VueNodeViewRenderer,
} from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import OrderedList from "@tiptap/extension-ordered-list";
import Document from "@tiptap/extension-document";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Code from "@tiptap/extension-code";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Dropcursor from "@tiptap/extension-dropcursor";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
// import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import { ref, watch, computed, onBeforeUnmount, onMounted } from "vue";
import EditorMenu from "./editorMenu.vue";
// load all highlight.js languages
// @ts-ignore
import { lowlight } from "lowlight";
import { EditorView } from "prosemirror-view";
import api from "@/services/api";
import { uploadImg } from "@/services/util/uploadImage";
import { Card } from "@/interface/Card";
import appStore from "@/store";
import { isOutline } from "@/services/util/util";
const { createNote, editNote } = appStore.noteStore;

const props = defineProps<{
  initData?: any;
  autoSave?: boolean;
  readonly?: boolean;
  handleSave?: (title: string, json: JSONContent) => void;
  showHeadMenu?: boolean;
}>();

const emit = defineEmits<{
  (e: "onChange"): void;
  (e: "close"): void;
}>();

const defaultProps = {
  children: "children",
  label: "label",
};

const emptyContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
    },
  ],
};
const defaultContent = props.initData?.content || emptyContent;
const cardContent = computed(() => props.initData?.content);
const editorCreated = ref(false);
// editor.setEditable 会触发onUpdate，所以加这个变量区分
const editorUpdated = ref(false);

const watchVals = computed(() => {
  return {
    readonly: props.readonly,
    editorCreated: editorCreated.value,
  };
});

const limit = 40000;

const editor = useEditor({
  content: defaultContent,
  extensions: [
    Blockquote,
    BulletList,
    HardBreak,
    Heading,
    HorizontalRule,
    OrderedList,
    Document,
    ListItem,
    Paragraph.extend({
      addKeyboardShortcuts() {
        return {
          Tab: () => {
            if (
              !(
                this.editor.isActive("bulletList") ||
                this.editor.isActive("orderedList") ||
                this.editor.isActive("taskList")
              )
            ) {
              return this.editor.commands.toggleBulletList();
            }
            return false;
          },
        };
      },
    }),
    Text,
    Bold,
    Code,
    Italic,
    Strike,
    Dropcursor.configure({ color: "#FF5660", width: 2 }),
    History,
    // StarterKit.configure({
    //   dropcursor: {
    //     color: "#409eff",
    //     width: 2,
    //   },
    // }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link,
    Highlight,
    TaskList,
    TaskItem,
    // Image.configure({
    //   allowBase64: false,
    // }),
    Typography,
    CodeBlockLowlight.configure({ lowlight }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        const placeholderStr = "写点什么吧";
        if (node.type.name === "heading") {
          return "请输入标题";
        } else if (node.type.name === "paragraph") {
          return placeholderStr;
        } else {
          return placeholderStr;
        }
      },
    }),
    CharacterCount.configure({
      limit,
    }),
    Table.configure({
      resizable: true,
    }),
  ],
  editorProps: {
    // @ts-ignore
    handleDOMEvents: {
      paste(view: EditorView, event: ClipboardEvent) {
        if (event.clipboardData && event.clipboardData.files.length) {
          const text = event.clipboardData?.getData("text/plain");
          if (text) {
            return false;
          }
          event.preventDefault();
          const files = event.clipboardData.files;
          insertFiles(view, files, view.state.selection.to, true);
          return true;
        } else {
          return false;
        }
      },
      drop(view: EditorView, event: DragEvent) {
        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (
          coordinates &&
          event.dataTransfer &&
          event.dataTransfer.files.length
        ) {
          event.preventDefault();
          const files = event.dataTransfer.files;
          insertFiles(
            view,
            files,
            coordinates.pos,
            view.state.selection.to === coordinates.pos,
          );
          return true;
        } else {
          return false;
        }
      },
      click(view: EditorView, event: MouseEvent) {
        event.stopPropagation();
        return false;
      },
    },
  },
  onUpdate: ({ editor }) => {
    if (props.autoSave && editorUpdated.value && !props.readonly) {
      emit("onChange");
    }
    if (editorUpdated.value === false && !props.readonly) {
      editorUpdated.value = true;
    }
  },
  onCreate: () => {
    editorCreated.value = true;
  },
  // autofocus: true,
  // editable: !props.readonly,
});

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("unloadcancel", handleUnloadCancel);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  window.removeEventListener("unloadcancel", handleUnloadCancel);
  // if (props.initData?._key && !props.readonly && !locked.value) {
  //   store.dispatch("card/unLock", props.initData?._key);
  // }
  // store.dispatch("card/clearCard");
});

// watchEffect(() => {
//   if (props.initData?._key && !props.readonly) {
//     store.dispatch("card/lock", props.initData?._key);
//   }
// });

watch(watchVals, (newVal, oldVal) => {
  if (newVal.editorCreated) {
    // editor.value?.setEditable(!newVal.readonly && !newVal.locked);
    editor.value?.setEditable(!newVal.readonly);
  }
  if (newVal.readonly) {
    editorUpdated.value = false;
  }
  // if (!newVal.readonly && oldVal.readonly) {
  //   store.dispatch("card/lock", props.initData?._key);
  // }
  // if (newVal.readonly && !oldVal.readonly) {
  //   store.dispatch("card/unLock", props.initData?._key);
  // }
});

watch(cardContent, (newVal) => {
  if (newVal) {
    editor.value?.commands.setContent(newVal);
    console.log("---resetContent---");
  }
});

const handleBeforeUnload = (e: any) => {
  // const event = e || window.event;
  // if (props.initData?._key && !props.readonly && !locked.value) {
  //   api.card.unLockSync(props.initData?._key);
  // }
  // if (event) {
  //   event.returnValue = "关闭提示";
  // }
  // return "关闭提示";
};

const handleUnloadCancel = () => {
  console.log("---handleUnloadCancel---");
};

function handleGetJSON() {
  if (!editor.value) return;
  return editor.value.getJSON();
}

function handlePost() {
  if (!editor.value) return;
  const json: JSONContent = editor.value.getJSON();
  let title =
    json &&
    json.content &&
    json.content[0] &&
    json.content[0].content &&
    json.content[0].content[0]
      ? json.content[0].content[0].text
      : null;
  if (!title) {
    // return ElMessage({
    //   message: i18n.global.t("message.noTitle"),
    //   type: "warning",
    // });
    json.content?.unshift({
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "untitled" }],
    });
    title = "untitled";
  }
  // 判断第一行是否是标题，如果不是标题，转换为标题
  if (json && json.content) {
    const titleObj = json.content[0];
    if (!(titleObj.type === "heading" && titleObj.attrs?.level === 1)) {
      titleObj.type = "heading";
      titleObj.attrs = { level: 1 };
    }
  }
  const charactersNum = editor.value.storage.characterCount.characters();
  const summary = editor.value
    .getText()
    .replace(title, "")
    .replace(/\r\n/g, "")
    .replace(/\n/g, "")
    .substring(0, 200);

  const outline = isOutline(json);

  if (props.initData && props.initData._key) {
    // 有初始数据，更新数据
    if (props.handleSave) {
      props.handleSave(title, json);
    } else {
      editNote({
        noteKey: props.initData._key,
        type: outline ? "outline" : "text",
        title,
        content: json,
        summary,
      });
    }
  } else if (!props.handleSave) {
    // 创建数据
    createNote({
      type: outline ? "outline" : "text",
      title,
      content: json,
      summary,
    });
    // editor.value.commands.clearContent();
  }
}

function clear() {
  if (!editor.value) return;
  editor.value.commands.setContent(emptyContent);
  editor.value.commands.focus();
}
// 点击编辑器空白处
const handleClickBlankSpace = () => {
  // if (editor.value && !props.readonly && !locked.value) {
  if (editor.value && !props.readonly) {
    // const $anchor = editor.value.state.selection.$anchor;
    // 末尾如果不是空行，则添加空行
    const lastChild = editor.value.state.doc.lastChild;
    console.log("---handleClickBlankSpace---", lastChild);
    if (
      lastChild &&
      (lastChild.type.name === "image" ||
        lastChild.type.name === "progress" ||
        lastChild.type.name === "star" ||
        lastChild.type.name === "qblock" ||
        lastChild.type.name === "bookmark" ||
        lastChild.type.name === "linkbutton" ||
        lastChild.type.name === "embed-video" ||
        lastChild.type.name === "attachFile")
    ) {
      // 光标定位到末尾
      editor.value.commands.focus("end");
      // 当前光标位置
      let currentPosition = editor.value.state.selection.anchor;
      if (currentPosition && !isNaN(currentPosition)) {
        editor.value.commands.insertContentAt(currentPosition + 1, {
          type: "paragraph",
        });
      }
    } else if (
      lastChild &&
      (lastChild.type.name === "taskBlock" ||
        lastChild.type.name === "table" ||
        lastChild.type.name === "columns")
    ) {
      console.log("---taskBlock || talbe || columns---");
      const contents = handleGetJSON();
      contents?.content?.push({
        type: "paragraph",
        attrs: {
          textAlign: "left",
        },
      });
      if (contents) {
        editor.value.commands.setContent(contents);
        editor.value.commands.focus("end");
      }
    } else if (lastChild && lastChild.content.size !== 0) {
      editor.value
        .chain()
        // 光标定位到末尾
        .focus("end")
        // 插入空行
        .insertContent({
          type: "paragraph",
        })
        // 执行
        .run();
    } else {
      editor.value.commands.focus("end");
    }
  }
};

const handleFocus = () => {
  if (!editor.value) return;
  editor.value.commands.focus();
};

const insertFiles = async (
  view: EditorView,
  files: FileList,
  pos: number,
  inSelection: boolean,
) => {
  const { schema } = view.state;
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      // todo add loading start
      // if (index === 0) {
      //   store.dispatch("common/loading", true);
      // }

      const url = await uploadImg({
        file,
        cardKey: props.initData?._key || "",
      });
      let node;
      if (/image/i.test(file.type)) {
        node = schema.nodes.image.create({
          src: url,
        });
      } else {
        // node = schema.nodes.attachFile.create({
        //   fileType: file.type,
        //   url,
        //   title: file.name,
        // });
      }
      const transaction = view.state.tr.insert(
        inSelection ? pos + index + 1 : pos + index,
        node,
      );
      view.dispatch(transaction);
      if (index === files.length - 1) {
        // todo add loading end
        // store.dispatch("common/loading", false);
        // store.dispatch("common/loadingText", "");
      } else {
        // store.dispatch("common/loadingText", `${index + 1} / ${files.length}`);
      }
    } catch (error: any) {
      // store.commit("card/setVipAlertMessage", error.msg);
    }
  }
  // Array.from(files).forEach(async (file, index) => {

  // });
};

defineExpose({
  handlePost,
  handleGetJSON,
  handleFocus,
  clear,
  getEditor: () => editor.value,
});
</script>
<template>
  <div class="editor-wrapper" @click="handleClickBlankSpace">
    <editor-menu v-if="editor" :editor="editor" :readonly="readonly" />
    <editor-content :editor="editor" />
    <div class="character-count" v-if="editor">
      <!-- <span v-if="taskInfo.total">{{
        `${taskInfo.checked}/${taskInfo.total}${$t("notes.tasks")}`
      }}</span> -->
      <span>{{ `${editor.storage.characterCount.characters()}字` }}</span>
    </div>
  </div>
</template>
<style scoped lang="scss">
.editor-wrapper {
  /* padding: 0 15px 0 15px; */
  padding: 0;
}

.character-count {
  margin: 55px 0 15px;
  color: $grey-5;
  text-align: end;
  font-size: 12px;
}

.character-count > span:first-child {
  margin-right: 8px;
}
.editor-content-wrapper {
  display: grid;
  transition: all 0.3s;
}
.editor-content-wrapper > div {
  width: 100%;
  overflow: hidden;
}
.head-tree-wrapper {
  width: 100%;
}
</style>
<style lang="scss">
/* Basic editor styles */
.ProseMirror {
  font-size: 14px;
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 15px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  h1 {
    font-size: 2em;
    font-weight: bold;
  }

  h2 {
    font-size: 1.5em;
    font-weight: bold;
  }

  h3 {
    font-size: 1.17em;
    font-weight: bold;
  }

  h4 {
    font-size: 1em;
    font-weight: bold;
  }

  h5 {
    font-size: 0.83em;
    font-weight: bold;
  }

  h6 {
    font-size: 0.67em;
    font-weight: bold;
  }

  mark {
    background-color: #faf594;
  }

  a {
    color: #68cef8;
    cursor: pointer;
  }

  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: var(--notes-color-gray-4);
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    p {
      margin: 0;
    }
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  .hljs-comment,
  .hljs-quote {
    color: #616161;
  }

  .hljs-variable,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-tag,
  .hljs-name,
  .hljs-regexp,
  .hljs-link,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #f98181;
  }

  .hljs-number,
  .hljs-meta,
  .hljs-built_in,
  .hljs-builtin-name,
  .hljs-literal,
  .hljs-type,
  .hljs-params {
    color: #fbbc88;
  }

  .hljs-string,
  .hljs-symbol,
  .hljs-bullet {
    color: #b9f18d;
  }

  .hljs-title,
  .hljs-section {
    color: #faf594;
  }

  .hljs-keyword,
  .hljs-selector-tag {
    color: #70cff8;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: 700;
  }

  pre {
    background: #0d0d0d;
    color: #fff;
    font-family: "JetBrainsMono", monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  blockquote {
    border-left: 3px solid var(--notes-color-gray-2);
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--notes-color-gray);
    margin: 2rem 0;
  }

  code {
    color: var(--notes-color-gray);
  }
}

/* Placeholder (at the top) */
.ProseMirror h1.is-empty:first-child::before,
.ProseMirror p.is-empty::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.tableWrapper {
  padding: 1rem 0;
  overflow: visible;
}

.resize-cursor {
  cursor: ew-resize;
  cursor: col-resize;
}

ul[data-type="taskList"] {
  list-style: none;
  padding: 0;

  p {
    margin: 0;
  }

  li {
    display: flex;

    > label {
      flex: 0 0 auto;
      margin-right: 0.5rem;
      user-select: none;
    }

    > div {
      flex: 1 1 auto;
    }
  }
}

/* Color swatches */
.color {
  white-space: nowrap;

  &::before {
    content: " ";
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 1px solid rgba(128, 128, 128, 0.3);
    vertical-align: middle;
    margin-right: 0.1em;
    margin-bottom: 0.15em;
    border-radius: 2px;
    background-color: var(--color);
  }
}

/* 自加 */
:focus-visible {
  outline: none;
}

.ProseMirror-selectednode {
  outline: 3px solid #68cef8;
}

// 标题Placeholder
.ProseMirror .is-empty.paragraph::before,
.ProseMirror .is-empty.heading::before {
  color: var(--notes-color-gray-2);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.ProseMirror .is-empty.level-1::before {
  font-size: 32px;
  line-height: 32px;
}

.ProseMirror {
  padding: 0 25px;

  // 自定义checkbox样式
  ul[data-type="taskList"] > div > li {
    margin: 6px 0;
    line-height: 19px;
  }

  ul[data-type="taskList"] > div > li > label {
    input {
      display: none;
    }

    span {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      border: 1px solid var(--el-color-primary);
      position: relative;
      cursor: pointer;
      margin-top: 2px;
    }

    span::before {
      display: inline-block;
      content: " ";
      width: 8px;
      border: 2px solid #fff;
      height: 4px;
      border-top: none;
      border-right: none;
      transform: rotate(-45deg);
      top: 4px;
      left: 3px;
      position: absolute;
      opacity: 0;
    }

    input:checked + span {
      background: var(--el-color-primary);
    }

    input:checked + span::before {
      opacity: 1;
      //transform: all 0.5s;
    }
  }

  .el-progress-bao__inner {
    transition: unset;
  }

  .progress-container {
    padding: unset;
  }

  .mention-card {
    color: #64a1df;
    background-color: #ebf2fb;
    text-decoration: underline;
    cursor: pointer;
  }

  .mention-coop {
    color: #64a1df;
    background-color: #ebf2fb;
  }
}

.column-content > p {
  margin: 0;
}
</style>
