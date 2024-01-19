<script setup lang="ts">
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import createSpace from "@/components/createSpace.vue";
import router from "@/router";
const { spaceList, createState } = storeToRefs(appStore.spaceStore);
const { getSpaceList, setSpaceKey } = appStore.spaceStore;
onMounted(() => {
  getSpaceList();
});
const toSpace = (spaceKey) => {
  router.push("/home");
  setSpaceKey(spaceKey);
};
</script>
<template>
  <div class="space">
    <div class="space-box">
      <div class="space-logo">
        <img src="/common/titleLogo.svg" alt="" />
      </div>
      <div class="space-container" v-if="spaceList.length > 0">
        <div class="q-mb-sm">你可以进入以下企业空间</div>
        <div></div>
        <q-card
          flat
          bordered
          v-for="(item, index) in spaceList"
          :key="`space${index}`"
          class="space-item"
          @click="toSpace(item._key)"
        >
          <q-card-section horizontal>
            <q-img
              class="col-2"
              :src="item.logo ? item.logo : '/common/defaultGroup.png'"
            />
            <q-card-section class="col-10">
              <div class="space-content">
                <div class="space-title">
                  <div class="top">{{ item.name }}</div>
                  <div class="bottom">
                    <div>
                      {{
                        item.role === 0
                          ? "超管"
                          : ROLE_OPTIONS[item.role - 1]?.label
                      }}
                    </div>
                  </div>
                </div>
                <q-icon name="keyboard_arrow_right" size="28px" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
      <div v-else>
        <div class="space-container"><createSpace /></div>
      </div>
      <!-- -->
    </div>
  </div>
</template>
<style scoped lang="scss">
.space {
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  @include flex(center, center, null);
  .space-box {
    width: 450px;
    height: 580px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.11);
    padding-top: 44px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    .space-logo {
      width: 100%;
      height: 60px;
      margin-bottom: 25px;
      @include flex(center, center, null);
      img {
        width: 40%;
      }
    }
    .space-container {
      width: 100%;
      padding: 0px 34px;
      box-sizing: border-box;
      @include scroll();
      .space-item {
        margin-bottom: 15px;
        .space-content {
          width: 100%;
          height: 100%;
          @include flex(space-between, center, wrap);
          .space-title {
            width: calc(100% - 160px);
            height: 100%;
            .top {
              width: 100%;
              height: calc(100% - 30px);
              font-size: 16px;
              @include flex(null, flex-start, null);
            }
            .bottom {
              width: 100%;
              height: 30px;
              font-size: 14px;
              color: #9e9e9e;
              padding-right: 10px;
              box-sizing: border-box;
              @include flex(space-between, center, null);
              .right {
                min-width: 200px;
                height: 100%;
                @include flex(flex-end, center, null);
                .view {
                  height: 100%;
                  @include flex(center, center, null);
                }
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
