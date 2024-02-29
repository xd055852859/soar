<script setup lang="ts">
import appStore from "@/store";
const { setSpaceKey } = appStore.spaceStore;
const { setTeamKey } = appStore.teamStore;
const props = defineProps<{
  shareId: string;
}>();
onMounted(() => {
  let [spaceKey, teamKey] = props.shareId.split("_");
  setSpaceKey(spaceKey);
  setTeamKey(teamKey);
  console.log(spaceKey, teamKey)
// setTeamKey(props.shareId);
});
</script>
<template>
  <div style="width: 100vw; height: 100vh"><router-view></router-view></div>
</template>
<style scoped lang="scss"></style>
<style></style>
