<script setup lang="ts">
import { startAdornments } from "@/components/common/treesvg.js";
</script>
<template>
  <q-menu auto-close>
    <q-card style="width: 300px">
      <q-card-section class="full-width q-pa-sm">优先级</q-card-section>
      <q-card-section class="q-pa-sm">
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          width="28"
          height="28"
          style="margin: 5px"
          v-for="(item, index) in startAdornments.priority"
        >
          <rect x="0" y="0" width="1024" height="1024" fill-opacity="0"></rect>
          <g v-html="item"></g>
        </svg>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">进度</q-card-section>
      <q-card-section class="q-pa-sm">
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          width="28"
          height="28"
          style="margin: 5px"
          v-for="(item, index) in startAdornments.progress"
        >
          <rect x="0" y="0" width="1024" height="1024" fill-opacity="0"></rect>
          <g v-html="item"></g>
        </svg>
      </q-card-section>
      <q-card-section class="full-width q-pa-sm">旗帜</q-card-section>
      <q-card-section class="q-pa-sm">
        <q-btn
          flat
          round
          v-for="(item, index) in startAdornments.flag"
          :key="`flag${index}`"
        >
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            width="28"
            height="28"
            style="margin: 5px"
            v-for="(item, index) in startAdornments.flag"
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
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          width="28"
          height="28"
          style="margin: 5px"
          v-for="(item, index) in startAdornments.symbol"
        >
          <rect x="0" y="0" width="1024" height="1024" fill-opacity="0"></rect>
          <g v-html="item"></g>
        </svg>
      </q-card-section>
    </q-card>
  </q-menu>
</template>
<style scoped lang="scss"></style>
<style></style>
