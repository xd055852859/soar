<template>
  <div class="q-doc-wrapper">
    <Webview v-if="src" :src="src" width="100%" height="100%" />
  </div>
</template>
<script setup lang="ts">
import { getAppInfo, getThirdAppUrl, Type } from "@/components/note/qdocUtil";
import { computed, ref, watchEffect } from "vue";
import Webview from "@/components/common/Webview.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";

const { note } = storeToRefs(appStore.noteStore);

const src = ref("");

watchEffect(() => {
  if (!note.value) return;
  const appInfo = getAppInfo(note.value.type as Type);
  if (appInfo) {
    const url = getThirdAppUrl(
      note.value._key,
      note.value.type as Type,
      appInfo.url,
      true,
      note.value.title
    );
    src.value = url;
  }
});
</script>
<style scoped lang="scss">
.q-doc-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
