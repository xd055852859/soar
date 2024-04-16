<script setup lang="ts">
import MateSetting from "@/views/home/right/mate/setting.vue";
import Icon from "@/components/common/Icon.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
const { mateList } = storeToRefs(appStore.mateStore);
const mateKey = ref<string>("");
</script>
<template>
  <div class="mateMenu">
    <!-- <OnClickOutside @trigger="searchVibisible = false"> -->
    <div class="leftMenu-title">
      <div class="leftMenu-title-left"></div>
      <div class="leftMenu-title-right">
        <q-btn flat round>
          <Icon name="a-chuangjian2" :size="20" />
          <q-menu anchor="top end" class="q-pa-none" style="height: 400px;">
            <MateSetting type="inside" />
          </q-menu>
        </q-btn>
      </div>
    </div>
    <div class="mateMenu-list">
      <div
        class="mateMenu-item"
        v-for="(item, index) in mateList"
        :key="`mate${index}`"
        @click="
          $router.push(`/home/mate/detail/${item._key}`);
          mateKey = item._key;
        "
      >
        <div
          class="mateMenu-item-title icon-point"
          @click=""
          :style="{
            background: mateKey === item._key ? '#eee' : '',
          }"
        >
          <div class="mateMenu-item-avatar q-mr-sm">
            <img
              :src="
                item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
              "
            />
          </div>
          <div>{{ item.userName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mateMenu {
  width: 100%;
  height: 100%;
  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 0px;
  }
}
.mateMenu-list {
  width: 100%;
  height: calc(100% - 50px);
  @include scroll();
  .mateMenu-item {
    .mateMenu-item-title {
      width: 100%;
      height: 50px;
      font-size: 14px;
      border-radius: 4px;
      box-sizing: border-box;
      line-height: 50px;
      @include flex(flex-start, center, null);
    }
    .mateMenu-item-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    &:hover {
      background: #f5f5f5;
    }
  }
}
</style>
<style></style>
