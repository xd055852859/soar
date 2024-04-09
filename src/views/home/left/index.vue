<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import TeamMenu from "@/views/home/left/menu/team/index.vue";
import ResourceMenu from "@/views/home/left/menu/resource/index.vue";
import MateMenu from "@/views/home/left/menu/mate/index.vue";
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import router from "@/router";
import { VueDraggableNext } from "vue-draggable-next";
import { setMessage } from "@/services/util/common";
import { base64ToFile, fileToBase64, uploadFile } from "@/services/util/file";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Icon from "@/components/common/Icon.vue";
import cDialog from "@/components/common/cDialog.vue";

import createSpace from "@/components/createSpace.vue";
import { commonStore } from "@/store/common";
const props = defineProps<{
  showState?: boolean;
}>();
const { token, user } = storeToRefs(appStore.authStore);
const {
  spaceKey,
  spaceInfo,
  spaceList,
  lockList,
  spaceRole,
  spaceMessageNum,
  spaceTaskNum,
  spaceReportNum,
  privateTeamKey,
} = storeToRefs(appStore.spaceStore);

const { clearStore, setSearchVisible, setIframeDetail } = appStore.commonStore;
const { setUserInfo, setToken } = appStore.authStore;
const { setSpaceKey, setSpaceList } = appStore.spaceStore;
const { setTeamKey, setTargetTeamKey } = appStore.teamStore;
const { setCardKey } = appStore.cardStore;
const { clickExplore } = appStore.exploreStore;
const userVisible = ref<boolean>(false);
const cropperVisible = ref<boolean>(false);
const userName = ref<string>("");
const userAvatar = ref<string>("");
const spaceVisible = ref<boolean>(false);
const spaceMenuVisible = ref<boolean>(false);
const sortList = ref<any>([]);
const urlBase64 = ref<any>(null);
const cropperRef = ref<any>(null);
const menuTab = ref<string>("team");

