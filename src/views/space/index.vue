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
      <div class="left-title icon-point" @click="router.push('/home')">
        <q-icon name="navigate_before" size="28px" />
        返回空间
      </div>
      <q-tabs vertical inline-label>
        <q-route-tab label="空间设置" :to="`/space/setting`" />
        <q-route-tab label="成员管理" :to="`/space/member`" />
        <q-route-tab label="小组管理" :to="`/space/group`" />
        <q-route-tab label="安全性" :to="`/space/safety`" />
        <q-route-tab label="升级/续费" :to="`/space/vip`" />
      </q-tabs>
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
    width: 240px;
    height: 100vh;
    padding: 20px 0px 10px 0px;
    box-sizing: border-box;
    background: $grey-2;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: relative;
    z-index: 10;
    .left-title {
      width: 100%;
      margin-bottom: 20px;
      padding: 0px 0px 0px 20px;
      box-sizing: border-box;
    }
  }
  .right {
    flex: 1;
    height: 100vh;
    position: relative;
    z-index: 1;
    width: 0;
  }
}
</style>

<style>
@keyframes moveLeft {
  0% {
    width: 240px;
    opacity: 1;
  }
  100% {
    width: 0px;
    opacity: 0;
  }
}
@keyframes moveRight {
  0% {
    width: 0px;
    opacity: 0;
  }
  50% {
    width: 240px;
    opacity: 1;
  }
}
</style>
