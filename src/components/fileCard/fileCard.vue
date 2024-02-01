<script setup lang="ts">
import api from "@/services/api";
import _ from "lodash";
import { useQuasar } from "quasar";

import { setMessage } from "@/services/util/common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { docArray, fileArray, viewArray } from "@/services/config/config";
import Icon from "../common/Icon.vue";
import { formatDocUrl } from "@/services/util/url";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token, user } = storeToRefs(appStore.authStore);
const { overKey } = storeToRefs(appStore.commonStore);
const { setOverKey } = appStore.commonStore;
const { setTargetTeamKey } = appStore.teamStore;
const { setCardKey, setCardVisible } = appStore.cardStore;
const props = defineProps<{
  type: string;
  card: any;
  outType?: string;
  chooseKey?: string;
}>();
const emits = defineEmits<{
  (e: "chooseCard", key: string, type: string): void;
}>();

const fileDetail = ref<any>(null);
//任务
// const chooseTaskTree = (detail) => {
//   setCardKey(detail._key);
//   emits("chooseCard", detail, "search");
// };
// const openTree = (detail) => {
//   setCardKey(detail._key);
//   setCardVisible(true, "tasktree");
// };
//文档
const chooseDoc = (type, detail, fullstate?: boolean) => {
  fileDetail.value = detail;
  let docUrl = formatDocUrl(type, detail._key, token.value);
  setTargetTeamKey(detail.projectKey);
  if (fullstate) {
    setCardKey(detail._key);
    setCardVisible(true, "doc", docUrl);
  } else {
    emits("chooseCard", detail, "search");
  }
};
const chooseFile = (detail, fullstate?: boolean) => {
  setTargetTeamKey(detail.projectKey);
  if (fullstate) {
    setCardKey(detail._key);
    setCardVisible(true, "file");
  } else {
    emits("chooseCard", detail, "search");
  }
};
const chooseTaskTree = (detail, fullstate?: boolean) => {
  setTargetTeamKey(detail.projectKey);
  if (fullstate) {
    setCardKey(detail._key);
    setCardVisible(true, "tasktree");
  } else {
    emits("chooseCard", detail, "search");
  }
  // setCardKey(detail._key);
  // emits("chooseCard", detail, "search");
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
      flat
      class="teamTaskTree-box-container q-mb-md icon-point card-hover q-py-none"
      @click="chooseTaskTree(card)"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
      @mouseenter="setOverKey(card._key)"
    >
      <!-- red amber green -->
      <q-card-section class="full-width teamTaskTree-box-top q-py-none">
        <div>
          <template v-if="outType && outType !== 'recent'"
            >{{ card.projectInfo?.name }} /
          </template>
          {{ card.title }}
        </div>

        <q-card-section
          class="justify-end q-pa-none teamTask-box-icon"
          v-if="overKey === card._key"
        >
          <q-btn flat round size="9px">
            <Icon
              name="a-mokexiaoshumiao-weixinyuan2"
              :size="18"
              :color="
                card.iconState === 2
                  ? 'amber'
                  : card.iconState === 3
                  ? 'red'
                  : 'green'
              "
            />
            <q-menu class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item
                  clickable
                  v-close-popup
                  @click="updatCard('iconState', 1, card)"
                  class="bg-green"
                >
                  <q-item-section class="text-white common-title">
                    正常</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="updatCard('iconState', 2, card)"
                  class="bg-amber q-my-xs"
                >
                  <q-item-section class="text-white common-title">
                    警戒</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="updatCard('iconState', 3, card)"
                  class="bg-red"
                >
                  <q-item-section class="text-white common-title"
                    >异常</q-item-section
                  >
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn flat round size="9px" @click.stop="chooseTaskTree(card, true)">
            <Icon name="quanping_o" :size="22" />
          </q-btn>
          <q-btn flat round icon="o_more_horiz" size="9px" @click.stop="">
            <q-menu class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup @click="updateTitle(card)">
                  <q-item-section class="common-title">重命名</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="deleteCard(card)">
                  <q-item-section class="common-title">删除</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-card-section>
        <q-space v-else></q-space>
      </q-card-section>
      <div class="teamTaskTree-box-bottom q-px-sm">
        <q-circular-progress
          v-for="(taskItem, taskIndex) in card.treeMember"
          :key="`taskProgress${taskIndex}`"
          show-value
          font-size="10px"
          class="q-mr-xs q-mb-sm"
          :value="
            taskItem.totalTask === 0
              ? 0
              : (taskItem.finishTask / taskItem.totalTask) * 100
          "
          size="36px"
          :thickness="0.25"
          :color="taskItem._key !== user?._key ? 'primary' : 'red'"
          track-color="grey-3"
        >
          <q-avatar size="30px" class="shadow-3">
            <img
              :src="
                taskItem.userAvatar
                  ? taskItem.userAvatar
                  : '/common/defaultPerson.png'
              "
            />
            <q-tooltip :offset="[10, 5]">
              {{ taskItem.userName }}
            </q-tooltip>
          </q-avatar>
        </q-circular-progress>
      </div>
    </q-card>
  </template>
  <template v-else-if="type === 'doc'">
    <q-card
      flat
      class="teamFile-box-container q-mb-md icon-point card-hover q-py-none"
      @click="chooseDoc(card.type, card, false)"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
      @mouseenter="setOverKey(card._key)"
    >
      <q-card-section class="teamFile-box-top q-py-none">
        <div class="teamFile-box-top-title">
          <template v-if="outType"># {{ card.projectInfo?.name }} / </template>
          {{ card.title }}
        </div>
        <div class="teamFile-box-top-icon" v-if="overKey === card._key">
          <!-- <q-chip color="teal" text-color="white" icon="description">
            {{
              docArray[_.findIndex(docArray, { value: card.subType })]?.label
            }}
          </q-chip> -->
          <q-btn
            flat
            round
            size="8px"
            @click.stop="chooseDoc(card.type, card, true)"
          >
            <Icon name="quanping_o" :size="22" />
          </q-btn>
          <q-btn flat round icon="o_more_horiz" size="8px" @click.stop="">
            <q-menu class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup @click="updateTitle(card)">
                  <q-item-section class="common-title">重命名</q-item-section>
                </q-item>
                <!-- <q-item clickable v-close-popup @click="deleteCard(card)">
                  <q-item-section class="common-title">删除</q-item-section>
                </q-item> -->
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>
      <!-- <q-card-section class="teamDoc-box-bottom">
        <div>
          <q-btn dense flat color="grey-6" round icon="o_link">
          </q-btn>
          <q-btn dense flat color="grey-6" round icon="o_visibility">
          </q-btn>
        </div>
        <div>{{ dayjs(card.updateTime).format("YYYY-MM-DD HH:mm") }}</div>
      </q-card-section> -->
    </q-card>
  </template>
  <template v-else-if="type === 'file'">
    <q-card
      flat
      class="teamFile-box-container q-mb-md icon-point card-hover"
      @click="chooseFile(card)"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
      @mouseenter="setOverKey(card._key)"
    >
      <q-card-section class="teamFile-box-top q-py-none">
        <div class="teamFile-box-top-title">
          <template v-if="outType && outType !== 'recent'"
            ># {{ card.projectInfo?.name }} /
          </template>
          <!-- <q-icon
            name="cloud_upload"
            size="25px"
            @click.stop="chooseFile(card, true)"
          /> -->
          {{ card.title }}
        </div>
        <div class="teamFile-box-top-icon" v-if="overKey === card._key">
          <q-btn flat round size="8px" @click.stop="chooseFile(card, true)">
            <Icon name="quanping_o" :size="22" />
          </q-btn>
          <q-btn flat round icon="more_horiz" size="9px" @click.stop="">
            <q-menu class="q-pa-sm">
              <q-list dense>
                <!--  @click="editFile(item._key, index)" -->
                <q-item clickable v-close-popup @click="updateTitle(card)">
                  <q-item-section class="common-title">重命名</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="handleDownload(card)">
                  <q-item-section class="common-title">下载</q-item-section>
                </q-item>
                <!-- <q-item clickable v-close-popup @click="deleteCard(card)">
                  <q-item-section class="common-title">删除</q-item-section>
                </q-item> -->
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>
      <!-- <q-card-section class="teamFile-box-bottom">
        <div>{{ dayjs(card.updateTime).format("YYYY-MM-DD HH:mm") }}</div>
      </q-card-section> -->
    </q-card>
  </template>
  <template v-else-if="type === 'task'">
    <!--      @click="chooseTask(card)" -->
    <q-card
      class="teamTask-box-container q-mb-md icon-point card-hover"
      :dense="!outType"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
      @mouseenter="setOverKey(card._key)"
    >
      <q-card-section class="teamTask-box-top q-py-none">
        <!-- <div>
          <template v-if="outType"># {{ card.projectInfo.name }}</template>
        </div> -->

        <!-- <q-icon
          :name="card.hasDone ? 'o_check_circle' : 'o_circle'"
          size="20px"
          class="q-mr-sm"
          @click="finishTask(card)"
        /> -->
        <Icon
          :name="card.hasDone ? 'a-quangouxuan21' : 'a-quanxuan-weixuanzhong21'"
          :size="20"
          color="#333"
          class="q-mr-sm"
          @click="finishTask(card)"
        />
        <div class="teamTask-box-top-title">{{ card.name }}</div>
        <div class="teamTask-box-top-icon" v-if="overKey === card._key">
          <q-btn flat round icon="more_horiz" size="9px" @click.stop="">
            <q-menu class="q-pa-sm">
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
      <q-card-section class="teamTask-box-bottom q-py-none">
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
                  : '/common/defaultPerson.png'
              "
            />
          </q-avatar>
          {{ card.executorInfo?.userName }}
        </div>
        {{ dayjs(card.updateTime).fromNow() }}
      </q-card-section>
    </q-card></template
  >
  <template v-else-if="type === 'knowledgeBase'"></template>
</template>
<style scoped lang="scss">
// .teamDoc-box-container {
//   width: 100%;
//   height: 40px;
//   border-radius: 0px;
//   padding: 0px 10px;
//   box-sizing: border-box;
//   .teamDoc-box-top {
//     width: 100%;
//     height: 100%;
//     font-size: 14px;
//     padding: 5px 0px;
//     box-sizing: border-box;
//     @include flex(space-between, center, null);
//   }
//   .teamDoc-box-bottom {
//     width: 100%;
//     height: 50px;
//     font-size: 12px;
//     @include flex(space-between, center, null);
//   }
// }
.teamFile-box-container {
  width: 100%;
  min-height: 40px;
  border-radius: 0px;
  padding: 0px 10px;
  box-sizing: border-box;
  .teamFile-box-top {
    width: 100%;
    min-height: 40px;
    font-size: 14px;
    padding: 5px 0px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
    .teamFile-box-top-title {
      flex: 1;
      line-height: 18px;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .teamFile-box-top-icon {
      width: 52px;
      flex-shrink: 0;
    }
  }
  .teamFile-box-bottom {
    width: 100%;
    height: 50px;
    font-size: 16px;
    @include flex(space-between, center, null);
  }
}
.teamTaskTree-box-container {
  width: 100%;
  min-height: 100px;
  border-radius: 0px;
  padding: 5px 0px;
  box-sizing: border-box;
  .teamTaskTree-box-top {
    width: 100%;
    min-height: 35px;
    font-size: 14px;
    @include flex(space-between, center, null);
    .teamTaskTree-box-top-title {
      flex: 1;
      // line-height: 18px;
      // word-wrap: break-word;
      // white-space: pre-wrap;
      // text-align: left;
    }
    .teamTaskTree-box-top-icon {
      width: 25px;
      flex-shrink: 0;
    }
  }
  .teamTaskTree-box-bottom {
    width: 100%;
    min-height: 50px;
    @include scroll();
    @include flex(flex-start, center, wrap);
  }
}
.teamTask-box-container {
  width: 100%;
  min-height: 80px;
  border-radius: 0px;
  padding: 5px 0px;
  box-sizing: border-box;
  .teamTask-box-top {
    width: 100%;
    min-height: 55px;
    font-size: 14px;
    @include flex(space-between, center, null);
    .teamTask-box-top-title {
      flex: 1;
      // line-height: 18px;
      // word-wrap: break-word;
      // white-space: pre-wrap;
      // text-align: left;
    }
    .teamTask-box-top-icon {
      width: 25px;
      flex-shrink: 0;
    }
  }
  .teamTask-box-bottom {
    width: 100%;
    // height: 80px;
    @include scroll();
    @include flex(space-between, center, null);
  }
}
</style>
<style></style>
