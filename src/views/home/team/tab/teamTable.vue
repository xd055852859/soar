<script setup lang="ts">
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { user } = storeToRefs(appStore.authStore);
const { teamInfo } = storeToRefs(appStore.teamStore);
const knowledgeBaseUrl = ref<string>("");
onMounted(() => {
  if(user.value){
    window.open(`http://192.168.2.48/?username=${user.value._key}@gmail.com&credential=${user.value._key}`)
  }
});
// watchEffect(() => {
//   if (token.value && teamInfo.value?.knowledgeBaseRoot) {
//     knowledgeBaseUrl.value = `${location.origin}/base/#/login?token=${
//       token.value
//     }&id=${teamInfo.value.knowledgeBaseRoot}&v=${new Date().getTime()}`;
//   }
// });
</script>
<template>
  <div class="teamTable">
    <cIframe
      :url="`http://192.168.2.48/?username=${user._key}@gmail.com&credential=${user._key}`"
      title="apitable"
      v-if="user"
    />
  </div>
</template>
<style scoped lang="scss">
.teamTable {
  width: 100%;
  height: 100%;
}
</style>
<style></style>
