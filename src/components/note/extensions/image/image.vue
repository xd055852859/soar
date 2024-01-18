<template>
  <node-view-wrapper
    class="node-view-wrapper"
    :style="`justify-content: ${align};`"
  >
    <div
      class="image-container"
      ref="wrapperEl"
      @mouseenter="handleMouseEnter"
      @click="handleSelect"
      v-clickoutside="handleClickOutside"
    >
      <img
        :src="src"
        :style="`width:${width ? `${width}px` : 'unset'}; max-width:100%`"
      />
      <div v-if="selected" class="selected-border" data-drag-handle></div>
      <div
        v-if="selected"
        class="selected-hander1"
        @mousedown="(e) => handleMouseDown(false, e)"
      />
      <div
        v-if="selected"
        class="selected-hander2"
        @mousedown="(e) => handleMouseDown(true, e)"
      />
      <div
        v-if="selected"
        class="selected-hander3"
        @mousedown="(e) => handleMouseDown(true, e)"
      />
      <div
        v-if="selected"
        class="selected-hander4"
        @mousedown="(e) => handleMouseDown(false, e)"
      />
    </div>
    <!-- <el-popover
      v-if="editable"
      :virtual-ref="wrapperEl"
      :width="320"
      trigger="click"
      virtual-triggering
      placement="top"
      @show="popupShown = true"
      @hide="popupShown = false"
    >
      <div class="popup-wrapper">
        <el-button-group>
          <el-button
            :disabled="!width"
            :type="align === 'left' ? 'primary' : undefined"
            @click="handleChangeAlign('left')"
            >{{ $t("editor.left") }}
          </el-button>
          <el-button
            :disabled="!width"
            :type="align === 'center' ? 'primary' : undefined"
            @click="handleChangeAlign('center')"
            >{{ $t("editor.center") }}
          </el-button>
          <el-button
            :disabled="!width"
            :type="align === 'right' ? 'primary' : undefined"
            @click="handleChangeAlign('right')"
            >{{ $t("editor.right") }}
          </el-button>
        </el-button-group>
        <el-button :icon="Refresh" @click="handleReset" />
        <el-button
          type="danger"
          :icon="Delete"
          style="margin: unset"
          @click="handleDelete"
        />
      </div>
    </el-popover> -->
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import { onMounted, reactive, ref, watch, watchEffect } from "vue";

const props = defineProps(nodeViewProps);
const src = ref("");
const width = ref(0);
const editable = ref(false);
const selected = ref(false);
const align = ref("left");
const wrapperEl = ref<HTMLDivElement | null>(null);
const popupShown = ref(false);
let lastX = 0;
let rightHander = true;
const gapTime = 16.666;
let lastTime = 0;

watch(
  props,
  (newVal) => {
    src.value = newVal?.node?.attrs?.src;
    width.value = newVal?.node?.attrs?.width;
    align.value = newVal?.node?.attrs?.align;
  },
  { immediate: true }
);

const handleMouseEnter = () => {
  editable.value = props.editor.isEditable;
};

const handleSelect = () => {
  if (!editable.value) return;
  selected.value = true;
};

const handleClickOutside = (e: MouseEvent) => {
  if (!editable.value) return;
  if (popupShown.value) return;
  if (selected.value) {
    selected.value = false;
  }
};

const mouseMoveHandle = (e: MouseEvent) => {
  let time = new Date().getTime();
  if (!wrapperEl.value) return;
  if (time - lastTime > gapTime || !lastTime) {
    const diffX = e.clientX - lastX;
    lastX = e.clientX;

    if (!width.value || width.value > wrapperEl.value.clientWidth) {
      width.value = wrapperEl.value.clientWidth;
    }

    if (rightHander) {
      if (width.value + diffX > 100) {
        width.value += diffX;
      }
    } else {
      if (width.value - diffX > 100) {
        width.value -= diffX;
      }
    }

    lastTime = time;
  }
};

const mouseUpHandle = (e: MouseEvent) => {
  window.removeEventListener("mousemove", mouseMoveHandle);
  window.removeEventListener("mousemove", mouseUpHandle);
  props.updateAttributes({
    width: width.value,
  });
};

const handleMouseDown = (right: boolean, e: MouseEvent) => {
  rightHander = right;
  lastX = e.clientX;
  window.addEventListener("mousemove", mouseMoveHandle);
  window.addEventListener("mouseup", mouseUpHandle);
};

const handleDelete = () => {
  props.deleteNode();
};

const handleChangeAlign = (align: "left" | "center" | "right") => {
  props.updateAttributes({
    align,
  });
};
const handleReset = () => {
  props.updateAttributes({
    align: "left",
    width: 0,
  });
};
</script>

<style scoped lang="scss">
.image-container {
  position: relative;
  width: fit-content;
  max-width: 100%;
}
.selected-border {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border: 3px solid var(--el-color-primary);
}
.selected-hander1 {
  width: 5px;
  height: 5px;
  border: 2px solid var(--el-color-primary);
  position: absolute;
  top: -5px;
  left: -5px;
}
.selected-hander2 {
  width: 5px;
  height: 5px;
  border: 2px solid var(--el-color-primary);
  position: absolute;
  top: -5px;
  right: -5px;
}
.selected-hander3 {
  width: 5px;
  height: 5px;
  border: 2px solid var(--el-color-primary);
  position: absolute;
  bottom: -5px;
  right: -5px;
}
.selected-hander4 {
  width: 5px;
  height: 5px;
  border: 2px solid var(--el-color-primary);
  position: absolute;
  bottom: -5px;
  left: -5px;
}
.node-view-wrapper {
  display: flex;
}
.popup-wrapper {
  display: flex;
  justify-content: space-between;
}
</style>
<style scoped></style>
