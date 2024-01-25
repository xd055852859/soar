<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { teamInfo } = storeToRefs(appStore.teamStore);
const knowledgeBaseUrl = ref<string>("");
onMounted(() => {});
watchEffect(() => {
  if (token.value && teamInfo.value?.knowledgeBaseRoot) {
    knowledgeBaseUrl.value = `https://knowledgebase.qingtime.cn/#/login?token=${token.value}&id=${teamInfo.value.knowledgeBaseRoot}`;
  }
});
</script>
<template>
  <div class="teamKnowledgeBase">
    <cIframe :url="knowledgeBaseUrl" title="知识库" v-if="knowledgeBaseUrl" />
  </div>
</template>
<style scoped lang="scss">
.teamKnowledgeBase {
  width: 100%;
  height: 100%;
}
</style>
<style></style>
