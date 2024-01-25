<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import router from "@/router";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
const route = useRoute();
const { teamInfo, teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
import { viewArray } from "@/services/config/config";
import api from "@/services/api";
const viewTab = ref<string>("");

watch(
  teamInfo,
  (newInfo) => {
    if (newInfo) {
      console.log(newInfo.viewTab);
      console.log(newInfo.views);
      if (newInfo.views.indexOf(newInfo.viewTab) !== -1) {
        viewTab.value = newInfo.viewTab;
        router.push(`/home/team/${newInfo.viewTab}`);
      } else {
        viewTab.value = newInfo.views[0];
        router.push(`/home/team/${newInfo.views[0]}`);
        api.request.post("user/clickTab", {
          teamKey: spaceKey.value,
          projectKey: teamKey.value,
          viewTab: newInfo.views[0],
        });
      }
    }
  },
  { immediate: true }
);
watch(
  viewTab,
  (newTab) => {
    if (newTab) {
      router.push(`/home/team/${newTab}`);
      api.request.post("user/clickTab", {
        teamKey: spaceKey.value,
        projectKey: teamKey.value,
        viewTab: newTab,
      });
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="team">
    <cHeader :title="teamInfo.name" v-if="teamInfo" />
    <q-tabs
      v-if="teamInfo"
      dense
      align="left"
      indicator-color="primary"
      active-class="text-primary"
      class="q-mx-md"
      v-model="viewTab"
    >
      <!-- <q-route-tab label="最近" :to="`/home/team/recent`" exact /> -->
      <q-tab
        v-for="(item, index) in teamInfo.views"
        :key="`viewTab${index}`"
        :label="viewArray[_.findIndex(viewArray, { value: item })].label"
        :name="viewArray[_.findIndex(viewArray, { value: item })].value"
      />
    </q-tabs>
    <div class="team-box"><router-view></router-view></div>
  </div>
</template>
<style scoped lang="scss">
.team {
  width: 100%;
  height: 100%;
  .team-box {
    width: 100%;
    height: calc(100% - 105px);
  }
}
</style>
<style></style>
