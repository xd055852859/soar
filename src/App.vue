<script setup lang="ts">
import request from "@/services/api";
import cDialog from "@/components/common/cDialog.vue";
import cIframe from "@/components/common/cIframe.vue";
import Search from "@/components/search/search.vue";
import Icon from "@/components/common/Icon.vue";
import { storeToRefs } from "pinia";
import router from "@/router";
import appStore from "@/store";
import _ from "lodash";
import { formatDocUrl, getSearchParamValue } from "./services/util/url";
import { setMessage } from "./services/util/common";
import { useQuasar } from "quasar";

const $q = useQuasar();
const socket: any = inject("socket");
const { token } = storeToRefs(appStore.authStore);
const {
  musicSrc,
  musicNum,
  deviceWidth,
  deviceHeight,
  iframeInfo,
  iframeVisible,
  searchVisible,
} = storeToRefs(appStore.commonStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setToken, getUserInfo } = appStore.authStore;
const { setSpaceKey } = appStore.spaceStore;
const { setTeamKey } = appStore.teamStore;

const {
  setDeviceInfo,
  setDeviceType,
  setSearchVisible,
  setClose,
  setIframeVisible,
} = appStore.commonStore;
const musicRef = ref<any>(null);
const closeMessage = ref<any>(null);
onMounted(() => {
  console.log(import.meta.env.MODE);
  changeDevice();
  // 检测设备方向
  window.addEventListener("orientationchange", _.debounce(changeDevice, 100));
  // // 检测设备方向
  window.addEventListener("resize", changeDevice);
  window.addEventListener("message", getMessage);
  setClose(
    localStorage.getItem("closeNum") ? +localStorage.getItem("closeNum")! : -1,
  );
  const search = window.location.search
    ? window.location.search.split("?")[1]
    : window.location.hash.split("?")[1];
  const token = getSearchParamValue(search, "token")
    ? (getSearchParamValue(search, "token") as string)
    : localStorage.getItem("auth_token");
  console.log(token);
  if (token) {
    request.setToken(token);
    setToken(token);
    setSpaceKey(
      localStorage.getItem("spaceKey") &&
        localStorage.getItem("spaceKey") != "undefined"
        ? localStorage.getItem("spaceKey")
        : "",
    );
    setTeamKey(
      localStorage.getItem("teamKey") &&
        localStorage.getItem("teamKey") != "undefined"
        ? localStorage.getItem("teamKey")
        : "",
    );
    socket.on("connect", () => {
      socket.emit("login", token);
      console.log(socket.id);
      socket.on("remind", (data) => {
        console.log(data);
        if (data.teamKey === spaceKey.value) {
          console.log(data.title);
          // setTimeout(() => {
          $q.notify({
            progress: true,
            icon: "warning",
            color: "warning",
            message: data.title,
            timeout: 60000,
            position: "top-right",
          });
          // }, 60000);
        }
      });
    });
  } else {
    router.replace("/");
  }
});
onUnmounted(() => {
  // 检测设备方向
  window.removeEventListener(
    "orientationchange",
    _.debounce(changeDevice, 100),
  );
  // // 检测设备方向
  window.removeEventListener("resize", changeDevice);
  window.removeEventListener("message", getMessage);
});
const changeDevice = () => {
  setDeviceInfo(
    document.documentElement.offsetWidth,
    document.documentElement.offsetHeight,
  );
  let html: any = document.getElementById("htmlId");

  var keyboardHeight =
    window.innerHeight - document.documentElement.clientHeight;
  // 判断键盘是否弹起（假设键盘高度大于 0）
  if (keyboardHeight > 0) {
    html.style.height = window.innerHeight + "px";
  } else {
    if (deviceWidth.value < deviceHeight.value) {
      setDeviceType("phone");
    } else {
      setDeviceType("pc");
      console.log(deviceWidth.value);
      // if (deviceWidth.value >= 1920) {
      // html.style.fontSize = deviceFontSize.value;
      // }
    }
    // html.style.fontSize = deviceFontSize.value;
  }
};
const getMessage = (e) => {
  if (e.data && !e.data.source) {
    const messageData =
      typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    console.log(messageData);
    switch (messageData.eventName) {
      case "showFile":
      case "showDoc":
      case "showTree":
        setIframeVisible(true, {
          url: `https://soar.cn/base/#/login?token=${token.value}&redirectPath=node/${messageData.data._key}`,
          title: messageData.title,
        });
        break;
      case "showTask":
        setIframeVisible(false, null);
        router.push(`/home/taskBoard`);
        break;
    }
  }
};

//初始化
watch(
  token,
  (newVal) => {
    if (newVal) {
      getUserInfo();
    }
  },
  { immediate: true },
);
watch([musicSrc, musicNum], ([newSrc, newNum]) => {
  if (musicRef.value) {
    musicRef.value.pause();
    musicRef.value.src = newSrc;
    nextTick(() => {
      musicRef.value.play();
    });
  }
});
</script>

<template>
  <router-view></router-view>
  <c-dialog
    :visible="searchVisible"
    title="搜索文件"
    @close="setSearchVisible(false)"
    :dialogStyle="{ width: '550px' }"
  >
    <template #content>
      <Search />
    </template>
  </c-dialog>

  <Teleport to="body">
    <div class="card-fullDialog" v-if="iframeVisible">
      <q-btn
        round
        color="primary"
        icon="close"
        size="16px"
        class="card-back"
        @click="setIframeVisible(false, null)"
      />
      <!-- <TaskBoard
        :targetKey="iframeInfo.userKey"
        :targetTag="iframeInfo.planTag"
      /> -->
      <c-iframe :url="iframeInfo.url" :title="iframeInfo.title" />
    </div>
  </Teleport>
</template>

<style lang="scss">
// *::-webkit-scrollbar {
//   width: 4px;
//   height: 2px;
// }
.card-fullDialog {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 9900;
  top: 0;
  left: 0;
  background-color: #fff;
  @include scroll();

  .card-back {
    position: absolute;
    z-index: 20;
    top: 5px;
    right: 10px;
  }
}

*::-webkit-scrollbar-thumb {
  border-radius: 100px;
  background-color: rgb(7, 190, 81, 0.5);
}

::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px;
  /*高宽分别对应横竖滚动条的尺寸*/
  height: 8px;
}

//::-webkit-scrollbar-track {
//  /*滚动条里面轨道*/
//  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2);
//  background: #474747;
//}
//
//::-webkit-scrollbar-thumb {
//  /*滚动条里面小方块*/
//  border-radius: 2px;
//  background-color: rgb(7, 190, 81, 0.5);
//}
</style>
