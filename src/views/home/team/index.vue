<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cDialog from "@/components/common/cDialog.vue";
import Menu from "@/views/home/team/menu/menu.vue";
import Detail from "@/views/home/team/menu/detail.vue";
import NoteList from "@/views/home/note/NoteList.vue";
import { VueDraggableNext } from "vue-draggable-next";
import router from "@/router";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
import { viewArray } from "@/services/config/config";
import api from "@/services/api";
import Member from "./menu/member.vue";
import Icon from "@/components/common/Icon.vue";
import { setMessage } from "@/services/util/common";
import { ResultProps } from "@/interface/Common";

const route = useRoute();
const { teamInfo, teamKey } = storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setTeamInfo } = appStore.teamStore;
const updateVisible = ref<boolean>(false);
const viewTab = ref<string>("");
const views = ref<string[]>([]);
const memberVisible = ref<boolean>(false);
const noteDialog = ref<boolean>(false);
const dragTab = async () => {
  console.log(views);
  let teamRes = (await api.request.patch("project", {
    projectKey: teamKey.value,
    views: views.value,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    let info = _.cloneDeep(teamInfo.value);
    info = {
      ...info,
      views: views.value,
    };
    setTeamInfo(info);
  }
};
watch(
  teamInfo,
  (newInfo) => {
    if (newInfo) {
      console.log(newInfo.viewTab);
      console.log(newInfo.views);
      if (newInfo.views.indexOf(newInfo.viewTab) !== -1) {
        viewTab.value = newInfo.viewTab;
        views.value = newInfo.views;
        router.push(`/home/team/${newInfo.viewTab}`);
      } else {
        viewTab.value = newInfo.views[0];
        views.value = newInfo.views;
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
    <cHeader :title="teamInfo.name" v-if="teamInfo">
      <template #button>
        <q-btn
          flat
          round
          @click="noteDialog = true"
          v-if="viewTab === 'knowledgeBase'"
        >
          <Icon name="a-suji22" :size="22" />
        </q-btn>
        <q-btn flat round icon="o_settings">
          <q-menu class="q-pa-sm">
            <q-list dense>
              <VueDraggableNext v-model="views" item-key="id" @end="dragTab">
                <q-item
                  clickable
                  v-for="(item, index) in views"
                  :key="`tabSet${index}`"
                  v-close-popup
                  @click="updateVisible = true"
                  class="common-title dp--center"
                >
                  <Icon name="a-huibaoyaosu-yidong21" :size="14"  class="q-mr-sm"/>
                  <div>
                    {{
                      viewArray[_.findIndex(viewArray, { value: item })].label
                    }}
                  </div>
                </q-item>
                <!-- </template> -->
              </VueDraggableNext>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn flat round icon="o_group" @click="memberVisible = true" />
        <q-btn flat round icon="o_more_horiz" size="12px" @click.stop="">
          <q-menu class="q-pa-sm">
            <q-list dense>
              <q-item clickable v-close-popup @click="updateVisible = true">
                <q-item-section class="common-title">编辑</q-item-section>
              </q-item>
              <Menu :info="teamInfo" />
            </q-list>
          </q-menu>
        </q-btn>
      </template>
    </cHeader>

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
      <div class="full-width row justify-end"></div>
    </q-tabs>
    <div class="team-box"><router-view></router-view></div>
    <Detail
      type="team"
      :visible="updateVisible"
      @close="updateVisible = false"
      :state="true"
    />
    <c-dialog
      :visible="memberVisible"
      @close="memberVisible = false"
      title="成员"
      :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
    >
      <template #content><Member type="team" /></template>
    </c-dialog>
    <q-dialog v-model="noteDialog" position="right" class="note-list-dialog">
      <q-card style="width: 350px; height: 100%">
        <NoteList draggable closable @close="noteDialog = false" />
      </q-card>
    </q-dialog>
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
