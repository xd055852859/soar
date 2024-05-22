<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { setMessage } from "@/services/util/common";
import Icon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";
const tagList = ref<any>([]);
const searchTagList = ref<any>([]);
const tagSelect = ref<string[]>([]);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const props = defineProps<{
  teamKey?: string;
}>();
const emits = defineEmits<{
  (e: "chooseTag", list: string[]): void;
}>();
const tagInput = ref<string>("");
onMounted(() => {
  getTag();
});
const getTag = async () => {
  let obj: any = {
    teamKey: spaceKey.value,
  };
  if (props.teamKey) {
    obj.projectKey = props.teamKey;
  }
  let tagRes = (await api.request.get("tag", { ...obj })) as ResultProps;
  if (tagRes.msg === "OK") {
    tagList.value = tagRes.data;
  }
};
const createTag = async () => {
  if (!tagInput.value) {
    setMessage("error", "请输入标签名");
    return;
  }
  let tagRes = (await api.request.post("tag", {
    teamKey: spaceKey.value,
    name: tagInput.value,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    setMessage("success", "创建标签成功");
    tagInput.value = "";
    tagList.value.unshift(tagRes.data);
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
</script>
<template>
  <div class="tag">
    <div class="tag-header">
      <q-input
        outlined
        v-model="tagInput"
        placeholder="请输入标签名称"
        dense
        class="q-mr-md"
        style="width: calc(100% - 50px)"
        clearable
      />
      <q-btn flat round @click="createTag">
        <Icon name="a-chuangjian2" :size="30" color="#757575" />
      </q-btn>
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
