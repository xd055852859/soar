<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { teamKey, teamInfo } = storeToRefs(appStore.teamStore);
const knowledgeBaseUrl = ref<string>("");
// onMounted(() => {
//   if (token.value && teamInfo.value?.knowledgeBaseRoot) {
//     knowledgeBaseUrl.value = `${
//       import.meta.env.MODE === "development"
//         ? "https://soar.cn"
//         : location.origin
//     }/base/#/login?token=${token.value}&redirectPath=${
//       teamInfo.value.knowledgeBaseRoot
//     }`;
//     console.log(knowledgeBaseUrl.value);
//   }
// });
// watch(
//   teamKey,
//   () => {
//     knowledgeBaseUrl.value = "";
//   },
//   { immediate: true }
// );
watch(
  teamInfo,
  (newInfo, oldInfo) => {
    console.log(newInfo, oldInfo);
    if (
      token.value &&
      newInfo?.knowledgeBaseRoot !== oldInfo?.knowledgeBaseRoot
    ) {
      knowledgeBaseUrl.value = `${
        import.meta.env.MODE === "development"
          ? "https://soar.cn"
          : location.origin
      }/base/#/login?token=${token.value}&redirectPath=${
        newInfo.knowledgeBaseRoot
      }`;
      console.log(knowledgeBaseUrl.value);
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="teamKnowledgeBase" v-if="knowledgeBaseUrl">
    <cIframe :url="knowledgeBaseUrl" title="知识库" />
  </div>
</template>
<style scoped lang="scss">
.teamKnowledgeBase {
  width: 100%;
  height: 100%;
}
</style>
<style></style>
