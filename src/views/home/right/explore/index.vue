<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cIframe from "@/components/common/cIframe.vue";
import cDialog from "@/components/common/cDialog.vue";
import cDrawer from "@/components/common/cDrawer.vue";
import Icon from "@/components/common/Icon.vue";
import TimeClock from "./clock/timeClock.vue";
import ExploreSet from "./exploreSet/exploreSet.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import api from "@/services/api";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import { useQuasar } from "quasar";

import { setMessage } from "@/services/util/common";
import router from "@/router";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { exploreConfig } = storeToRefs(appStore.exploreStore);
const { spaceKey, lockList } = storeToRefs(appStore.spaceStore);
const { setLockList } = appStore.spaceStore;
const { clickExplore } = appStore.exploreStore;

const searchTitle = ref<string>("");
const smallList = ref<any>([]);
const bigList = ref<any>([]);
const urlList = ref<any>([]);
const iframeVisible = ref<boolean>(false);
const iframeUrl = ref<string>("");
const iframeTitle = ref<string>("");
const url = ref<string>("");
const urlIcon = ref<string>("");
const urlName = ref<string>("");
const urlKey = ref<string>("");
const urlVisible = ref<boolean>(false);
const urlType = ref<string>("https://");
const urlTypeArr = ["https://", "http://"];
const setVisible = ref<boolean>(false);
const bigListText = computed(() => bigList.value.map((item) => item.enName));
const chooseSearch = (e) => {
  window.open(exploreConfig.value.search.url + searchTitle.value);
};
const getApplicationList = async () => {
  let applicationRes = (await api.request.get("app/user", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (applicationRes.msg === "OK") {
    bigList.value = [];
    smallList.value = [];
    applicationRes.data.list1.forEach((item) => {
      if (!item.config) {
        item.config = {};
      }
      if (item.config?.size === "big") {
        item.config.size === "big";
        bigList.value.push(item);
      } else {
        item.config?.size === "small";
        smallList.value.push(item);
      }
    });
    urlList.value = applicationRes.data.list2;
  }
};
const getBigList = async (list) => {
  let bigRes = (await api.request.post("app/trends", {
    teamKey: spaceKey.value,
    appArr: list,
  })) as ResultProps;
  if (bigRes.msg === "OK") {
    let bigArray = bigRes.data;
    bigListText.value.forEach((item, index) => {
      let bigItem = bigList.value[index];
      switch (item) {
        case "clockIn":
          bigItem.titleArr = [];
          let clockIn = bigArray[index][0];
          if (clockIn.startWorkTime) {
            bigItem.titleArr.push(
              `${dayjs(clockIn.startWorkTime).format("HH:mm")} 上班打卡`
            );
          } else if (clockIn.noonBreakTime) {
            bigItem.titleArr.push(
              `${dayjs(clockIn.noonBreakTime).format("HH:mm")} 午休打卡`
            );
          } else if (clockIn.noonEndTime) {
            bigItem.titleArr.push(
              `${dayjs(clockIn.noonEndTime).format("HH:mm")} 下午打卡`
            );
          } else if (clockIn.endWorkTime) {
            bigItem.titleArr.push(
              `${dayjs(clockIn.endWorkTime).format("HH:mm")} 下班打卡`
            );
          }
          break;
        case "report":
          bigItem.titleArr = [];
          bigRes.data[index].forEach((reportItem) => {
            // year week momth total
            bigItem.titleArr.push(
              `${dayjs(reportItem.createTime).format("MM-DD HH:mm")} ${
                reportItem.submitter.userName
              } 提交${
                reportItem.reportType === "day"
                  ? "日"
                  : reportItem.reportType === "week"
                  ? "周"
                  : reportItem.reportType === "month"
                  ? "月"
                  : reportItem.reportType === "year"
                  ? "年"
                  : "十年"
              }汇报`
            );
          });
          break;
      }
    });
  }
};
const changeSize = async (type, index, key) => {
  let applicationRes = (await api.request.patch("app/user/config", {
    teamKey: spaceKey.value,
    appKey: key,
    config: { size: type },
  })) as ResultProps;
  if (applicationRes.msg === "OK") {
    if (type === "small") {
      bigList.value[index].config.size = "small";
      smallList.value.push({ ...bigList.value[index] });
      bigList.value.splice(index, 1);
    } else {
      smallList.value[index].config.size = "big";
      bigList.value.push({ ...smallList.value[index] });
      smallList.value.splice(index, 1);
    }
  }
};
const lockApplication = async (type, index, item) => {
  let locked = !item.locked;
  let applicationRes = (await api.request.patch("app/lock", {
    teamKey: spaceKey.value,
    appKey: item._key,
    locked: locked,
  })) as ResultProps;
  if (applicationRes.msg === "OK") {
    item.locked = locked;
    if (type === "small") {
      smallList.value[index].locked = locked;
    } else {
      bigList.value[index].locked = locked;
    }
    let newLockList = [...lockList.value];
    if (locked) {
      newLockList.push(item);
    } else {
      let index = _.findIndex(newLockList, { _key: item._key });
      if (index !== -1) {
        newLockList.splice(index, 1);
      }
    }
    setLockList(newLockList);
  }
};
const chooseUrl = (item) => {
  if (item) {
    urlVisible.value = true;
    urlKey.value = item._key;
    url.value = item.url.replace("https://", "").replace("http://", "");
    urlName.value = item.name;
    urlIcon.value = item.icon;
  } else {
    urlKey.value = "";
    url.value = "";
    urlName.value = "";
    urlIcon.value = "";
  }
};
const addUrl = async () => {
  if (!url.value) {
    setMessage("error", "请输入网址");
    return;
  }
  if (urlKey.value) {
    let urlRes = (await api.request.patch("app/custom", {
      appKey: urlKey.value,
      name: urlName.value,
      url: urlType.value + url.value,
      icon: urlIcon.value,
    })) as ResultProps;
    if (urlRes.msg === "OK") {
      setMessage("success", "编辑第三方网站成功");
      let index = _.findIndex(urlList.value, { _key: urlKey.value });
      if (index !== -1) {
        urlList.value[index] = {
          ...urlList.value[index],
          name: urlName.value,
          url: urlType.value + url.value,
          icon: urlIcon.value,
        };
      }
      urlVisible.value = false;
    }
  } else {
    let urlIconRes = (await api.request.get(
      "",
      {
        url: urlType.value + url.value,
      },
      true,
      "https://nodeserver.qingtime.cn/linkInfo"
    )) as ResultProps;
    if (urlIconRes.msg === "OK") {
      let urlRes = (await api.request.post("app/custom", {
        teamKey: spaceKey.value,
        name: urlName.value
          ? urlName.value
          : urlIconRes.data.title === "302 Found"
          ? "未命名"
          : urlIconRes.data.title,
        url: urlType.value + url.value,
        icon: urlIconRes.data.icon,
      })) as ResultProps;
      if (urlRes.msg === "OK") {
        setMessage("success", "保存第三方网站成功");
        urlList.value.push(urlRes.data);
        urlVisible.value = false;
      }
    }
  }
};
const deleteUrl = async (item, index) => {
  $q.dialog({
    title: "删除链接",
    message: "是否删除链接",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("app/custom", {
        appKey: item._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", "删除成功");
        urlList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const saveConfig = async () => {
  api.request.patch("app/team/config", {
    teamKey: spaceKey.value,
    config: exploreConfig.value,
  });
};
watchEffect(() => {
  if (spaceKey.value) {
    getApplicationList();
  }
});
watch(urlVisible, (newVisible) => {
  if (!newVisible) {
    chooseUrl(null);
  }
});
watch(bigListText, (newList) => {
  if (spaceKey.value && newList.length > 0) {
    getBigList(newList);
  }
});
</script>
<template>
  <div
    class="explore-bg"
    :style="
      exploreConfig.backType === 1
        ? {
            backgroundImage: `url(${exploreConfig.backImg})`,
          }
        : { backgroundColor: exploreConfig.backColor }
    "
  >
    <div
      class="explore-gray"
      :style="{
        background: `rgba(0,0,0,${exploreConfig.mask / 100})`,
      }"
      v-if="exploreConfig.backType === 1"
    ></div>
    <div class="explore">
      <c-header title="应用">
        <template #button>
          <Icon
            name="a-shezhi2"
            :size="18"
            class="q-mr-sm"
            color="#bdbdbd"
            @click="setVisible = true"
          />
        </template>
      </c-header>
      <div class="explore-box">
        <TimeClock />
        <div class="explore-search">
          <q-input
            outlined
            rounded
            v-model="searchTitle"
            placeholder="输入与搜索"
            @keyup.enter="chooseSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="explore-container">
          <div class="explore-container-left" v-if="bigList.length > 0">
            <div
              class="explore-left-item q-mb-sm"
              v-for="(item, index) in bigList"
              :key="`big${index}`"
              @click="clickExplore(item.enName)"
            >
              <div class="text-bold">{{ item.name }}</div>
              <div
                v-for="(titleItem, titleIndex) in item.titleArr"
                :key="`big${index}-${titleIndex}`"
              >
                {{ titleItem }}
              </div>
              <Icon
                class="explore-item-lock"
                name="pin"
                :size="14"
                v-if="item.locked"
              />
              <q-menu context-menu>
                <q-list dense>
                  <q-item
                    clickable
                    v-close-popup
                    @click="changeSize('small', index, item._key)"
                  >
                    <q-item-section>1 * 1</q-item-section></q-item
                  >
                  <q-item
                    clickable
                    v-close-popup
                    @click="lockApplication('big', index, item)"
                    ><q-item-section
                      >{{
                        !item.locked ? "固定" : "取消"
                      }}到侧边栏</q-item-section
                    ></q-item
                  >
                </q-list>
              </q-menu>
            </div>
          </div>
          <div class="explore-container-right">
            <div class="explore-container-top">
              <div
                class="explore-item"
                v-for="(item, index) in smallList"
                :key="`small${index}`"
                @click="clickExplore(item.enName)"
                :style="{
                  width: exploreConfig.iconSize + 'px',
                  height: exploreConfig.iconSize + 30 + 'px',
                  marginRight: exploreConfig.right + 'px',
                  marginBottom: exploreConfig.bottom + 'px',
                  fontSize: exploreConfig.fontSize + 'px',
                }"
              >
                <div
                  class="explore-item-top"
                  :style="{
                    backgroundColor: item.color,
                    width: exploreConfig.iconSize + 'px',
                    height: exploreConfig.iconSize + 'px',
                    borderRadius: exploreConfig.radius + '%',
                  }"
                >
                  <Icon
                    :name="item.icon"
                    :size="exploreConfig.iconSize - 25"
                    color="#fff"
                  />
                  <Icon
                    class="explore-item-lock"
                    name="pin"
                    :size="14"
                    v-if="item.locked"
                  />
                </div>
                <div class="explore-item-bottom single-to-long">
                  {{ item.name }}
                </div>
                <q-menu context-menu>
                  <q-list dense>
                    <q-item
                      clickable
                      v-close-popup
                      @click="changeSize('big', index, item._key)"
                      v-if="
                        item.enName === 'clockIn' || item.enName === 'report'
                      "
                      ><q-item-section>2 * 4</q-item-section></q-item
                    >
                    <q-item
                      clickable
                      v-close-popup
                      @click="lockApplication('small', index, item)"
                      ><q-item-section
                        >{{
                          !item.locked ? "固定" : "取消"
                        }}到侧边栏</q-item-section
                      ></q-item
                    >
                  </q-list>
                </q-menu>
              </div>
            </div>
            <q-separator />
            <div class="explore-container-bottom">
              <div
                class="explore-item"
                v-for="(item, index) in urlList"
                :key="`url${index}`"
                @click="clickExplore('url', item.url)"
                :style="{
                  width: exploreConfig.iconSize + 'px',
                  height: exploreConfig.iconSize + 30 + 'px',
                  marginRight: exploreConfig.right + 'px',
                  marginBottom: exploreConfig.bottom + 'px',
                  fontSize: exploreConfig.fontSize + 'px',
                }"
              >
                <div
                  class="explore-item-top"
                  :style="{
                    backgroundColor: item.color,
                    width: exploreConfig.iconSize + 'px',
                    height: exploreConfig.iconSize + 'px',
                    borderRadius: exploreConfig.radius + '%',
                  }"
                >
                  <img :src="item.icon" alt="" />
                </div>
                <div class="explore-item-bottom single-to-long">
                  {{ item.name }}
                </div>
                <q-menu context-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="chooseUrl(item)">
                      <q-item-section clickable v-close-popup
                        >编辑</q-item-section
                      >
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="deleteUrl(item, index)"
                    >
                      <q-item-section clickable v-close-popup
                        >删除</q-item-section
                      >
                    </q-item>
                  </q-list>
                </q-menu>
              </div>
            </div>
          </div>
        </div>
        <q-menu context-menu>
          <q-list dense>
            <q-item clickable v-close-popup @click="urlVisible = true">
              <q-item-section clickable v-close-popup
                >设置第三方</q-item-section
              >
            </q-item>
            <q-item clickable v-close-popup @click="setVisible = true">
              <q-item-section clickable v-close-popup>设置</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <Teleport to="body">
        <div class="explore-dialog" v-if="iframeVisible" style="z-index: 20">
          <q-btn
            round
            color="primary"
            size="16px"
            class="explore-back"
            @click="
              iframeVisible = false;
              iframeUrl = '';
            "
          >
            <Icon name="a-fanhuikongjian21" :size="20" />
          </q-btn>
          <c-iframe :url="iframeUrl" :title="iframeTitle" />
        </div>
      </Teleport>
      <c-dialog
        :visible="urlVisible"
        @close="urlVisible = false"
        :title="urlKey ? '编辑网址' : '添加网址'"
        :dialogStyle="{ width: '350px' }"
      >
        <template #content>
          <q-input
            dense
            outlined
            v-model="url"
            placeholder="网址"
            class="q-mb-md full-width"
          >
            <template v-slot:prepend>
              <q-select
                v-model="urlType"
                :options="urlTypeArr"
                dense
                class="explore-url-search"
              />
            </template>
          </q-input>
          <q-input
            class="full-width"
            dense
            outlined
            v-model="urlName"
            placeholder="标题"
          />
        </template>
        <template #footer>
          <q-btn
            flat
            label="取消"
            color="grey-5"
            @click="urlVisible = false"
            :dense="true"
          />
          <q-btn label="保存" color="primary" @click="addUrl()" />
        </template>
      </c-dialog>
      <c-drawer
        :visible="setVisible"
        @close="
          setVisible = false;
          saveConfig();
        "
        :drawerStyle="{ width: '400px' }"
        opacityMask
      >
        <template #content>
          <ExploreSet />
        </template>
      </c-drawer>
    </div>
  </div>
</template>
<style scoped lang="scss">
.explore-bg {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  background-size: cover;
  background-attachment: fixed;
  background-position: center 0;
  .explore-gray {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    z-index: 2;
  }
  .explore {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
    .explore-box {
      width: 100%;
      height: calc(100% - 70px);
      box-sizing: border-box;
      @include scroll();
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      // @include p-number(10px, 25px);
      .explore-search {
        width: 60%;
        margin: 10px 0px;
      }
      .explore-container {
        width: 80%;
        min-width: 700px;
        height: calc(100% - 200px);
        margin: 10px 0px;
        @include flex(space-between, center, center);
        .explore-container-left {
          width: 350px;
          height: 100%;
          margin-right: 10px;
          .explore-left-item {
            width: 350px;
            height: 140px;
            border-radius: 12px;
            background-color: #fff;
            position: relative;
            z-index: 1;
            cursor: pointer;
            @include p-number(10px, 10px);
            @include scroll();
            > div {
              width: 100%;
              height: 30px;
              line-height: 30px;
            }
            &:hover {
              .explore-item-lock {
                @include flex(center, center, null);
              }
            }
          }
        }
        .explore-container-right {
          flex: 1;
          height: 100%;
          @include scroll();
          .explore-container-top {
            width: 100%;

            @include flex(flex-start, center, wrap);
          }
          .explore-container-bottom {
            width: 100%;
            margin-top: 10px;
            @include flex(flex-start, center, wrap);
          }
          .explore-item {
            cursor: pointer;
            .explore-item-top {
              width: 100%;
              height: 70px;
              background-color: #fff;
              position: relative;
              z-index: 1;
              @include flex(center, center, null);
              img {
                width: 60%;
              }
              &:hover {
                .explore-item-lock {
                  @include flex(center, center, null);
                }
              }
            }
            .explore-item-bottom {
              width: 100%;
              height: 30px;
              line-height: 30px;
              text-align: center;
            }
          }
        }
        .explore-item-lock {
          width: 20px;
          height: 20px;
          position: absolute;
          z-index: 2;
          top: 5px;
          right: 5px;
          display: none;
        }
      }
    }
  }
}
.explore-dialog {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0px;
  background-color: #fff;
  @include scroll();
  .explore-back {
    position: absolute;
    z-index: 20;
    top: 5px;
    left: 10px;
  }
}
</style>
<style lang="scss">
.explore-url-search {
  .q-field__control:before {
    border: 0px;
  }
}
</style>
