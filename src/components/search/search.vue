<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { commonscroll } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";

const props = defineProps<{
  searchType?: string;
}>();
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey, teamList } = storeToRefs(appStore.teamStore);
const { chooseSearch } = appStore.commonStore;
const fileInput = ref<string>("");
const fileType = ref<string>("文件");
const searchList = ref<any>([]);
const fileArray = ["文件", "群组"];
const page = ref<number>(1);
const total = ref<number>(0);
//文件筛选
const searchFile = async () => {
  searchList.value = [];
  if (fileType.value === "群组") {
    searchList.value = teamList.value.filter(
      (item) => item.name.indexOf(fileInput.value) !== -1
    );
    console.log(searchList.value);
  } else {
    let dataRes = (await api.request.get("knowledgeBase/search", {
      teamKey: spaceKey.value,
      projectKey: teamKey.value,
      keyword: fileInput.value,
      page: page.value,
      limit: 30,
      // startTime: dayjs().subtract(90, "day").startOf("day").valueOf(),
      // endTime: dayjs().valueOf(),
    })) as ResultProps;
    if (dataRes.msg === "OK") {
      if (page.value === 1) {
        searchList.value = [];
      }
      searchList.value = [...searchList.value, ...dataRes.data];
      total.value = dataRes.total!;
    }
  }
};
watch(fileInput, (newInput) => {
  if (!newInput) {
    searchList.value = [];
  }
});
watch(fileType, (newType) => {
  if (newType === "文件") {
    page.value = 1;
  }
  searchFile();
});
watch(page, () => {
  searchFile();
});
</script>
<template>
  <div class="file-search">
    <div class="file-search-title">
      <q-select
        style="width: 150px; margin-right: 10px"
        outlined
        v-model="fileType"
        :options="fileArray"
        dense
        emit-value
        map-options
      />
      <q-input
        outlined
        v-model="fileInput"
        :placeholder="`搜索${fileType}`"
        dense
        class="full-width"
        @keyup.enter="searchFile"
        clearable
      />
    </div>
    <div
      class="file-search-container"
      @scroll="
        fileType === '文件'
          ? commonscroll($event, searchFile, total, () => {
              page++;
            })
          : null
      "
    >
      <template v-if="searchList.length > 0">
        <q-list>
          <q-item
            clickable
            v-for="(item, index) in searchList"
            :key="`search${index}`"
            class="q-my-sm file-search-item"
            @click="chooseSearch(fileType, item)"
          >
            <q-item-section>
              <q-item-label>{{
                fileType === "群组" ? item.name : item.title
              }}</q-item-label>
            </q-item-section>

            <q-item-section side v-if="fileType === '文件'">
              <div class="dp--center text-caption">
                <template
                  v-for="(pathItem, pathIndex) in item.way"
                  :key="`${item._key}path${index}`"
                >
                  <span>{{ pathItem.title }}</span>
                  <span v-if="pathIndex < item.way.length - 1"> / </span>
                </template>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
      <div class="dp-center-center" :style="{ height: '100%' }" v-else>
        未搜索到文件
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.file-search {
  width: 100%;
  .file-search-title {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    @include flex(space-between, center, null);
  }
  .file-search-container {
    width: 100%;
    height: 50vh;
    @include scroll();
    .file-search-item {
      .file-search-button {
        display: none;
      }
      &:hover {
        .file-search-button {
          display: flex;
        }
      }
    }
  }
}
</style>
<style></style>
