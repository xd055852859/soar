<script setup lang="ts">
import cOutLoading from "@/components/common/cOutLoading.vue";
import { setLoading } from "@/services/util/common";
const dayjs: any = inject("dayjs");
const props = defineProps<{
  title?: string;
  url: string;
}>();
const loading = ref<boolean>(true);
const iframeUrl = ref<string>("");
watch(
  () => props.url,
  (newVal) => {
    if (newVal) {
      console.log(newVal);
      iframeUrl.value = `${newVal}&timestamp=${dayjs().valueOf()}`;
      const iframe: any = document.getElementById("iframe-container");
      if (iframe && iframe.contentWindow) {
        // iframe.contentWindow.location.reload(true);
        // window.open(iframeUrl.value, "myFrameName");
        iframe.src = "about:blank"; // 作为一个临时的链接，如果是其它正常可访问URL，会浪费一些不必要流量
        loading.value = true;
        const timer = setTimeout(() => {
          iframe.src = iframeUrl.value;
          console.log(iframeUrl.value);
          loading.value = false;
          clearTimeout(timer);
        }, 200);
      }
    }
  },
  { immediate: true },
);
</script>
<template>
  <div
    :style="{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    }"
  >
    <!-- <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading> -->
    <c-out-loading :visible="loading" />
    <!-- `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}` -->
    <iframe
      id="iframe-container"
      class="web-view"
      :title="title"
      :src="iframeUrl"
      frameBorder="0"
      width="100%"
      height="100%"
      @load="loading = false"
      allow="clipboard-read; clipboard-write;fullscreen"
    ></iframe>
    <!--       -->
  </div>
</template>
<style scoped lang="scss"></style>
<style></style>
