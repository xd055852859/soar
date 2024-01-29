<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";

import _ from "lodash";
import Member from "./member.vue";
import Detail from "./detail.vue";
import Icon from "@/components/common/Icon.vue";
import Menu from "./menu.vue";

const { targetTeamKey, teamKey, teamList, teamFoldList } = storeToRefs(
  appStore.teamStore
);
const { setTargetTeamKey, setTeamKey, setTeamList, setTeamFoldList } =
  appStore.teamStore;

const addVisible = ref<boolean>(false);
const detailState = ref<boolean>(false);
const memberVisible = ref<boolean>(false);

const toggleTeam = async (item, visible) => {
  if (item) {
    detailState.value = true;
  } else {
    detailState.value = false;
  }
  addVisible.value = visible;
};
const watchTeam = async (item) => {
  let teamRes = (await api.request.patch("project/watch", {
    projectKey: item._key,
    watch: !item.watch,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    setMessage("success", `${item.watch ? "取消关注" : "关注"}小组成功`);
    let list = _.cloneDeep(teamList.value);
    let index = _.findIndex(list, { _key: item._key });
    list[index] = { ...list[index], watch: !item.watch };
    setTeamList(list);
  }
};

const foldTeam = async (key, state) => {
  const teamRes = (await api.request.patch("project/fold", {
    projectKey: key,
    fold: state,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    let list = _.cloneDeep(teamList.value);
    let foldList = _.cloneDeep(teamFoldList.value);
    if (state) {
      setMessage("success", "折叠小组成功");
      let index = _.findIndex(list, { _key: key });
      if (index !== -1) {
        let item = list.splice(index, 1)[0];
        foldList.push(item);
      }
    } else {
      setMessage("success", "取消折叠小组成功");
      let index = _.findIndex(foldList, { _key: key });
      if (index !== -1) {
        let item = foldList.splice(index, 1)[0];
        list.push(item);
      }
    }
    setTeamList(list);
    setTeamFoldList(foldList);
  }
};
const topTeam = async (item, index, state) => {
  const teamRes = (await api.request.patch("project/top", {
    projectKey: item._key,
    top: state,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    setMessage("success", state ? "置顶小组成功" : "取消置顶小组成功");
    let list = _.cloneDeep(teamList.value);
    list.splice(index, 1);
    item.top = !item.top;
    let topIndex = -1;
    if (state) {
      list.forEach((listItem, listIndex) => {
        console.log(listItem.createTime, item.createTime);
        if (listItem.top && listItem.createTime > item.createTime) {
          topIndex = listIndex;
        }
      });
    } else {
      list.forEach((listItem, listIndex) => {
        console.log(!listItem.top, listItem.createTime > item.createTime);
        if (!listItem.top && listItem.createTime > item.createTime) {
          topIndex = listIndex;
        }
      });
    }
    console.log(topIndex);
    list.splice(topIndex + 1, 0, item);
    setTeamList(list);
  }
};
</script>
<template>
  <div class="teamMenu">
    <div class="teamMenu-title">
      <div>小组</div>
      <q-btn flat round @click="toggleTeam(null, true)">
        <Icon name="a-chuangjian2" :size="20" />
      </q-btn>
    </div>
    <div class="teamMenu-list">
      <div
        class="teamMenu-item icon-point"
        v-for="(item, index) in teamList"
        :key="`team${index}`"
        @mouseenter="setTargetTeamKey(item._key)"
        @click="
          setTeamKey(item._key);
          setTargetTeamKey(item._key);
          $router.push(`/home/team`);
        "
        :style="{
          borderLeft: item.top ? '5px solid #f44336' : '',
          background: teamKey === item._key ? '#e0e0e0' : '',
        }"
      >
        <div># {{ item.name }}</div>
        <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
          <q-btn flat round icon="o_more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <q-item clickable v-close-popup @click="toggleTeam(item, true)">
                  <q-item-section class="common-title">编辑</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="memberVisible = true">
                  <q-item-section class="common-title">成员</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="watchTeam(item)">
                  <q-item-section class="common-title">{{
                    item.watch ? "取消关注" : "关注"
                  }}</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="topTeam(item, index, !item.top)"
                >
                  <q-item-section class="common-title">{{
                    item.top ? "取消置顶" : "置顶"
                  }}</q-item-section>
                </q-item>
                <Menu :info="item" />
                <q-item
                  clickable
                  v-close-popup
                  @click="foldTeam(item._key, true)"
                >
                  <q-item-section class="common-title">折叠</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="teamMenu-title">
      <div>折叠的小组</div>
    </div>
    <div class="teamMenu-list">
      <div
        class="teamMenu-item icon-point"
        v-for="(item, index) in teamFoldList"
        @mouseenter="setTargetTeamKey(item._key)"
        :key="`foldTeam${index}`"
        @click="
          setTeamKey(item._key);
          $router.push(`/home/team`);
        "
        :style="teamKey === item._key ? { background: '#e0e0e0' } : null"
      >
        <div># {{ item.name }}</div>
        <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
          <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="foldTeam(item._key, false)"
                >
                  <q-item-section class="common-title">取消折叠</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
  <Detail
    type="target"
    :visible="addVisible"
    @close="addVisible = false"
    :state="detailState"
  />
  <c-dialog
    :visible="memberVisible"
    @close="memberVisible = false"
    title="成员"
    :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
  >
    <template #content><Member type="target" /></template>
  </c-dialog>
</template>
<style scoped lang="scss">
.teamMenu {
  width: 100%;
  height: calc(100% - 440px);
  @include scroll();
  @include p-number(0px, 10px);
  .teamMenu-title {
    width: 100%;
    height: 60px;
    font-weight: bold;
    font-size: 22px;
    @include flex(space-between, center, null);
  }
  .teamMenu-list {
    .teamMenu-item {
      width: 100%;
      height: 55px;
      padding-left: 10px;
      font-size: 20px;
      box-sizing: border-box;
      line-height: 55px;
      margin-bottom: 5px;
      @include flex(space-between, center, null);
      &:hover {
        background: #e0e0e0;
      }
    }
  }
}
</style>
<style></style>
