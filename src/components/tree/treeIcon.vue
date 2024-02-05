<script setup lang="ts">
import { startAdornments } from "@/components/common/treesvg.js";
const emits = defineEmits<{
  (e: "clickIcon", type: string, index: number): void;
}>();
</script>
<template>
  <q-menu
    auto-close
    anchor="bottom middle"
    self="top middle"
    style="width: 450px; height: 500px"
  >
    <q-card>
      <q-card-section class="full-width q-pa-sm">优先级</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.priority"
          :key="`priority${index}`"
          @click="emits('clickIcon', 'priority', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">进度</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.progress"
          :key="`progress${index}`"
          @click="emits('clickIcon', 'progress', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">旗帜</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.flag"
          :key="`flag${index}`"
          @click="emits('clickIcon', 'flag', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">学习</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.study"
          :key="`study${index}`"
          @click="emits('clickIcon', 'study', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">办公</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.office"
          :key="`office${index}`"
          @click="emits('clickIcon', 'office', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">符号</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.symbol"
          :key="`symbol${index}`"
          @click="emits('clickIcon', 'symbol', index)"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
          >
            <rect
              x="0"
              y="0"
              width="1024"
              height="1024"
              fill-opacity="0"
            ></rect>
            <g v-html="item"></g>
          </svg>
        </q-btn>
      </q-card-section>
    </q-card>
  </q-menu>
</template>
<style scoped lang="scss"></style>
<style></style>
