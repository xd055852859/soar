<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import Icon from "@/components/common/Icon.vue";
import { searchArray } from "@/services/config/config";
import { commonscroll } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";

const { exploreConfig } = storeToRefs(appStore.exploreStore);
const { setExploreConfig } = appStore.exploreStore;
const config = reactive({
  backType: 0,
  mask: 0,
  radius: 20,
  fontSize: 8,
  iconSize: 60,
  showDate: false,
  right: 30,
  bottom: 40,
  fontWeight: 10,
  fontPoint: true,
  fontOpacity: 70,
  backImg: "",
  backColor: "",
  search: { label: "百度", url: "https://www.baidu.com/s?ie=utf-8&word=" },
});
const backImgVisible = ref<boolean>(false);
const backImgList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const chooseImg = ref<number>(-1);
// const randomType = ref<number>(0);
const colorList = ref<string[]>([
  "rgb(24, 144, 255)",
  "rgb(46, 204, 113)",
  "rgb(51, 197, 197)",
  "rgb(155, 89, 182)",
  "rgb(241, 196, 15)",
  "rgb(230, 126, 34)",
  "rgb(231, 76, 60)",
]);
onMounted(() => {
  config.backType = exploreConfig.value.backType;
  config.backColor = exploreConfig.value.backColor;
  config.backImg = exploreConfig.value.backImg;
  config.fontSize = exploreConfig.value.fontSize;
  config.iconSize = exploreConfig.value.iconSize;
  config.showDate = exploreConfig.value.showDate;
  config.mask = exploreConfig.value.mask;
  config.radius = exploreConfig.value.radius;
  config.right = exploreConfig.value.right;
  config.bottom = exploreConfig.value.bottom;
  config.fontWeight = exploreConfig.value.fontWeight;
  config.fontOpacity = exploreConfig.value.fontOpacity;
  config.fontPoint = exploreConfig.value.fontPoint;
  config.search = exploreConfig.value.search;
});
const getImg = async () => {
  let imgRes = (await api.request.get(
    "",
    {
      page: page.value,
      limit: 50,
      style: "web",
    },
    true,
    api.AUTH_URL + `wallPaper`
  )) as ResultProps;
  if (imgRes.msg === "OK") {
    if (page.value === 1) {
      backImgList.value = [];
    }
    total.value = imgRes.total!;
    imgRes.data.forEach((item: any, index: number) => {
      backImgList.value.push(item.url);
      if (exploreConfig.value.backImg === item.url) {
        chooseImg.value = index;
      }
    });
  }
};
// const updateConfig = (key, value) => {
//   let newConfig = { ...exploreConfig.value };
//   newConfig[key] = value;
//   setExploreConfig(newConfig);
// };
watch(
  config,
  (newConfig) => {
    console.log(config);
    setExploreConfig({ ...newConfig });
  },
  { deep: true }
);
watchEffect(() => {
  getImg();
});
</script>
<template>
  <div class="explore-set">
    <q-list class="rounded-borders">
      <q-expansion-item
        group="set"
        expand-separator
        label="背景"
        default-opened
        header-class="text-bold text-subtitle1"
      >
        <q-list class="rounded-borders">
          <q-item>
            <q-item-section class="text-body2">背景风格</q-item-section>
            <q-item-section side>
              <div class="dp--center">
                <q-radio
                  dense
                  v-model="config.backType"
                  :val="0"
                  label="纯色"
                  class="q-mr-sm"
                />
                <q-radio
                  dense
                  v-model="config.backType"
                  :val="1"
                  label="壁纸"
                />
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="config.backType === 0">
            <q-item-section class="text-body2">颜色</q-item-section>
            <q-item-section side>
              <div class="dp--center">
                <span
                  class="color-item"
                  v-for="(item, index) in colorList"
                  :key="'color' + index"
                  :style="{
                    backgroundColor: item,
                    borderColor:
                      item === config.backColor ? item : 'transparent',
                  }"
                  @click="config.backColor = item"
                ></span>
                <div
                  class="color-item"
                  :style="{
                    backgroundColor: config.backColor,
                    borderColor: config.backColor,
                  }"
                >
                  <q-menu auto-close>
                    <q-color
                      v-model="config.backColor"
                      no-header
                      no-footer
                      default-view="palette"
                  /></q-menu>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <!-- <q-item v-if="config.backType === 1">
            <div
              class="bg"
              :style="{ backgroundImage: `url(${config.backImg})` }"
            >
               <div
                @click="
                  backImgVisible = true;
                  getImg();
                "
                class="bg-center"
              >
                选择壁纸
              </div>
            </div>
          </q-item> -->
          <q-item v-if="config.backType === 1">
            <q-item-section class="text-body2">遮罩</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.mask"
                :min="0"
                :max="100"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
          <div
            class="bg-container"
            v-if="config.backType === 1"
            @scroll="
              commonscroll($event, backImgList, total, () => {
                page++;
              })
            "
          >
            <div
              v-for="(item, index) in backImgList"
              :key="'backImg' + index"
              :style="{
                backgroundImage: `url(${item}?imageMogr2/auto-orient/thumbnail/250x)`,
                boxShadow: config.backImg === item ? '3px 3px 5px #333' : '',
              }"
              class="bg-img"
              @click="config.backImg = item"
            ></div>
            <!-- <div v-for="item"></div> -->
          </div>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        group="set"
        expand-separator
        label="时间"
        header-class="text-bold text-subtitle1"
      >
        <q-item>
          <q-item-section class="text-body2">数字闪烁</q-item-section>
          <q-item-section side>
            <q-toggle v-model="config.fontPoint" />
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item
        group="set"
        expand-separator
        label="文字"
        header-class="text-bold text-subtitle1"
      >
        <q-list class="rounded-borders">
          <q-item>
            <q-item-section class="text-body2">文字大小</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.fontSize"
                :min="8"
                :max="28"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        group="set"
        expand-separator
        label="图标"
        header-class="text-bold text-subtitle1"
      >
        <q-list class="rounded-borders">
          <q-item>
            <q-item-section class="text-body2">图标大小</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.iconSize"
                :min="30"
                :max="120"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-body2">图标圆角</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.radius"
                :min="0"
                :max="50"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-body2">列间距</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.bottom"
                :min="1"
                :max="30"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-body2">行间距</q-item-section>
            <q-item-section side>
              <q-slider
                v-model="config.right"
                :min="10"
                :max="50"
                style="width: 200px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        group="set"
        expand-separator
        label="搜索引擎"
        header-class="text-bold text-subtitle1"
      >
        <q-list class="rounded-borders">
          <q-item
            clickable
            v-for="(item, index) in searchArray"
            :key="`search${index}`"
            @click="config.search = item"
          >
            <q-item-section class="text-body2">{{ item.label }}</q-item-section>
            <q-item-section side v-if="config.search?.url === item.url">
              <Icon name="taskList" :size="25" color="#07be51" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-list>
  </div>
</template>
<style scoped lang="scss">
.explore-set {
  .bg {
    width: 100%;
    height: 200px;
    background-size: cover;
    // background-attachment: fixed;
    background-position: center 0;
    display: flex;
    justify-content: center;
    align-items: center;
    .bg-center {
      padding: 5px 10px;
      box-sizing: border-box;
      color: #fff;
      border-radius: 6px;
      background-color: rgba(0, 0, 0, 0.4);
      cursor: pointer;
      &:hover {
        background-color: rgba(0, 0, 0, 0.6);
      }
    }
  }
  .bg-container {
    width: 100%;
    height: calc(100vh - 360px);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: flex-start;
    padding: 0px 10px;
    box-sizing: border-box;
    @include scroll();
    .bg-img {
      width: 109px;
      height: 70px;
      background-size: cover;
      // background-attachment: fixed;
      background-position: center 0;
      margin-bottom: 5px;
    }
  }
  .color-item {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-clip: content-box;
    border: 1px solid transparent;
    box-sizing: content-box;
    padding: 2px;
    transition: 0.2s;
    box-shadow: 0 0 5px #00000026;
    display: inline-block;
    margin-right: 5px;
  }
}
</style>
<style></style>
