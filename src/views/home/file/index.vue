<script setup lang="ts">
import appStore from "@/store";
import cHeader from "@/components/common/cHeader.vue";
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
  <div> <cHeader title="应用配置">
      <template #button>
        <!-- <q-btn
          style="color: #1976d2"
          label="修改应用"
          @click="
            updateApplicationAll('huibao', 'icon', {
              _key: '1530700178',
            })
          "
        /> -->
        <!-- <q-btn
          style="color: #1976d2"
          label="新增应用"
          @click="addApplication()"
        /> -->
      </template>
    </cHeader></div>
</template>
<style scoped lang="scss"></style>
<style></style>
