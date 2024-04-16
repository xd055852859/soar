<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import cInLoading from "@/components/common/cInLoading.vue";
import { ResultProps } from "@/interface/Common";
import { OnClickOutside } from "@vueuse/components";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";

import _ from "lodash";
import Member from "@/views/home/right/team/member.vue";
import Detail from "@/views/home/right/team/detail.vue";
import Icon from "@/components/common/Icon.vue";
import Menu from "./menu.vue";
import { useQuasar } from "quasar";
import router from "@/router";
const $q = useQuasar();
const { targetTeamKey, teamKey, teamList, teamFoldList } = storeToRefs(
  appStore.teamStore
);
const { deviceHeight } = storeToRefs(appStore.commonStore);
const { spaceRole, privateTeamKey } = storeToRefs(appStore.spaceStore);
const { setTargetTeamKey, setTeamKey, setTeamList, setTeamFoldList } =
  appStore.teamStore;
const { setClose } = appStore.commonStore;
const addVisible = ref<boolean>(false);
const detailState = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const searchList = ref<any>([]);
const searchInput = ref<string>("");
const searchVibisible = ref<boolean>(false);
const foldVisible = ref<boolean>(false);
const lineHeight = ref<number>(0);
const treeOverkey = ref<string>("");
const treeKey = ref<string>("");
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
const createTree = async (item, index) => {
  $q.dialog({
    title: "事务树标题",
    prompt: {
      model: "",
      type: "text", // optional
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk(async (data) => {
    if (!data) {
      setMessage("error", "请输入事务树名称");
      return;
    }
    let taskRes = (await api.request.post("card", {
      projectKey: teamKey.value,
      type: "taskTree",
      title: data,
    })) as ResultProps;
    if (taskRes.msg === "OK") {
      setMessage("success", `创建事务树成功`);
      let list = _.cloneDeep(teamList.value);
      list[index].cardList.unshift(taskRes.data);
      setTeamList(list);
      // teamKey.value = taskRes.data._key;
      router.push(`/home/team/teamTree/${taskRes.data._key}`);
    }
  });
};
const deleteTree = (item, index, teamIndex) => {
  $q.dialog({
    title: `删除事务树`,
    message: `是否删除该事务树`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("card", {
        cardKey: item._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", `删除事务树成功`);
        let list = _.cloneDeep(teamList.value);
        list[teamIndex].cardList.splice(index, 1);
        if (list[teamIndex].cardList.length === 0) {
          treeKey.value = "";
          router.push(`/home/team`);
        } else {
          treeKey.value = list[teamIndex].cardList[0]._key;
          router.push(
            `/home/team/teamTree/${list[teamIndex].cardList[0]._key}`
          );
        }
        setTeamList(list);
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const editTree = (item, index, teamIndex) => {
  $q.dialog({
    title: `重命名事务树`,
    prompt: {
      model: item.title,
      type: "text", // optional
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async (data) => {
      let fileRes = (await api.request.patch("card", {
        cardKey: item._key,
        title: data,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", `重命名事务树成功`);
        let list = _.cloneDeep(teamList.value);
        list[teamIndex].cardList[index].title = data;
        setTeamList(list);
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
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
    <c-in-loading  :visible="!teamList" />
    <!-- <OnClickOutside @trigger="searchVibisible = false"> -->
    <div class="leftMenu-title">
      <div class="leftMenu-title-left">
        <div class="leftMenu-title-input" v-if="searchVibisible">
          <q-input
            outlined
            dense
            autofocus
            v-model="searchInput"
            class="full-width"
            clearable
          />
        </div>
        <template v-else></template>
      </div>
      <div class="leftMenu-title-right">
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
      <template v-for="(item, index) in searchList" :key="`team${index}`">
        <div
          class="teamMenu-item"
          @click="
            setTeamKey(item._key);
            setTargetTeamKey(item._key);
          "
          @mouseenter="setTargetTeamKey(item._key)"
          v-if="item._key !== privateTeamKey"
        >
          <div
            class="teamMenu-item-title icon-point"
            @click="$router.push(`/home/team`)"
            :style="{
          borderLeft: `5px solid ${item.top?'#f44336':'#07be51'}`,
          background: (teamKey === item._key||targetTeamKey === item._key)&&$route.path!.indexOf('home/team')!==-1 ? '#eee' : '',
        }"
          >
            <div>{{ item.name }}</div>
            <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
              <q-btn
                flat
                round
                @click="createTree(item, index)"
                v-if="spaceRole < 4"
              >
                <Icon name="a-chuangjian2" :size="20" />
              </q-btn>
              <q-btn flat round @click.stop="targetTeamKey = item._key">
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
          <template
            v-if="item.cardList&&item.cardList.length > 0 && teamKey === item._key&&$route.path!.indexOf('home/team')!==-1 "
          >
            <div
              class="teamMenu-item-subtitle icon-point"
              v-for="(taskMenuItem, taskMenuIndex) in item.cardList"
              :key="`taskMenu${taskMenuIndex}`"
              @click="
                $router.push(`/home/team/teamTree/${taskMenuItem._key}`);
                treeKey = taskMenuItem._key;
              "
              @mouseenter="treeOverkey = taskMenuItem._key"
              :style="{
                background: treeKey === taskMenuItem._key ? '#eee' : '',
              }"
            >
              <div>{{ taskMenuItem.title }}</div>
              <div
                class="teamMenu-item-icon"
                v-if="treeOverkey === taskMenuItem._key && item.role < 3"
              >
                <q-btn flat round size="9px" @click.stop="">
                  <Icon name="gengduo" :size="18" />
                  <q-menu anchor="top right" self="top left" class="q-pa-sm">
                    <q-list dense>
                      <q-item
                        clickable
                        v-close-popup
                        @click="editTree(taskMenuItem, taskMenuIndex, index)"
                        v-if="item.role < 3"
                      >
                        <q-item-section class="common-title"
                          >重命名</q-item-section
                        >
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="deleteTree(taskMenuItem, taskMenuIndex, index)"
                        v-if="item.role < 2"
                      >
                        <q-item-section class="common-title"
                          >删除</q-item-section
                        >
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </template>
        </div>
      </template>
      <div class="teamMenu-subtitle" @click="foldVisible = !foldVisible">
        <div>折叠的群组</div>
        <Icon :name="foldVisible ? 'a-youcezhedie21' : 'a-xiala2'" :size="8" />
      </div>
      <template
        v-for="(item, index) in teamFoldList"
        :key="`team${index}`"
        v-if="foldVisible"
      >
        <div
          class="teamMenu-item"
          @click="
            setTeamKey(item._key);
            setTargetTeamKey(item._key);
          "
          @mouseenter="setTargetTeamKey(item._key)"
        >
          <div
            class="teamMenu-item-title icon-point"
            @click="$router.push(`/home/team`)"
            :style="{
          borderLeft: `5px solid #ccc`,
          background: (teamKey === item._key||targetTeamKey === item._key)&&$route.path!.indexOf('home/team')!==-1 ? '#eee' : '',
        }"
          >
            <div class="">{{ item.name }}</div>
            <div class="teamMenu-item-icon" v-if="targetTeamKey === item._key">
              <q-btn
                flat
                round
                size="9px"
                @click.stop="targetTeamKey = item._key"
              >
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
        </div>
      </template>
      <!-- <div
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
        <div>{{ item.name }}</div>
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
                  <q-item-section class="common-title">取消折叠</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div> -->
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
  height: 100%;
  position: relative;
  z-index: 1;
  .teamMenu-subtitle {
    width: 100%;
    height: 30px;
    font-size: 14px;
    color: $grey-8;
    padding-right: 10px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
  }
  .teamMenu-list {
    height: calc(100% - 55px);
    @include scroll();
  }

  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 0px;
  }
}
.teamMenu-item {
  padding-right: 5px;
  box-sizing: border-box;
  .teamMenu-item-title {
    width: 100%;
    height: 35px;
    padding-left: 10px;
    font-size: 14px;
    border-radius: 4px;
    box-sizing: border-box;
    line-height: 35px;
    margin-top: 5px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
    > div:nth-child(1) {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &:hover {
      background: #f5f5f5;
    }
  }
  .teamMenu-item-subtitle {
    width: calc(100% - 10px);
    height: 30px;
    color: $grey-7;
    margin-left: 10px;
    padding-left: 10px;
    font-size: 13px;
    border-radius: 4px;
    line-height: 30px;
    margin: 2.5px 0px 2.5px 10px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
    &:hover {
      background: #f5f5f5;
    }
  }
}
</style>
<style></style>