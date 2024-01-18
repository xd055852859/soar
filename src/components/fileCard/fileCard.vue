<script setup lang="ts">
import api from "@/services/api";
import _ from "lodash";
import { useQuasar } from "quasar";
import cIframe from "@/components/common/cIframe.vue";
import TeamTree from "@/components/tree/tree.vue";
import { setMessage } from "@/services/util/common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { docArray, fileArray, viewArray } from "@/services/config/config";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token } = storeToRefs(appStore.authStore);
const props = defineProps<{
  type: string;
  card: any;
  outType?: string;
}>();
const emits = defineEmits<{
  (e: "chooseCard", key: string, type: string): void;
}>();

const fileDetail = ref<any>(null);
const detailVisible = ref<boolean>(false);
const detailUrl = ref<string>("");
//任务
const taskDetail = ref<any>(null);
const nodeKey = ref<string>("");
//文档
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
const deleteCard = async (detail) => {
  $q.dialog({
    title: `删除${
      viewArray[_.findIndex(viewArray, { value: props.type })].label
    }`,
    message: `是否删除该${
      viewArray[_.findIndex(viewArray, { value: props.type })].label
    }`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("card", {
        cardKey: detail._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage(
          "success",
          `删除${
            viewArray[_.findIndex(viewArray, { value: props.type })].label
          }成功`
        );
        emits("chooseCard", detail, "delete");
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const updatCard = async (key, value, detail) => {
  let detailRes = (await api.request.patch("card", {
    cardKey: detail._key,
    [key]: value,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    setMessage("success", "编辑成功");
    detail[key] = value;
    emits("chooseCard", detail, "update");
  }
};
const updateTitle = async (detail) => {
  $q.dialog({
    title: "重命名",
    prompt: {
      model: detail.title,
      type: "text", // optional
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk((data) => {
    updatCard("title", data, detail);
  });
};
const finishTask = async (detail) => {
  let detailRes = (await api.request.patch("node/finish", {
    nodeKey: detail._key,
    hasDone: !detail.hasDone,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    detail.hasDone = !detail.hasDone;
    emits("chooseCard", detail, "update");
  }
};
//任务
const chooseTask = (detail) => {
  taskDetail.value = detail;
  nodeKey.value = detail._key;
  emits("chooseCard", detail, "search");
};
const handleDownload = (detail) => {
  // let a = document.createElement("a");
  // a.href = detail.url;
  // a.download = detail.name;
  // a.click();

  const a = document.createElement("a");
  a.setAttribute("href", detail.url);
  a.setAttribute("download", detail.name);
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
</script>
<template>
  <template v-if="type === 'taskTree'">
    <q-card
      class="teamTask-box-container q-mb-md icon-point"
      @click="chooseTask(card)"
    >
      <q-card-section class="full-width teamTask-box-top">
        <template v-if="outType"># {{ card.projectInfo.name }} / </template>
        {{ card.title }}
        <q-icon name="o_send" size="20px" @click.stop="detailVisible = true" />
      </q-card-section>
      <q-card-section class="teamTask-box-bottom">
        <q-circular-progress
          v-for="(taskItem, taskIndex) in card.treeMember"
          :key="`taskProgress${taskIndex}`"
          show-value
          font-size="10px"
          class="q-mr-sm"
          :value="
            taskItem.totalTask === 0
              ? 0
              : (taskItem.finishTask / taskItem.totalTask) * 100
          "
          size="45px"
          :thickness="0.25"
          color="primary"
          track-color="grey-3"
        >
          <q-avatar size="35px">
            <img
              :src="
                taskItem.userAvatar
                  ? taskItem.userAvatar
                  : '/common/defaultPerson.png'
              "
            />
          </q-avatar>
        </q-circular-progress>
      </q-card-section>
    </q-card>
    <Teleport to="body">
      <div class="fileCard-detail" v-if="detailVisible">
        <TeamTree :cardKey="card._key" ref="treeRef" viewType="tree" />
      </div>
    </Teleport>
  </template>
  <template v-else-if="type === 'doc'">
    <q-card
      class="teamDoc-box-container q-mb-md icon-point"
      @click="chooseDoc(card.subType, card)"
    >
      <q-card-section class="teamDoc-box-top">
        <div>
          <template v-if="outType"># {{ card.projectInfo.name }} / </template>
          {{ card.title }}
        </div>
        <div>
          {{ docArray[_.findIndex(docArray, { value: card.subType })]?.label }}
          <q-chip>引用</q-chip>
          <q-chip>浏览</q-chip>

          <q-btn flat round icon="o_more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup @click="updateTitle(card)">
                  <q-item-section>重命名</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteCard(card)">
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
    <Teleport to="body">
      <div class="fileCard-detail" v-if="detailVisible">
        <cIframe :url="detailUrl" :title="fileDetail.title" />
      </div>
    </Teleport>
  </template>
  <template v-else-if="type === 'file'">
    <q-card
      class="teamFile-box-container q-mb-md icon-point"
      @click="chooseDoc(card.subType, card)"
    >
      <q-card-section class="teamFile-box-top">
        <div>
          <template v-if="outType"># {{ card.projectInfo.name }} / </template>
          {{ card.title }}
        </div>
        <div>
          {{
            fileArray[_.findIndex(fileArray, { value: card.subType })]?.label
          }}
          <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup>
                  <q-item-section @click="updateTitle(card)"
                    >重命名</q-item-section
                  >
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section @click="handleDownload(card)"
                    >下载</q-item-section
                  >
                </q-item>
                <q-item clickable v-close-popup @click="deleteCard(card)">
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
  <template v-else-if="type === 'task'">
    <q-card class="teamFile-box-container q-mb-md icon-point">
      <q-card-section class="teamFile-box-top">
        <div>
          <template v-if="outType"># {{ card.projectInfo.name }}</template>
        </div>
        <div>
          {{ dayjs(card.updateTime).fromNow() }}
          <q-btn flat round icon="more_horiz" size="12px" @click.stop="">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <!-- <q-item clickable v-close-popup>
                  <q-item-section>编辑</q-item-section>
                </q-item> -->
                <q-item clickable v-close-popup @click="deleteCard(card)">
                  <q-item-section>删除</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section class="teamFile-box-center">
        <q-icon
          :name="card.hasDone ? 'o_check_circle' : 'o_circle'"
          size="20px"
          class="q-mr-sm"
          @click="finishTask(card)"
        />
        {{ card.name }}
      </q-card-section>
      <q-card-section class="teamFile-box-bottom">
        <div>
          <!-- <span v-for="(personItem,personIndex) in item."></span> -->
        </div>
        <div class="dp-center-center">
          <q-avatar size="30px" class="q-mr-sm">
            <img
              :src="
                card.assignorInfo?.userAvatar
                  ? card.assignorInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
            />
          </q-avatar>
          {{ card.assignorInfo?.userName }}
          <q-icon name="arrow_right_alt" size="20px" class="q-ma-sm" />
          <q-avatar size="30px" class="q-mr-sm">
            <img
              :src="
                card.executorInfo?.userAvatar
                  ? card.executorInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
            />
          </q-avatar>
          {{ card.executorInfo?.userName }}
        </div>
      </q-card-section>
    </q-card></template
  >
  <template v-else-if="type === 'knowledgeBase'"></template>
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
.teamTask-box-container {
  .teamTask-box-top {
    width: 100%;
    height: 30px;
    @include flex(space-between, center, null);
  }
  .teamFile-box-center {
  }
  .teamTask-box-bottom {
    width: 100%;
    height: 80px;
    @include scroll();
    @include flex(flex-start, center, null);
  }
}
.fileCard-detail {
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
