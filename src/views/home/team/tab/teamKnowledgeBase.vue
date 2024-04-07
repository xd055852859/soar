<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { teamKey, teamInfo } = storeToRefs(appStore.teamStore);
const knowledgeBaseUrl = ref<string>("");
onMounted(() => {});
// watch(
//   teamKey,
//   () => {
//     knowledgeBaseUrl.value = "";
//   },
//   { immediate: true }
// );
watch(
  teamInfo,
  (newInfo) => {
    console.log(newInfo);
    if (token.value && newInfo?.knowledgeBaseRoot) {
      knowledgeBaseUrl.value = `${
        import.meta.env.MODE === "development"
          ? "https://soar.cn"
          : location.origin
      }/base/#/login?token=${token.value}&redirectPath=${
        newInfo.knowledgeBaseRoot
      }`;
    }
  },
  { immediate: true, deep: true }
);
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