const chooseSpace = (key) => {
  setSpaceKey(key);
  setTeamKey("");
  setCardKey("");
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
// const uploadImage = (file, type) => {
//   let mimeType = ["image/*"];
//   if (file) {
//     uploadFile(file, mimeType, async (url, name) => {
//       userAvatar.value = url;
//     });
//   }
// };
const uploadImage = async (file, type) => {
  if (file) {
    console.log(fileToBase64);
    urlBase64.value = await fileToBase64(file);
    console.log(urlBase64.value);
    cropperVisible.value = true;
  }
};
const saveImg = () => {
  let mimeType = ["image/*"];
  console.log(cropperRef.value);
  cropperRef.value.getCropData((data) => {
    // do something
    console.log(data);
    let file = base64ToFile(data);
    uploadFile(file, mimeType, async (url) => {
      userAvatar.value = url;
      cropperVisible.value = false;
    });
  });
};
const logout = () => {
  router.push("/");
  localStorage.clear();
  sessionStorage.clear();
  setMessage("success", "退出登录成功");
  setToken("");
  commonStore().$reset();
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
    <!--       @mouseenter="spaceMenuVisible = true" -->
    <div class="select-third-item" style="width: 100%; height: 45px">
      <q-avatar :color="spaceInfo?.logo ? '#fff' : 'primary'" rounded size="lg">
        <img v-if="spaceInfo?.logo" :src="spaceInfo.logo" />
        <template v-else-if="spaceInfo?.name">
          <div class="text-white">
            {{ spaceInfo.name.substring(0, 1) }}
          </div>
        </template>
        <img v-else src="/common/defaultGroup.png" />
      </q-avatar>

      <div
        class="select-item-name single-to-long dp--center"
        style="max-width: calc(100% - 80px); font-weight: bolder"
      >
        {{ spaceInfo?.name }}
        <Icon name="a-xiala2" :size="8" class="q-ml-sm" />
      </div>
      <!--   @mouseleave="spaceMenuVisible = false" -->
      <q-menu
        style="width: 280px; padding: 10px; max-height: 70vh"
        v-model="spaceMenuVisible"
      >
        <q-list class="q-mb-md left-space-item">
          <VueDraggableNext v-model="sortList" item-key="id" @end="dragSpace">
            <q-item
              v-for="(item, index) in sortList"
              :key="`space${index}`"
              clickable
              v-close-popup
              class="left-space-title dp--center q-px-xs q-py-xs"
              @click="
                setSpaceKey(item._key);
                setTeamKey('');
                setCardKey('');
                router.push('/home');
              "
            >
              <Icon name="a-huibaoyaosu-yidong21" :size="14" class="q-mr-sm" />
              <div style="width: calc(100% - 40px)">
                <q-avatar
                  rounded
                  :color="item?.logo ? '#fff' : 'primary'"
                  size="sm"
                  class="q-mr-sm"
                >
                  <img v-if="item?.logo" :src="item.logo" />

                  <template v-else-if="item?.name">
                    <div class="text-white">
                      {{ item.name.substring(0, 1) }}
                    </div>
                  </template>
                  <img v-else src="/common/defaultGroup.png" /> </q-avatar
                >{{ item.name }}
              </div>
              <Icon
                name="a-shezhi2"
                :size="18"
                class="q-mr-sm"
                color="#bdbdbd"
                v-if="item.role < 2"
                @click.stop="chooseSpace(item._key)"
              />
              <q-space />
            </q-item>
          </VueDraggableNext>
        </q-list>
        <q-btn
          class="full-width"
          label="创建空间"
          color="primary"
          @click="spaceVisible = true"
        />
        <!-- <div class="row justify-end items-center q-mt-sm">
          <q-btn flat label="退出登录" color="grey-5" @click="logout" />
        </div> -->
      </q-menu>
    </div>
  </div>
  <div class="left-button">
    <div class="left-button-item">
      <q-btn flat round @click="$router.push('/home/explore')">
        <Icon
          name="zhuye1"
          :size="22"
          :color="$route.name === 'explore' ? '#07be51' : '#333'"
        />
        <q-tooltip> 应用中心 </q-tooltip>
      </q-btn>
    </div>
    <div class="left-button-item">
      <q-btn
        flat
        round
        @click="
          setTeamKey('');
          setSearchVisible(true);
        "
      >
        <Icon name="sousuo" :size="20" />
        <q-tooltip> 搜索 </q-tooltip>
      </q-btn>
    </div>
    <div class="left-button-item">
      <q-btn
        flat
        round
        @click.stop="$router.push('/home/notice')"
        class="left-notice-button"
      >
        <div class="badge-box">
          <q-badge
            rounded
            color="red"
            v-if="spaceMessageNum"
            class="badge-button"
            style="top: -5px; right: -20px"
            >{{ spaceMessageNum }}</q-badge
          >
          <Icon name="xiaoxi1" :size="20" />
        </div>

        <q-tooltip> 消息中心 </q-tooltip>
      </q-btn>
    </div>

    <div class="left-button-item">
      <q-btn flat round>
        <Icon name="caidanrukou" :size="20" />
        <q-tooltip> 更多操作 </q-tooltip>
        <q-menu class="q-pa-sm" auto-close anchor="top right" self="top left">
          <q-list dense>
            <!--  @click="editFile(item._key, index)" -->
            <q-item clickable v-close-popup @click="userVisible = true">
              <q-item-section>个人设置</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="logout()">
              <q-item-section>退出登录</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
  <div
    class="left-subtitle"
    @click="
      setIframeDetail({
        url: `https://hb.qingtime.cn/?token=${token}&teamKey=${spaceKey}`,
        title: '汇报',
      });
      router.push('/home/freedom');
    "
    :style="{ color: $route.name === 'freedom' ? '#07be51' : '#333' }"
  >
    <Icon
      name="huibao1"
      :size="20"
      :color="$route.name === 'freedom' ? '#07be51' : '#333'"
      class="q-mr-sm"
    />

    <!-- <div class="badge-box"> -->
    日常汇报
    <q-badge rounded color="red" v-if="spaceReportNum" class="q-ml-sm">{{
      spaceReportNum
    }}</q-badge>
    <!-- </div> -->
  </div>
  <div
    class="left-subtitle"
    @click="$router.push('/home/task')"
    :style="{ color: $route.name === 'task' ? '#07be51' : '#333' }"
  >
    <Icon
      name="xiangmu"
      :size="20"
      :color="$route.name === 'task' ? '#07be51' : '#333'"
      class="q-mr-sm"
    />
    <!-- <div class="badge-box"> -->

    项目任务
    <q-badge rounded color="red" v-if="spaceTaskNum" class="q-ml-sm">{{
      spaceTaskNum
    }}</q-badge>
    <!-- </div> -->
  </div>
  <q-separator />
  <div class="left-menu">
    <div class="left-menu-tab">
      <q-tabs
        dense
        v-model="menuTab"
        active-color="primary"
        class="text-grey-7"
      >
        <q-tab name="team" label="群组" style="width: 60px" />
        <q-tab name="resource" label="文档" style="width: 60px" />
        <q-tab name="mate" label="队友" style="width: 60px" />
      </q-tabs>
    </div>
    <TeamMenu v-if="menuTab === 'team'" />
    <ResourceMenu v-else-if="menuTab === 'resource'" />
    <MateMenu v-else-if="menuTab === 'mate'" />
  </div>

  <c-dialog
    :visible="cropperVisible"
    @close="cropperVisible = false"
    title="裁剪图片"
  >
    <template #content>
      <div style="width: 500px; height: 400px">
        <VueCropper
          ref="cropperRef"
          :img="urlBase64"
          :autoCrop="true"
          :centerBox="true"
        />
      </div>
    </template>

    <template #footer>
      <q-btn
        flat
        label="取消"
        color="grey-5"
        @click="cropperVisible = false"
        :dense="true" />
      <q-btn label="确认" color="primary" @click="saveImg"
    /></template>
  </c-dialog>
  <c-dialog
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
              style="width: 100%; height: 100%"
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
  </c-dialog>
  <c-dialog
    :visible="spaceVisible"
    @close="spaceVisible = false"
    title="创建团队"
  >
    <template #content>
      <div class="spaceAdd-container">
        <createSpace @close="spaceVisible = false" />
      </div>
    </template>
  </c-dialog>
</template>

<style scoped lang="scss">
.left-title {
  width: 100%;
  height: 70px;
  @include flex(center, center, null);
}

.left-button {
  width: 100%;
  @include flex(space-between, center, null);

  .left-button-item {
    width: 35px;
    flex-shrink: 0;
    @include flex(center, center, null);
  }
}
.left-subtitle {
  width: 100%;
  height: 45px;
  line-height: 45px;
  cursor: pointer;
  @include flex(flex-start, center, null);
}
.left-menu {
  width: 100%;
  height: calc(100% - 210px);
  position: relative;
  z-index: 1;
  .left-menu-tab {
    position: absolute;
    left: 0px;
    top: 8px;
    z-index: 2;
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
  width: 716px;
  padding: 15px 34px;
  box-sizing: border-box;
  @include scroll();
}
</style>

<style lang="scss">
.badge-box {
  position: relative;
  z-index: 1;
  .badge-button {
    position: absolute;
    z-index: 2;
    top: 5px;
    right: -25px;
  }
}

.left-space-item {
  width: 100%;

  .left-space-title {
    // font-size: 14px;
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
  border-radius: 4px;

  .left-menu-avatar {
    min-width: 30px;
  }
}
.leftMenu-title {
  width: 100%;
  height: 50px;
  font-weight: bold;
  font-size: 16px;
  @include flex(space-between, center, null);
  .leftMenu-title-left {
    width: calc(100% - 85px);
    height: 100%;
    // @include flex(flex-start, center, null);
    .leftMenu-title-input {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 3;
      background-color: #fff;
      @include flex(flex-start, center, null);
    }
  }
  .leftMenu-title-right {
    width: 85px;
    height: 100%;
    @include flex(flex-end, center, null);
  }
}
</style>
