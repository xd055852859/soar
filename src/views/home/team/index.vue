<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cDialog from "@/components/common/cDialog.vue";
import Menu from "@/views/home/team/menu/menu.vue";
import Detail from "@/views/home/team/menu/detail.vue";
import NoteList from "@/views/home/note/NoteList.vue";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
import Member from "./menu/member.vue";
import Icon from "@/components/common/Icon.vue";
import TeamKnowledgeBase from "./tab/teamKnowledgeBase.vue";
const { token } = storeToRefs(appStore.authStore);
const { teamInfo } = storeToRefs(appStore.teamStore);
const { setClose, setIframeVisible } = appStore.commonStore;
const updateVisible = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const noteDialog = ref<boolean>(false);
</script>
<template>
  <div class="team">
    <!-- <cHeader :title="teamInfo.name" v-if="teamInfo">
      <template #button>
     
      </template>
    </cHeader> -->
    <div class="team-button-left">
      <q-btn
        flat
        round
        @click="
          setClose(1);
          $router.push('/home/explore');
        "
      >
        <Icon name="a-fanhui21" :size="14" />
      </q-btn>
    </div>
    <div class="team-button-right">
      <q-btn
        flat
        round
        @click="
          setIframeVisible(true, {
            url: `https://soar.cn/chatbot?token=${token}`,
            title: 'AI',
          })
        "
      >
        <Icon name="ai-21" :size="22" />
      </q-btn>

      <q-btn flat round @click="noteDialog = true">
        <Icon name="a-suji22" :size="22" />
      </q-btn>

      <q-btn flat round size="12px" @click="memberVisible = true">
        <Icon name="a-duiyou2" :size="18" />
      </q-btn>
      <q-btn flat round size="12px" @click.stop="">
        <Icon name="gengduo" :size="18" />
        <q-menu class="q-pa-sm">
          <q-list dense>
            <q-item clickable v-close-popup @click="updateVisible = true">
              <q-item-section class="common-title">编辑</q-item-section>
            </q-item>
            <Menu :info="teamInfo" />
          </q-list>
        </q-menu>
      </q-btn>
    </div>
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
  position: relative;
  z-index: 1;
  .team-button-left {
    position: absolute;
    z-index: 2;
    top: 4px;
    left: 0px;
  }
  .team-button-right {
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 0px;
  }
  .team-box {
    width: 100%;
    height: 100%;
  }
}
</style>
<style>
.note-list-dialog > .q-dialog__backdrop {
  display: none;
}
</style>
