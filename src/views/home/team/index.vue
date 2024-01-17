<script setup lang="ts">
import CHeader from "@/components/common/cHeader.vue";
import router from "@/router";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";

const { teamMemberList, teamInfo, teamKey } = storeToRefs(appStore.teamStore);
const { spaceMemberList } = storeToRefs(appStore.spaceStore);
import { viewArray } from "@/services/config/config";
</script>
<template>
  <div class="team">
    <c-header :title="teamInfo.name" v-if="teamInfo"/>
    <q-tabs v-if="teamInfo" dense align="left">
      <q-route-tab label="最近" :to="`/home/team/recent`" exact />
      <q-route-tab
        v-for="(item, index) in teamInfo.views"
        :label="viewArray[_.findIndex(viewArray, { value: item })].label"
        :to="`/home/team/${item}`"
        :key="`tab${index}`"
        exact
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
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
