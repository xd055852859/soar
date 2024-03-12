<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import { ResultProps } from "@/interface/Common";
import { OnClickOutside } from "@vueuse/components";
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
const { spaceRole } = storeToRefs(appStore.spaceStore);
const { setTargetTeamKey, setTeamKey, setTeamList, setTeamFoldList } =
  appStore.teamStore;
const { setClose } = appStore.commonStore;
const addVisible = ref<boolean>(false);
const detailState = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const searchList = ref<any>([]);
const searchInput = ref<string>("");
const searchVibisible = ref<boolean>(false);
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
    setMessage("success", `${item.watch ? "取消关注" : "关注"}群组成功`);
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
      setMessage("success", "折叠群组成功");
      let index = _.findIndex(list, { _key: key });
      if (index !== -1) {
        let item = list.splice(index, 1)[0];
        foldList.push(item);
      }
    } else {
      setMessage("success", "取消折叠群组成功");
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
    setMessage("success", state ? "置顶群组成功" : "取消置顶群组成功");
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
watchEffect(() => {
  if (searchInput.value) {
    searchList.value = teamList.value.filter(
      (item) => item.name.indexOf(searchInput.value) !== -1
    );
  } else {
    searchList.value = [...teamList.value];
  }
});
</script>
<template>
  <div class="teamMenu">
    <!-- <OnClickOutside @trigger="searchVibisible = false"> -->
    <div class="teamMenu-title">
      <div class="teamMenu-title-left">
        <div class="small-input" v-if="searchVibisible">
          <q-input
            outlined
            dense
            autofocus
            v-model="searchInput"
            class="full-width"
            @blur="searchVibisible = false"
          />
        </div>
        <template v-else>群组</template>
      </div>
      <div class="teamMenu-title-right">
        <q-btn flat round @click="searchVibisible = !searchVibisible">
          <Icon name="sousuo" :size="20" />
        </q-btn>
        <q-btn flat round @click="toggleTeam(null, true)" v-if="spaceRole < 4">
          <Icon name="a-chuangjian2" :size="20" />
        </q-btn>
      </div>
    </div>
    <!-- </OnClickOutside> -->

    <div class="teamMenu-list">
      <div
        class="teamMenu-item icon-point"
        v-for="(item, index) in searchList"
        :key="`team${index}`"
        @mouseenter="setTargetTeamKey(item._key)"
        @click="
          setClose(0);
          setTeamKey(item._key);
          setTargetTeamKey(item._key);
          $router.push(`/home/team`);
        "
        :style="{
          borderLeft: `5px solid ${item.top?'#f44336':'transparent'}`,
          background: teamKey === item._key&&$route.path!.indexOf('home/team')!==-1 ? '#e0e0e0' : '',
        }"
      >
        <div>{{ item.name }}</div>
        <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
          <q-btn flat round size="9px" @click.stop="">
            <Icon name="gengduo" :size="18" />
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="toggleTeam(item, true)"
                  v-if="item.role < 3"
                >
                  <q-item-section class="common-title">编辑</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="memberVisible = true"
                  v-if="item.role < 3"
                >
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
    <div class="teamMenu-subtitle">
      <div>折叠的群组</div>
      <Icon name="a-youcezhedie21" :size="8" />
      <q-menu style="width: 280px; max-height: 70vh">
        <div
          class="teamMenu-item icon-point"
          v-for="(item, index) in teamFoldList"
          @mouseenter="setTargetTeamKey(item._key)"
          :key="`foldTeam${index}`"
          @click="
            setTeamKey(item._key);
            $router.push(`/home/team`);
          "
          :style="teamKey === item._key&&$route.path!.indexOf('home/team')!==-1 ? { background: '#e0e0e0' } : null"
        >
          <div># {{ item.name }}</div>
          <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
            <q-btn flat round size="9px" @click.stop="">
              <Icon name="gengduo" :size="18" />
              <q-menu anchor="top right" self="top left" class="q-pa-sm">
                <q-list dense>
                  <q-item
                    clickable
                    v-close-popup
                    @click="foldTeam(item._key, false)"
                  >
                    <q-item-section class="common-title"
                      >取消折叠</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-menu>
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
  // height: calc(100% - 320px);
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  .teamMenu-title {
    width: 100%;
    height: 40px;
    font-weight: bold;
    font-size: 16px;
    @include flex(space-between, center, null);
    .teamMenu-title-left {
      width: calc(100% - 85px);
      height: 100%;
      @include flex(flex-start, center, null);
    }
    .teamMenu-title-right {
      width: 85px;
      height: 100%;
      @include flex(flex-start, center, null);
    }
  }
  .teamMenu-subtitle {
    width: 100%;
    height: 40px;
    font-size: 14px;
    color: $grey-8;
    @include flex(space-between, center, null);
  }
  .teamMenu-list {
    // height: calc(100% - 45px);
    flex: 1;
    @include scroll();
  }

  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 0px;
  }
}
.teamMenu-item {
  width: 100%;
  height: 30px;
  padding-left: 10px;
  font-size: 14px;
  border-radius: 4px;
  box-sizing: border-box;
  line-height: 30px;
  margin-bottom: 10px;
  @include flex(space-between, center, null);
  &:hover {
    background: #f5f5f5;
  }
}
</style>
<style></style>
