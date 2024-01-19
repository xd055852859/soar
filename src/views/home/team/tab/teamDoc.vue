<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import _ from "lodash";
import { commonscroll, setMessage } from "@/services/util/common";
import appStore from "@/store";
import fileCard from "@/components/fileCard/fileCard.vue";
import { storeToRefs } from "pinia";

const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const props = defineProps<{
  type?: string;
}>();
const subType = ref<string>("");
const page = ref<number>(1);
const fileList = ref<any>([]);

const total = ref<number>(0);
const docArray = [
  {
    label: "全部类型",
    value: "",
  },
  {
    label: "文档",
    value: "text",
  },
  {
    label: "绘图",
    value: "draw",
  },
  {
    label: "脑图",
    value: "mind",
  },
  {
    label: "表格",
    value: "table",
  },
  {
    label: "演示",
    value: "ppt",
  },
  {
    label: "知识库",
    value: "knowledgeBase",
  },
];
const getDocList = async () => {
  let fileRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: props.type ? "" : teamKey.value,
    cardType: "doc",
    subType: subType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    if (page.value === 1) {
      fileList.value = [];
    }
    fileList.value = [...fileList.value, ...fileRes.data];
    total.value = fileRes.total as number;
  }
};
const addDoc = async (type, typeName) => {
  let fileRes = (await api.request.post("card", {
    projectKey: teamKey.value,
    type: "doc",
    subType: type,
    title: "新" + typeName,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    setMessage("success", `创建${typeName}成功`);
    fileList.value.unshift(fileRes.data);
  }
};

const chooseCard = (detail, type) => {
  switch (type) {
    case "search":
      break;
    case "update":
      let updateIndex = _.findIndex(fileList.value, { _key: detail._key });
      if (updateIndex !== -1) {
        fileList.value[updateIndex] = {
          ...fileList.value[updateIndex],
          ...detail,
        };
      }
      break;
    case "delete":
      let delIndex = _.findIndex(fileList.value, { _key: detail._key });
      if (delIndex !== -1) {
        fileList.value.splice(delIndex, 1);
      }
      break;
  }
};
watchEffect(() => {
  getDocList();
});
</script>
<template>
  <div class="teamDoc">
    <div class="teamDoc-header">
      <q-btn
        color="primary"
        label="创建"
        dense
        style="width: 120px"
        v-if="!type"
      >
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              v-for="(item, index) in docArray.slice(1, docArray.length)"
              :key="`fileType${index}`"
              clickable
              v-close-popup
              @click="addDoc(item.value, item.label)"
            >
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-space v-else />
      <q-select
        style="width: 150px"
        outlined
        v-model="subType"
        :options="docArray"
        dense
        emit-value
        map-options
      />
    </div>
    <div
      class="teamDoc-box"
      @scroll="
        commonscroll($event, fileList, total, () => {
          page++;
        })
      "
    >
      <template v-for="(item, index) in fileList" :key="`file${index}`">
        <fileCard :card="item" type="doc" @chooseCard="chooseCard" />
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.teamDoc {
  width: 100%;
  height: 100%;
  .teamDoc-header {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
  .teamDoc-box {
    width: 100%;
    height: calc(100% - 50px);
    @include scroll();
    @include p-number(10px, 10px);
  }
}
.teamDoc-detail {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 10;
  top: 0px;
  left: 0px;
  background-color: #fff;
}
</style>
<style></style>
