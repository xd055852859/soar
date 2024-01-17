<script setup lang="ts">
import { ResultProps } from "@/interface/Common";

import _ from "lodash";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import cDialog from "@/components/common/cDialog.vue";
import api from "@/services/api";
import team from "@/views/home/team/menu/menu.vue";
import router from "@/router";
import { setMessage } from "@/services/util/common";
import { uploadFile } from "@/services/util/file";
import createSpace from "@/components/createSpace.vue";
const { closeNum } = storeToRefs(appStore.commonStore);
const { user } = storeToRefs(appStore.authStore);
const { spaceKey, spaceInfo, spaceList } = storeToRefs(appStore.spaceStore);

const { setUserInfo } = appStore.authStore;
const { getTeamList } = appStore.teamStore;
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
const showFold = ref<boolean>(true);
const searchVisible = ref<boolean>(false);
const chooseSpace = (key) => {
  setSpaceKey(key);
  router.push("/space");
};
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
      ...user.value,
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

watch(
  spaceKey,
  (newKey) => {
    if (newKey) {
      setSpaceKey(newKey);
      getTeamList(newKey);
    }
  },
  { immediate: true }
);
watch(
  user,
  (newUser) => {
    if (newUser) {
      userAvatar.value = newUser?.userAvatar ? newUser.userAvatar : "";
      userName.value = newUser?.userName ? newUser.userName : "";
      console.log(newUser);
      console.log(userAvatar.value, userName.value);
      if (newUser && !newUser.userAvatar && !newUser.userName) {
        userVisible.value = true;
      }
    }
  },
  { immediate: true }
);
watch(userVisible, (newVisible) => {
  if (!newVisible) {
    userAvatar.value = user.value?.userAvatar ? user.value.userAvatar : "";
    userName.value = user.value?.userName ? user.value.userName : "";
  }
});
</script>
<template>
  <div class="home">
    <div
      class="left"
      :style="
        closeNum !== -1
          ? {
              animation: `${
                closeNum === 0 ? 'moveLeft' : 'moveRight'
              } 1s forwards`,
            }
          : {}
      "
    >
      <div class="left-title icon-point">
        <div class="select-third-item" style="width: 220px">
          <q-avatar color="primary" text-color="white" size="lg">
            <img
              :src="
                spaceInfo?.logo ? spaceInfo.logo : '/common/defaultGroup.png'
              "
            />
          </q-avatar>

          <div class="select-item-name single-to-long">
            {{ spaceInfo?.name }}
          </div>

          <q-icon name="keyboard_arrow_down" size="28px" />
          <q-menu style="width: 220px; padding: 10px">
            <div
              class="select-third-item icon-point"
              @click="userVisible = true"
            >
              <q-avatar color="primary" text-color="white" size="lg">
                <img
                  :src="userAvatar ? userAvatar : '/common/defaultPerson.png'"
                />
              </q-avatar>
              <div class="select-item-name single-to-long">
                {{ userName }}
              </div>
            </div>
            <q-list class="q-mb-md">
              <q-item
                v-for="(item, index) in spaceList"
                :key="`space${index}`"
                clickable
                v-close-popup
                class=""
                @click="setSpaceKey(item._key)"
              >
                <q-item-section>{{ item.name }}</q-item-section>
                <q-icon
                  name="settings"
                  size="28px"
                  @click="chooseSpace(item._key)"
                />
              </q-item>
            </q-list>
            <q-btn
              class="full-width"
              label="创建空间"
              color="primary"
              @click="spaceVisible = true"
            />
          </q-menu>
        </div>
      </div>
      <q-list>
        <q-item to="/home/task" exact>
          <q-item-section avatar>
            <q-icon name="alarm" />
          </q-item-section>
          <q-item-section> 事务 </q-item-section>
          <q-item-section avatar>
            <q-icon name="check_circle" />
          </q-item-section>
        </q-item>
        <q-item to="/home/mate" exact>
          <q-item-section avatar>
            <q-icon name="mail" />
          </q-item-section>

          <q-item-section> 队友 </q-item-section>
        </q-item>
        <q-item to="/home/resource" exact>
          <q-item-section avatar>
            <q-icon name="movie" />
          </q-item-section>

          <q-item-section> 资源 </q-item-section>
        </q-item>
      </q-list>
      <!-- <q-tabs vertical inline-label style="height: 160px">
        <q-route-tab icon="alarm" label="事务" to="/home/task" exact />
        <q-route-tab icon="mail" label="队友" to="/home/work" exact />
        <q-route-tab icon="movie" label="资源" to="/home/resource" exact />
      </q-tabs> -->
      <q-separator />
      <team />
    </div>
    <div class="right">
      <router-view></router-view>
    </div>
    <cDialog
      :visible="userVisible"
      @close="userVisible = false"
      title="用户设置"
    >
      <template #content>
        <div className="form-container">
          <div className="form-logo">
            <div className="upload-button upload-img-button logo-box">
              <img
                :src="userAvatar"
                alt=""
                style="width: 100%, height:100%"
                class="upload-cover"
                v-if="userAvatar"
              />
              <q-icon name="add" style="color: #ebebeb" size="80px" v-else />
              <input
                type="file"
                accept="image/*"
                @change="
                  //@ts-ignore
                  uploadImage($event.target.files[0], 'avatar')
                "
                class="upload-img"
              />
            </div>
          </div>
          <div className="form-name">
            <q-input
              outlined
              v-model="userName"
              label="用户名"
              :rules="[(val) => !!val || '用户名必填']"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <q-btn
          flat
          label="取消"
          color="grey-5"
          @click="userVisible = false"
          :dense="true" />
        <q-btn label="确认" color="primary" @click="updateUser"
      /></template>
    </cDialog>
    <cDialog
      :visible="spaceVisible"
      @close="spaceVisible = false"
      title="创建团队"
    >
      <template #content>
        <div class="spaceAdd-container">
          <createSpace @close="spaceVisible = false" />
        </div>
      </template>
    </cDialog>
  </div>
</template>
<style scoped lang="scss">
.home {
  width: 100%;
  height: 100vh;
  @include flex(space-between, center, null);
  .left {
    width: 260px;
    height: 100vh;
    padding: 10px;
    box-sizing: border-box;
    background: $grey-2;
    box-shadow: 1px 0px 0px 0px #e1e1e1;
    position: relative;
    z-index: 10;
    .left-title {
      width: 100%;
      margin-bottom: 20px;
    }
  }
  .right {
    flex: 1;
    height: 100vh;
    position: relative;
    z-index: 1;
    width: 0px;
  }
}
.form-container {
  width: 400px;
  height: 380px;
  .form-logo {
    width: 100%;
    height: 300px;
    @include flex(center, center, null);
    .logo-box {
      width: 250px;
      height: 250px;
      border-radius: 12px;
      overflow: hidden;
    }
  }
  .form-name {
    width: 100%;
    height: 50px;
    margin: 10px 0px;
  }
}
.spaceAdd-container {
  width: 500px;
  padding: 15px 34px;
  box-sizing: border-box;
  @include scroll();
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
