<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import cIframe from "@/components/common/cIframe.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const exploreUrl = ref<string>("");
const exploreTitle = ref<string>("");
const exploreState = ref<boolean>(false);
onMounted(() => {
  window.addEventListener("message", handle, false);
});
onUnmounted(() => {
  window.removeEventListener("message", handle, false);
});
const openExplore = (type) => {
  switch (type) {
    case "report":
      exploreTitle.value = "汇报";
      exploreUrl.value = `https://hb.qingtime.cn/?token=${token.value}&teamKey=${spaceKey.value}`;
      break;
  }
  exploreState.value = true;
};
function handle(e: any) {
  //文档,文件
}
</script>
<template>
  <div class="explore">
    <cHeader
      :title="exploreState ? exploreTitle : '探索'"
      :isBackOther="exploreState"
      @backOther="exploreState = false"
    />
    <div
      class="explore-box row"
      :style="exploreState ? {} : { padding: '10px 25px' }"
    >
      <template v-if="exploreState">
        <cIframe :url="exploreUrl" :title="exploreTitle" v-if="exploreUrl" />
      </template>
      <template v-else>
        <!-- <q-card
          flat
          bordered
          class="explore-box-item col-xs-24 col-sm-12 col-md-8 col-lg-4"
          @click="openExplore('report')"
        >
          <q-card-section horizontal>
            <q-img class="col-3" :src="'/common/defaultGroup.png'" />
            <q-card-section class="col-10">
              <div class="explore-content">
                <div class="explore-content-top">汇报</div>
                <div class="explore-content-bottom">轻松填写各类日报周报</div>
              </div>
            </q-card-section>
            <q-card-section class="col-3">
              <q-btn label="添加" @click="" />
            </q-card-section>
          </q-card-section> 
        </q-card>-->
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.explore {
  width: 100%;
  height: 100%;
  .explore-box {
    width: 100%;
    height: calc(100% - 70px);
    box-sizing: border-box;
    @include scroll();
    // @include p-number(10px, 25px);
    .explore-box-item {
      height: 100px;
    }
    .explore-content {
      width: 100%;
      height: 65px;
      .explore-content-top {
        width: 100%;
        height: calc(100% - 30px);
        font-size: 16px;
        @include flex(null, flex-start, null);
      }
      .explore-content-bottom {
        width: 100%;
        height: 30px;
        font-size: 14px;
        color: #9e9e9e;
      }
    }
  }
}
</style>
<style></style>
