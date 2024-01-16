<script setup lang="ts">
import api from "@/services/api";
import _ from "lodash";
import { useQuasar } from "quasar";
import cIframe from "@/components/common/cIframe.vue";
import { setMessage } from "@/services/util/common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const props = defineProps<{
  type: string;
  card: any;
}>();
const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
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
const chooseDoc = (type, detail) => {
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
const deleteDoc = async (key) => {
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
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
</script>
<template>
  <template v-if="type === 'taskTree'"></template>
  <template v-else-if="type === 'doc'">
    <q-card
      class="teamDoc-box-container q-mb-md icon-point"
      @click="chooseDoc(card.subType, card)"
    >
      <q-card-section class="fileCard-box-top">
        <div>{{ card.title }}</div>
        <div>
          {{ docArray[_.findIndex(docArray, { value: card.subType })]?.label }}
          <q-chip>引用</q-chip>
          <q-chip>浏览</q-chip>

          <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup>
                  <q-item-section>编辑</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteDoc(card._key)">
                  <q-item-section>删除</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section class="teamDoc-box-bottom">
        <div>
          <!-- <span v-for="(personItem,personIndex) in item."></span> -->
        </div>
        <div>{{ dayjs(card.updateTime).format("YYYY-MM-DD HH:mm") }}</div>
      </q-card-section>
    </q-card>
  </template>
  <template v-else-if="type === 'file'">
    <q-card
      class="teamFile-box-container q-mb-md icon-point"
      @click="chooseDoc(card.subType, card)"
    >
      <q-card-section class="teamFile-box-top">
        <div>{{ card.title }}</div>
        <div>
          {{
            fileArray[_.findIndex(fileArray, { value: card.subType })]?.label
          }}
          <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup>
                  <q-item-section>编辑</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteDoc(card._key)">
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
        <div>{{ dayjs(card.updateTime).format("YYYY-MM-DD HH:mm") }}</div>
      </q-card-section>
    </q-card>
  </template>
  <template v-else-if="type === 'knowledgeBase'"></template>
  <Teleport to="body">
    <div class="teamDoc-detail" v-if="detailVisible">
      <cIframe :url="detailUrl" :title="fileDetail.title" />
    </div>
  </Teleport>
</template>
<style scoped lang="scss">
.teamDoc-box-container {
  .teamDoc-box-top {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
  .teamDoc-box-bottom {
    width: 100%;
    height: 50px;
    @include flex(space-between, center, null);
  }
}
.teamFile-box-container {
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
</style>
<style></style>
