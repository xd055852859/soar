<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { setMessage } from "@/services/util/common";
import Icon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";
import _ from "lodash";

const { spaceKey, tagList } = storeToRefs(appStore.spaceStore);
const { teamList } = storeToRefs(appStore.teamStore);
const { setTag } = appStore.spaceStore;
const { getTeamList } = appStore.teamStore;
const searchTagList = ref<any>([]);
const teamSelect = ref<string[]>([]);
const originSelect = ref<string[]>([]);
const tagKey = ref<string>("");
const tagInput = ref<string>("");
const menuVisible = ref<boolean>(false);
const inputRef = ref<any>(null);
const tagInfo = computed(() => {
  if (tagList.value.length > 0) {
    return tagList.value[_.findIndex(tagList, { _key: tagKey.value })];
  }
});
onMounted(() => {
  // if (tagList.value.length > 0) {
  //   tagKey.value = tagList.value[0]._key;
  //   tagInput.value = tagList.value[0].name;
  // }
  searchTagList.value = [...tagList.value];
});

const createTag = async () => {
  let tagRes = (await api.request.post("tag", {
    teamKey: spaceKey.value,
    name: tagInput.value,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    setMessage("success", "创建标签成功");
    tagInput.value = "";
    // tagInput.value = tagRes.data.name;
    // tagKey.value = tagRes.data._key;
    let list = [...tagList.value];
    list.unshift(tagRes.data);
    setTag(list);
    menuVisible.value = false;
  }
};
const saveTag = async (arr, key, type?: string) => {
  let tagRes = (await api.request.patch("project/tag/batch", {
    projectKeyArr: arr,
    tagKeyArr: [key],
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    if (type) {
      setMessage("success", "设置标签成功");
    }

    getTeamList(spaceKey.value);
  }
};
watch(tagInput, (newInput) => {
  if (newInput) {
    searchTagList.value = tagList.value.filter((item) =>
      item.name.includes(newInput),
    );
  } else {
    searchTagList.value = [...tagList.value];
    menuVisible.value = true;
  }
});
watch(
  tagKey,
  (newKey, oldKey) => {
    if (oldKey) {
      if (
        originSelect.value !== teamSelect.value &&
        teamSelect.value.length > 0
      ) {
        //保存
        saveTag(teamSelect.value, oldKey);
      }
    }
    if (newKey) {
      let list: any = [];
      teamList.value.forEach((item) => {
        if (item.tagArr.indexOf(newKey) !== -1) {
          list.push(item._key);
        }
      });
      originSelect.value = [...list];
      teamSelect.value = [...list];
    } else {
      originSelect.value = [];
      teamSelect.value = [];
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
        style="width: calc(100% - 100px)"
        clearable
        ref="inputRef"
        @focus="menuVisible = true"
      />
      <q-btn
        label="确认"
        :color="tagKey ? 'primary' : 'grey-5'"
        style="width: 90px"
        :disable="!tagKey"
        @click="saveTag(teamSelect, tagKey, 'message')"
      />
      <q-menu
        no-focus
        class="q-pa-sm"
        style="width: 470px; max-height: 60vh"
        v-model="menuVisible"
        auto-close
        no-parent-event
      >
        <q-list dense>
          <template v-if="searchTagList.length > 0">
            <q-item
              clickable
              v-for="(item, index) in searchTagList"
              :key="`tag${index}`"
              v-close-popup
              @click="
                tagKey = item._key;
                tagInput = item.name;
                menuVisible = false;
                // inputRef.blur();
              "
            >
              <q-item-section>{{ item.name }}</q-item-section>
            </q-item>
          </template>
          <div v-else style="width: 100%; height: 150px">
            <c-empty title="暂无标签" />
          </div>

          <template v-if="tagInput">
            <q-separator />
            <q-item class="q-mt-sm" clickable v-close-popup @click="createTag">
              <q-item-section class="text-grey-7"
                >添加 新标签:{{ tagInput }}</q-item-section
              >
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </div>
    <div class="tag-container">
      <template v-if="teamList.length > 0">
        <div
          v-for="(item, index) in teamList"
          :key="`team${index}`"
          class="tag-item"
        >
          <q-checkbox
            v-model="teamSelect"
            :val="item._key"
            :label="item.name"
          />
        </div>
      </template>
      <c-empty title="暂无群组" v-else />
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
    @include flex(space-between, center, null);
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
