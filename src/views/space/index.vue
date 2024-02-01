<script setup lang="ts">
import { ResultProps } from "@/interface/Common";

import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import cDialog from "@/components/common/cDialog.vue";
import api from "@/services/api";

import router from "@/router";
import { setMessage } from "@/services/util/common";
import { uploadFile } from "@/services/util/file";
const { deviceType } = storeToRefs(appStore.commonStore);
const { closeNum } = storeToRefs(appStore.commonStore);
const { user } = storeToRefs(appStore.authStore);
const { spaceKey, spaceInfo, spaceList } = storeToRefs(appStore.spaceStore);

const { setUserInfo } = appStore.authStore;

const { setSpaceKey, setSpaceList } = appStore.spaceStore;

const noticeVisible = ref<boolean>(false);
const spaceVisible = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const noVerify = ref<boolean>(false);
const isPublic = ref<boolean>(false);
const userVisible = ref<boolean>(false);
const clearNum = ref<number>(0);
const defaultRole = ref<number>(4);
const bookIndex = ref<number>(-1);
const spaceName = ref<string>("");
const spaceLogo = ref<string>("");
const bookName = ref<string>("");
const infoState = ref<string>("create");
const userName = ref<string>("");
const userAvatar = ref<string>("");
const showFast = ref<boolean>(true);
const showBook = ref<boolean>(true);
const showFold = ref<boolean>(true);
const searchVisible = ref<boolean>(false);

const updateUser = async () => {
  if (!userName.value) {
    setMessage("error", "请输入用户名");
    return;
  }
  let userRes = (await api.request.patch("user", {
    userName: userName.value,
    userAvatar: userAvatar.value,
  })) as ResultProps;
  if (userRes.msg === "OK") {
    //@ts-ignore
    let newUser: User = {
      ...user,
      userName: userName.value,
      userAvatar: userAvatar.value,
    };
    setMessage("success", "编辑用户成功");
    userVisible.value = false;
    setUserInfo(newUser);
  }
};
const uploadImage = (file, type) => {
  let mimeType = ["image/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      userAvatar.value = url;
    });
  }
};
// const outSpace = (index) => {
//   ElMessageBox.confirm("是否退出该空间", "退出空间", {
//     confirmButtonText: "确认",
//     cancelButtonText: "取消",
//   }).then(async () => {
//     let outRes = (await api.request.delete("spaceMember/exit", {
//       spaceKey: spaceKey.value,
//     })) as ResultProps;
//     if (outRes.msg === "OK") {
//       ElMessage.success("退出空间成功");
//       const list = _.cloneDeep(spaceList.value);
//       list.splice(index, 1);
//       setSpaceKey(list[0]._key);
//       setSpaceList(list);
//     }
//   });
// };
</script>
<template>
  <div class="space">
    <div class="left">
      <div
        class="left-title icon-point common-title"
        @click="router.push('/home')"
      >
        <q-icon name="navigate_before" size="32px" />
        返回空间
      </div>
      <!-- <q-tabs vertical inline-label>
        <q-route-tab label="空间设置" :to="`/space/setting`" />
        <q-route-tab label="成员管理" :to="`/space/member`" />
        <q-route-tab label="小组管理" :to="`/space/group`" />
        <q-route-tab label="安全性" :to="`/space/safety`" />
        <q-route-tab label="升级/续费" :to="`/space/vip`" />
      </q-tabs> -->
      <q-list>
        <q-item to="/space/setting" exact class="left-menu-item">
          <q-item-section avatar class="left-menu-avatar">
            <q-icon name="o_settings" />
          </q-item-section>
          <q-item-section class="common-title">空间设置</q-item-section>
        </q-item>
        <q-item to="/space/member" exact class="left-menu-item">
          <q-item-section avatar class="left-menu-avatar">
            <q-icon name="o_person" />
          </q-item-section>
          <q-item-section class="common-title">成员管理</q-item-section>
        </q-item>
        <q-item to="/space/group" exact class="left-menu-item">
          <q-item-section avatar class="left-menu-avatar">
            <q-icon name="o_group" />
          </q-item-section>
          <q-item-section class="common-title">小组管理</q-item-section>
        </q-item>
        <q-item to="/space/safety" exact class="left-menu-item">
          <q-item-section avatar class="left-menu-avatar">
            <q-icon name="o_lock" />
          </q-item-section>
          <q-item-section class="common-title">安全性</q-item-section>
        </q-item>
        <q-item to="/space/vip" exact class="left-menu-item">
          <q-item-section avatar class="left-menu-avatar">
            <q-icon name="o_paid" />
          </q-item-section>
          <q-item-section class="common-title">升级/续费</q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
  </div>
</template>
<style scoped lang="scss">
.space {
  width: 100vw;
  height: 100vh;
  @include flex(space-between, center, null);
  .left {
    width: 250px;
    height: 100vh;
    padding: 20px 0px 10px 0px;
    box-sizing: border-box;
    background-color: #f2f3f6;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: relative;
    z-index: 10;
    .left-title {
      width: 100%;
      margin-bottom: 20px;
      box-sizing: border-box;
      @include flex(flex-start, center, null);
    }
  }
  .right {
    flex: 1;
    height: 100vh;
    position: relative;
    background-color: #fafafb;
    z-index: 1;
    width: 0;
    // @include p-number(15px, 35px);
  }
}
</style>

<style lang="scss">
.left-menu-item {
  .left-menu-avatar {
    /* prettier-ignore */
    min-width:30px;
    // padding-right: 0px;
  }
  .left-common-title {
    // height: 100%;
    font-size: 14px;
    // @include flex(flex-start, center, null);
    // line-height: 40px;
  }
}
</style>
