<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import team from "@/views/home/team/menu/index.vue";
import router from "@/router";
import { VueDraggableNext } from "vue-draggable-next";
import { setMessage } from "@/services/util/common";
import { uploadFile } from "@/services/util/file";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Icon from "@/components/common/Icon.vue";
import cDialog from "@/components/common/cDialog.vue";

import createSpace from "@/components/createSpace.vue";
const { spaceInfo, spaceList } = storeToRefs(appStore.spaceStore);
const { user } = storeToRefs(appStore.authStore);
const { clearStore } = appStore.commonStore;
const { setUserInfo, setToken } = appStore.authStore;
const { setSpaceKey, setSpaceList } = appStore.spaceStore;
const { setTeamKey } = appStore.teamStore;
const userVisible = ref<boolean>(false);
const userName = ref<string>("");
const userAvatar = ref<string>("");
const spaceVisible = ref<boolean>(false);
const sortList = ref<any>([]);
const chooseSpace = (key) => {
  setSpaceKey(key);
  router.push("/space");
};
const dragSpace = async () => {
  let teamKeyArr = sortList.value.map((item) => item._key);
  let teamRes = (await api.request.patch("team/order", {
    teamKeyArr: teamKeyArr,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    setSpaceList([...sortList.value]);
  }
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
const logout = () => {
  router.push("/");
  localStorage.clear();
  sessionStorage.clear();
  setMessage("success", "退出登录成功");
  setToken("");
  clearStore();
};
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
watch(
  spaceList,
  (newList) => {
    if (newList) {
      sortList.value = [...newList];
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="left-title icon-point">
    <div class="select-third-item">
      <q-avatar rounded color="primary" text-color="white" size="lg">
        <img
          :src="spaceInfo?.logo ? spaceInfo.logo : '/common/defaultGroup.png'"
        />
      </q-avatar>

      <div class="select-item-name single-to-long">
        {{ spaceInfo?.name }}
        <q-icon name="o_keyboard_arrow_down" size="28px" />
      </div>

      <q-menu style="width: 220px; padding: 10px">
        <div class="select-third-item icon-point" @click="userVisible = true">
          <q-avatar color="primary" text-color="white" size="lg">
            <img :src="userAvatar ? userAvatar : '/common/defaultPerson.png'" />
          </q-avatar>
          <div class="select-item-name single-to-long">
            {{ userName }}
          </div>
        </div>
        <q-list class="q-mb-md left-space-item">
          <VueDraggableNext v-model="sortList" item-key="id" @end="dragSpace">
            <q-item
              v-for="(item, index) in sortList"
              :key="`space${index}`"
              clickable
              v-close-popup
              class="left-space-title dp--center"
              @click="setSpaceKey(item._key)"
            >
              <Icon name="a-huibaoyaosu-yidong21" :size="14" class="q-mr-sm" />
              <div style="width: calc(100% - 40px)">
                <q-avatar
                  rounded
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm"
                >
                  <img
                    :src="item.logo ? item.logo : '/common/defaultGroup.png'"
                  /> </q-avatar
                >{{ item.name }}
              </div>
              <q-icon
                name="o_settings"
                size="22px"
                @click="chooseSpace(item._key)"
              />
            </q-item>
          </VueDraggableNext>
        </q-list>
        <q-btn
          class="full-width"
          label="创建空间"
          color="primary"
          @click="spaceVisible = true"
        />
        <div class="row justify-end items-center q-mt-sm">
          <q-btn flat label="退出登录" color="grey-5" @click="logout" />
        </div>
      </q-menu>
    </div>
  </div>
  <!-- <div @click="router.push('/home/note')">速记</div> -->
  <q-list @click="setTeamKey('')">
    <q-item
      clickable
      :active="$route.name === 'explore'"
      @click="$router.push('/home/explore')"
      class="left-menu-item"
    >
      <q-item-section avatar class="left-menu-avatar">
        <Icon name="a-tansuo21" :size="20" />
      </q-item-section>
      <q-item-section class="left-common-title">探索</q-item-section>
      <q-item-section side @click.stop="$router.push('/home/note')">
        <Icon
          name="a-suji22"
          :size="20"
          :color="$route.name === 'note' ? '#07be51' : '#333'"
        />
        <!-- <q-icon
              name="sym_o_package_2"
              :color="$route.name === 'note' ? 'primary' : 'grey'"
            >
              <q-tooltip :offset="[10, 5]"> 速记 </q-tooltip>
            </q-icon> -->
      </q-item-section>
    </q-item>
    <q-item
      clickable
      :active="$route.name === 'report'"
      @click="$router.push('/home/report')"
      class="left-menu-item"
    >
      <q-item-section avatar class="left-menu-avatar">
        <Icon name="a-huibao21" :size="18" />
        <!-- <q-icon name="o_grid_view" /> -->
      </q-item-section>
      <q-item-section class="left-common-title">汇报</q-item-section>
    </q-item>
    <!-- <q-item clickable to="/home/calendar" exact>
          <q-item-section avatar>
            <Icon name="a-richeng2" :size="20" color="#333" />
          </q-item-section>
          <q-item-section>日程</q-item-section>
        </q-item> -->
    <!-- <q-item to="/home/mate" exact>
          <q-item-section avatar>
            <q-icon name="o_group" />
          </q-item-section>

          <q-item-section>队友</q-item-section>
        </q-item>
        <q-item to="/home/resource" exact>
          <q-item-section avatar>
            <q-icon name="o_folder_open" />
          </q-item-section>

          <q-item-section>资源</q-item-section>
        </q-item> -->
    <q-separator />
    <q-item
      clickable
      :active="$route.name === 'task'"
      @click="$router.push('/home/task')"
      class="left-menu-item"
    >
      <q-item-section avatar class="left-menu-avatar">
        <Icon name="a-mokexiaoshumiao-weixinyuan2" :size="22" />
      </q-item-section>
      <q-item-section class="left-common-title">事务</q-item-section>
      <q-item-section side @click.stop="$router.push('/home/taskBoard')">
        <Icon
          name="a-renwuchi2"
          :size="20"
          :color="$route.name === 'taskBoard' ? '#07be51' : '#333'"
        />
      </q-item-section>
    </q-item>
    <q-item
      clickable
      :active="
        $route.name === 'mateList' ||
        $route.name === 'mateDetail' ||
        $route.name === 'mateSetting'
      "
      @click="$router.push('/home/mate/list')"
      class="left-menu-item"
    >
      <q-item-section avatar class="left-menu-avatar">
        <Icon name="a-duiyou2" :size="20" />
      </q-item-section>

      <q-item-section class="left-common-title">队友</q-item-section>
    </q-item>
    <q-item to="/home/resource" class="left-menu-item" exact>
      <q-item-section avatar class="left-menu-avatar">
        <Icon name="ziyuan" :size="20" />
      </q-item-section>

      <q-item-section class="left-common-title">资源</q-item-section>
    </q-item>
  </q-list>
  <q-separator />
  <team />
  <cDialog :visible="userVisible" @close="userVisible = false" title="用户设置">
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
</template>
<style scoped lang="scss">
.left-title {
  width: 100%;
  margin-bottom: 10px;
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
  width: 716px;
  padding: 15px 34px;
  box-sizing: border-box;
  @include scroll();
}
</style>
<style lang="scss">
.left-space-item {
  width: 100%;
  .left-space-title {
    font-size: 20px;
    @include flex(space-between, center, null);
  }
  .select-item-icon {
    display: none;
  }
  &:hover {
    .select-item-icon {
      @include flex(center, center, null);
    }
  }
}
.left-menu-item {
  .left-menu-avatar {
    /* prettier-ignore */
    min-width:30Px;
    // padding-right: 0px;
  }
  .left-common-title {
    // height: 100%;
    font-size: 22px;
    // @include flex(flex-start, center, null);
    // line-height: 40px;
  }
}
</style>
