<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { setMessage } from "@/services/util/common";
import Icon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";

const { spaceKey } = storeToRefs(appStore.spaceStore);
const props = defineProps<{
  tagArr: any;
}>();
const emits = defineEmits<{
  (e: "chooseTag", list: string[]): void;
}>();
const tagList = ref<any>([]);
const searchTagList = ref<any>([]);
const tagSelect = ref<string[]>([]);
const tagInput = ref<string>("");
onMounted(() => {
  getTag();
});
const getTag = async () => {
  let tagRes = (await api.request.get("tag", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    tagList.value = tagRes.data;
  }
};

watchEffect(() => {
  if (tagInput.value) {
    searchTagList.value = tagList.value.filter((item) =>
      item.name.includes(tagInput.value),
    );
  } else {
    searchTagList.value = [...tagList.value];
  }
});
watch(tagSelect, (newList) => {
  emits("chooseTag", newList);
});
watch(
  () => props.tagArr,
  (newArr) => {
    console.log(newArr);
    if (newArr && newArr.length > 0) {
      tagSelect.value = newArr;
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="tag">
    <div class="tag-header">
      <q-input
        outlined
        v-model="tagInput"
        placeholder="请输入标签名称"
        dense
        class="full-width"
        style="width: calc(100% - 50px)"
        clearable
      />
    </div>
    <div class="tag-container">
      <template v-if="tagList.length > 0">
        <div
          v-for="(item, index) in tagList"
          :key="`tag${index}`"
          class="tag-item"
        >
          <q-checkbox v-model="tagSelect" :val="item._key" :label="item.name" />
        </div>
      </template>
      <c-empty title="暂无标签" v-else />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tag {
  width: 100%;
  height: 100%;
  .tag-header {
    width: 100%;
    height: 50px;
  }
  .tag-header {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    @include flex(flex-start, center, null);
  }
  .tag-container {
    width: 100%;
    height: calc(100% - 50px);
    @include scroll();
    .tag-item {
      width: 100%;
      height: 50px;
    }
  }
}
</style>
