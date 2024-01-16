<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import _ from "lodash";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { useQuasar } from "quasar";
import { storeToRefs } from "pinia";
import cIframe from "@/components/common/cIframe.vue";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const subType = ref<string>("");
const page = ref<number>(1);
const fileList = ref<any>([]);
const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
const total = ref<number>(0);
const fileArray = [
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
const getFileList = async () => {
  let fileRes = (await api.request.get("card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    cardType: "doc",
    subType: subType.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (fileRes.msg === "OK") {
    fileList.value = [...fileRes.data];
    total.value = fileRes.total as number;
  }
};
const addFile = async (type, typeName) => {
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
const deleteFile = async (key, index) => {
  $q.dialog({
    title: "删除文档",
    message: "是否删除该文档",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("card", {
        cardKey: key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", "删除文档成功");
        fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const scrollFile = (e) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (
    height + scrollTop >= scrollHeight &&
    fileList.value.length < total.value
  ) {
    page.value++;
  }
};
const chooseFile = (type, detail) => {
  fileDetail.value = detail;
  const getApi = api.API_URL + "card/detail";
  const getParams = `{"cardKey": "${detail._key}" }`;
  const patchApi = api.API_URL + "card";
  const patchData = `["content", "title"]`;
  const uptokenApi = api.API_URL + "account/qiniuToken";
  const uptokenParams = `{"target": "cdn-soar"}`;
  switch (type) {
    case "text":
      detailUrl.value = `https://notecute.com/#/editor?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "draw":
      detailUrl.value = `https://draw.workfly.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":${patchData}}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "mind":
      detailUrl.value = `https://mind.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "ppt":
      detailUrl.value = `https://ppt.mindcute.com/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "table":
      detailUrl.value = `https://sheets.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
  }
  detailVisible.value = true;
};
watchEffect(() => {
  getFileList();
});
</script>
<template>
  <div class="teamFile">
    <div class="teamFile-header">
      <q-btn color="primary" label="创建" dense style="width: 120px">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              v-for="(item, index) in fileArray.slice(1, fileArray.length)"
              :key="`fileType${index}`"
              clickable
              v-close-popup
              @click="addFile(item.value, item.label)"
            >
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-select
        style="width: 150px"
        outlined
        v-model="subType"
        :options="fileArray"
        label="类型"
        dense
        emit-value
        map-options
      />
    </div>
    <div class="teamFile-box" @scroll="scrollFile">
      <q-card
        v-for="(item, index) in fileList"
        :key="`file${index}`"
        class="teamFile-box-container q-mb-md icon-point"
        @click="chooseFile(item.subType, item)"
      >
        <q-card-section class="teamFile-box-top">
          <div>{{ item.title }}</div>
          <div>
            {{
              fileArray[_.findIndex(fileArray, { value: item.subType })]?.label
            }}
            <q-chip>引用</q-chip>
            <q-chip>浏览</q-chip>

            <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
              <q-menu anchor="top right" self="top left" class="q-pa-sm">
                <q-list dense>
                  <!--  @click="editFile(item._key, index)" -->
                  <q-item clickable v-close-popup>
                    <q-item-section>编辑</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    @click="deleteFile(item._key, index)"
                  >
                    <q-item-section>删除</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="teamFile-box-bottom">
          <div>
            <!-- <span v-for="(personItem,personIndex) in item."></span> -->
          </div>
          <div>{{ dayjs(item.updateTime).format("YYYY-MM-DD HH:mm") }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
  <Teleport to="body">
    <div class="teamFile-detail" v-if="detailVisible">
      <cIframe :url="detailUrl" :title="fileDetail.title" />
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.teamFile {
  width: 100%;
  height: 100%;
  .teamFile-header {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
  .teamFile-box {
    width: 100%;
    height: calc(100% - 50px);
    @include scroll();
    @include p-number(10px, 10px);
    .teamFile-box-top {
      width: 100%;
      height: 50px;
      @include flex(space-between, center, null);
    }
    .teamFile-box-bottom {
      width: 100%;
      height: 50px;
      @include flex(space-between, center, null);
    }
  }
}
.teamFile-detail {
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
