<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import createSpace from "@/components/createSpace.vue";
import router from "@/router";
const { spaceList, createState } = storeToRefs(appStore.spaceStore);
const { deviceType } = storeToRefs(appStore.commonStore);
const { getSpaceList, setSpaceKey } = appStore.spaceStore;
const overKey = ref<string>("");
onMounted(() => {
  getSpaceList();
});
const toSpace = (spaceKey) => {
  router.push("/home");
  setSpaceKey(spaceKey);
};
watch(spaceList, (newList) => {
  if (newList && newList.length > 0) {
    overKey.value = newList[0]._key;
  }
});
</script>
<template>
  <div
    class="space"
    :style="{
      backgroundImage: `url('/common/${
        deviceType === 'pc' ? 'commonBg' : 'commonPhoneBg'
      }.png')`,
    }"
  >
    <div class="space-logo">
      <img src="/common/titleLogo.svg" alt="" />
    </div>
    <div class="space-box" v-if="spaceList">
      <div class="space-container" v-if="spaceList.length > 0">
        <div class="space-container-title">你可以进入以下企业空间</div>
        <div class="space-container-subtitle">
          管理任务、文档团队协同，成为您的在线工作室
        </div>
        <div class="space-list">
          <div
            v-for="(item, index) in spaceList"
            :key="`space${index}`"
            class="space-item"
            @click="toSpace(item._key)"
            @mouseenter="overKey = item._key"
            :style="overKey === item._key ? { background: '#e9f9ef' } : null"
          >
            <div class="space-item-left">
              <!-- <img :src="item.logo ? item.logo : '/common/defaultGroup.png'" /> -->
              <q-avatar
                :color="item?.logo ? '#fff' : 'primary'"
                rounded
                size="lg"
              >
                <img v-if="item?.logo" :src="item.logo" />
                <template v-else-if="item?.name"
                  ><div class="text-white">
                    {{ item.name.substring(0, 1) }}
                  </div></template
                >
                <img v-else src="/common/defaultGroup.png" />
              </q-avatar>
            </div>

            <div class="space-item-right">
              <div class="space-title">
                <div class="top">{{ item.name }}</div>
                <div class="bottom">
                  <div>
                    {{ ROLE_OPTIONS[item.role]?.label }}
                  </div>
                </div>
              </div>
              <q-icon name="keyboard_arrow_right" size="28px" color="grey-6" />
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="space-container"><createSpace /></div>
      </div>
      <!-- -->
    </div>
  </div>
</template>
<style lang="scss">
.space {
  width: 100vw;
  height: 100vh;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  @include flex(center, center, null);
  .space-logo {
    width: 18%;
    height: 9%;
    position: fixed;
    z-index: 10;
    left: 4%;
    top: 5%;
    @include flex(center, center, null);
    img {
      width: 100%;
    }
  }
  .space-box {
    width: 520px;
    min-height: 300px;
    background: #ffffff;
    border-radius: 25px;
    box-shadow: 0px 2px 9px 0px rgba(178, 178, 178, 0.5);
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    .space-container {
      width: 100%;
      @include p-number(45px, 45px);
      @include scroll();
      .space-container-title {
        width: 100%;
        height: 30px;
        font-size: 16px;
        font-family: PingFang SC, PingFang SC-Semibold;
        font-weight: bold;
        text-align: left;
        color: #161616;
        line-height: 28px;
        margin-bottom: 2px;
      }
      .space-container-subtitle {
        width: 100%;
        height: 30px;
        opacity: 0.8;
        font-size: 14px;
        color: #161616;
        line-height: 22px;
        margin-bottom: 42px;
      }
      .space-list {
        .space-item {
          width: 100%;
          height: 80px;
          border-radius: 10px;
          margin-bottom: 15px;
          cursor: pointer;
          @include p-number(14px, 14px);
          @include flex(flex-start, center, null);
          .space-item-left {
            width: 52px;
            height: 52px;
            margin-right: 20px;
            border-radius: 5px;
            overflow: hidden;
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
          .space-item-right {
            width: calc(100% - 72px);
            height: 100%;
            @include flex(space-between, center, null);
            .space-title {
              width: calc(100% - 40px);
              height: 100%;
              .top {
                width: 100%;
                height: 28px;
                font-size: 16px;
                font-weight: bold;
                text-align: left;
                color: #161616;
                line-height: 28px;
              }
              .bottom {
                width: 100%;
                height: 22px;
                opacity: 0.8;
                font-size: 14px;
                text-align: left;
                color: #161616;
                line-height: 22px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style></style>
