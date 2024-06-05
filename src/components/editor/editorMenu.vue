<script setup lang="ts">
import { Editor, isTextSelection } from "@tiptap/vue-3";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { computed } from "vue";
import { BubbleMenu } from "./extensions/extension-bubble-menu/BubbleMenu";
import EditorMenuItem from "./editorMenuItem.vue";

const props = defineProps<{
  editor: Editor;
  readonly?: boolean;
}>();

// const hideBubbleMenu = computed(
//   () =>
//     props.editor?.isActive("table") ||
//     props.editor?.isActive("image") ||
//     props.editor?.isActive("qblock") ||
//     props.editor?.isActive("bookmark") ||
//     props.editor?.isActive("embed-video") ||
//     props.editor?.isActive("attachFile")
// );

const setLink = () => {
  if (!props.editor) return;
  const previousUrl = props.editor.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    props.editor.chain().focus().extendMarkRange("link").unsetLink().run();

    return;
  }

  // update link
  props.editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const shouldShow: any = ({
  editor,
  view,
  state,
  oldState,
  from,
  to,
}: {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  oldState?: EditorState;
  from: number;
  to: number;
}) => {
  const { doc, selection } = state;
  const { empty } = selection;

  if (
    editor.isActive("table") ||
    editor.isActive("image") ||
    editor.isActive("qblock") ||
    editor.isActive("bookmark") ||
    editor.isActive("linkbutton") ||
    editor.isActive("embed-video") ||
    editor.isActive("attachFile") ||
    editor.isActive("horizontalRule")
  ) {
    return false;
  }
  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock =
    !doc.textBetween(from, to).length && isTextSelection(state.selection);

  // When clicking on a element inside the bubble menu the editor "blur" event
  // is called and the bubble menu item is focussed. In this case we should
  // consider the menu as part of the ditor and keep showing the menu
  // const isChildOfMenu = this.element.contains(document.activeElement);
  const isChildOfMenu = false;

  const hasEditorFocus = view.hasFocus() || isChildOfMenu;

  if (!hasEditorFocus || empty || isEmptyTextBlock) {
    return false;
  }

  return true;
};
</script>
<template>
  <bubble-menu
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    :should-show="shouldShow"
  >
    <q-card class="bubble-menu-wrapper" v-if="!readonly">
      <EditorMenuItem
        icon-name="paragraph"
        title="paragraph"
        @on-click="editor?.chain().focus().setParagraph().run()"
      />
      <EditorMenuItem
        icon-name="bold"
        title="bold"
        @on-click="editor?.chain().focus().toggleBold().run()"
      />
      <EditorMenuItem
        icon-name="italic"
        title="italic"
        @on-click="editor?.chain().focus().toggleItalic().run()"
      />
      <EditorMenuItem
        icon-name="strike"
        title="strike"
        @on-click="editor?.chain().focus().toggleStrike().run()"
      />
      <EditorMenuItem
        icon-name="left"
        title="left"
        @on-click="editor?.chain().focus().setTextAlign('left').run()"
      />
      <EditorMenuItem
        icon-name="center"
        title="center"
        @on-click="editor?.chain().focus().setTextAlign('center').run()"
      />
      <EditorMenuItem
        icon-name="right"
        title="right"
        @on-click="editor?.chain().focus().setTextAlign('right').run()"
      />
      <EditorMenuItem
        icon-name="highlight"
        title="highlight"
        @on-click="editor?.chain().focus().toggleHighlight().run()"
      />
      <EditorMenuItem
        icon-name="bulletList"
        title="bulletList"
        @on-click="editor?.chain().focus().toggleBulletList().run()"
      />
      <EditorMenuItem
        icon-name="orderedList"
        title="orderedList"
        @on-click="editor?.chain().focus().toggleOrderedList().run()"
      />
      <EditorMenuItem
        icon-name="taskList"
        title="taskList"
        @on-click="editor?.chain().focus().toggleTaskList().run()"
      />
      <EditorMenuItem icon-name="setLink" title="setLink" @on-click="setLink" />
    </q-card>
  </bubble-menu>
</template>
<style scoped>
.bubble-menu-wrapper {
  /* background-color: var(--el-background-color-base);
  box-shadow: var(--notes-color-shadow); */
  display: flex;
  background-color: #fff;
  align-items: center;
  height: fit-content;
}

/*@media screen and (max-width: 415px) {
  .bubble-menu-wrapper {
    background-color: var(--el-background-color-base);
    box-shadow:;
  }
  ::-webkit-scrollbar {
    height: 1px;
  }
}*/
</style>
