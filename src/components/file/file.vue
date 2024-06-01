<script setup lang="ts">
import { Icon } from "@iconify/vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
const { teamKey } = storeToRefs(appStore.teamStore);
const { token } = storeToRefs(appStore.authStore);
const { setIframeDetail } = appStore.commonStore;
const props = defineProps<{
  file: any;
  fileKey?: string;
  fileIndex?: number;
}>();
</script>
<template>
  <div
    class="resourceMenu-item"
    @click="
      setIframeDetail({
        url: `https://soar.cn/base/#/login?token=${token}&redirectPath=node/${file._key}`,
        title: file.title,
      });
      $router.push('/home/freedom');
    "
    :style="{
      background: fileKey === file._key ? '#eee' : '',
    }"
  >
    <div
      class="resourceMenu-item-title icon-point"
      @click="$router.push(`/home/team`)"
    >
      <div class="dp--center" style="width: 100%">
        <Icon
          :icon="file.icon"
          width="20"
          height="20"
          color="#757575"
          class="q-mr-sm"
        />
        <div style="width: calc(100% - 30px)">{{ file.title }}</div>
      </div>
    </div>

    <div class="resourceMenu-item-subtitle icon-point">
      <template
        v-for="(pathItem, pathIndex) in file.way"
        :key="`${file._key}path${pathIndex}`"
      >
        <div>{{ pathIndex === 0 ? "# " : "" }}{{ pathItem.title }}</div>
        <div v-if="pathIndex < file.way.length - 1" style="margin: 0 5px">
          /
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.resourceMenu-item {
  margin-bottom: 10px;
  .resourceMenu-item-title {
    width: 100%;
    min-height: 30px;
    font-size: 14px;
    border-radius: 4px;
    box-sizing: border-box;
    line-height: 30px;

    @include flex(space-between, center, wrap);
  }
  .resourceMenu-item-subtitle {
    width: 100%;
    min-height: 30px;
    font-size: 12px;
    color: $grey-6;
    @include flex(flex-start, center, wrap);
  }
  &:hover {
    background: #f5f5f5;
  }
}
</style>
