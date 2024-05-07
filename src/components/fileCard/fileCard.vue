<script setup lang="ts">
import api from "@/services/api";
import _ from "lodash";
import { Dialog, useQuasar } from "quasar";

import { setMessage } from "@/services/util/common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import {
  docArray,
  fileArray,
  typeIcon,
  viewArray,
} from "@/services/config/config";
import { Icon as FileIcon } from "@iconify/vue";
import Icon from "../common/Icon.vue";
import cDrawer from "@/components/common/cDrawer.vue";
import TreeDetail from "@/components/tree/treeDetail.vue";
import { formatDocUrl } from "@/services/util/url";
const $q = useQuasar();
const dayjs: any = inject("dayjs");
const { token, user } = storeToRefs(appStore.authStore);
const { overKey } = storeToRefs(appStore.commonStore);
const { setOverKey, setIframeVisible } = appStore.commonStore;
const { setTeamKey } = appStore.teamStore;
const { setCardKey, setCardVisible } = appStore.cardStore;
const props = defineProps<{
  type: string;
  card: any;
  boxIndex?: number;
  taskIndex?: number;
  outType?: string;
  chooseKey?: string;
}>();
const emits = defineEmits<{
  (e: "chooseCard", key: string, type: string): void;
}>();
const drawerVisible = ref<boolean>(false);
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
const chooseResource = () => {
  setTeamKey(props.card.projectInfo._key);
  setIframeVisible(true, {
    url: `https://soar.cn/base/#/login?token=${token.value}&redirectPath=node/${props.card._key}`,
    title: props.card.title,
  });
};
const chooseTask = () => {
  // console.log(props.card);
  // setTeamKey(props.card.projectInfo._key);
  drawerVisible.value = true;
};
const chooseTaskTree = (detail, fullstate?: boolean) => {
  console.log(detail);
  setTeamKey(detail.projectInfo._key);
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
          }成功`,
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
const updateTask = async (type, obj, detail) => {
  let changeObj: any = {};
  switch (type) {
    case "name":
    case "hasDone":
    case "content":
    case "relaters":
      detail[type] = obj[type];
      changeObj[type] = obj[type];
      break;
    case "executor":
      detail.executorInfo.userAvatar = obj.userAvatar;
      detail.executorInfo.userKey = obj.userKey;
      changeObj.executor = obj.userKey;
      break;
    case "tag":
      changeObj.startAdornmentContent = {
        ...detail.startAdornmentContent,
        tag: { label: obj.label, color: obj.color },
      };
      break;
    case "milestone":
      let endTime = dayjs(obj.date).endOf("day").valueOf();
      changeObj.endTime = endTime;
      changeObj.startAdornmentContent = {
        ...detail.startAdornmentContent,
        milestone: {
          date: endTime,
          month: dayjs(obj.date).month() + 1,
          day: dayjs(obj.date).date(),
        },
      };
      console.log(detail.startAdornmentContent);
      console.log(changeObj.startAdornmentContent);
      break;

    case "link":
      changeObj.endAdornmentContent = {
        ...detail.endAdornmentContent,
        link: { url: obj.nodeUrl, text: obj.nodeUrlText },
      };
      break;
    case "file":
      changeObj.endAdornmentContent = {
        ...detail.endAdornmentContent,
        file: {
          fileKey: obj.fileKey,
          fileName: obj.fileName,
        },
      };
      break;
  }
  let updateRes = (await api.request.patch("node/more", {
    nodeKey: props.card._key,
    obj: { ...changeObj },
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    detail.boxIndex = props.boxIndex;
    detail.taskIndex = props.taskIndex;
    emits("chooseCard", detail, "update");
  }
};
const deleteTask = async (detail) => {
  $q.dialog({
    title: `删除任务`,
    message: `是否删除该任务`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("node", {
        nodeKey: props.card._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", `删除任务成功`);
        detail.boxIndex = props.boxIndex;
        detail.taskIndex = props.taskIndex;
        emits("chooseCard", detail, "delete");
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
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
            ><span style="font-weight: bold">{{ card.projectInfo?.name }}</span>
            /
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
                card.iconStatus === 2
                  ? '#ffc107'
                  : card.iconStatus === 3
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
                  @click="updatCard('iconStatus', 1, card)"
                  class="bg-green"
                >
                  <q-item-section class="text-white common-title">
                    正常</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="updatCard('iconStatus', 2, card)"
                  class="bg-amber q-my-xs"
                >
                  <q-item-section class="text-white common-title">
                    警戒</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="updatCard('iconStatus', 3, card)"
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
          <q-btn flat round size="9px" @click.stop="">
            <Icon name="gengduo" :size="18" />
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
      <!-- <div class="teamTaskTree-box-bottom q-px-sm">
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
          <q-avatar color="#fff" size="30px" class="shadow-3">
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
      </div> -->
    </q-card>
  </template>
  <template v-else-if="type === 'doc'">
    <q-card
      flat
      class="teamDoc-box-container q-mb-md icon-point card-hover"
      @click="chooseResource()"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
    >
      <q-card-section class="teamDoc-box-top q-pa-none">
        <div class="dp--center">
          <FileIcon
            :icon="typeIcon[card.type]"
            width="22"
            height="22"
            class="q-mr-sm"
            color="#757575"
          />
          {{ card.title }}
        </div>
      </q-card-section>
      <q-card-section class="teamDoc-box-bottom q-pa-none">
        <div class="dp--center">
          <template
            v-for="(pathItem, pathIndex) in card.way"
            :key="`${card._key}path${pathIndex}`"
          >
            <span>{{ pathItem.title }}</span>
            <span
              v-if="pathIndex < card.way.length - 1"
              style="margin: 0px 5px"
            >
              /
            </span>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </template>

  <template v-else-if="type === 'taskBox'">
    <!--      @click="chooseTask(card)" -->
    <q-card
      class="teamTask-box-container q-mb-md icon-point card-hover"
      :dense="!outType"
      :style="chooseKey === card._key ? { border: '2px solid #4a4a4a' } : null"
      @click="chooseTask()"
      @mouseenter="setOverKey(card._key)"
    >
      <q-card-section class="teamTask-box-top q-py-none">
        <!-- <div>
          <template v-if="outType"># {{ card.projectInfo.name }}</template>
        </div> -->
        <div class="teamTask-box-top-done">
          <Icon
            :name="
              card.hasDone ? 'a-quangouxuan21' : 'a-quanxuan-weixuanzhong21'
            "
            :size="20"
            color="#333"
            class="q-mr-sm"
            @click.stop="finishTask(card)"
          />
        </div>

        <div class="teamTask-box-top-title">{{ card.name }}</div>
        <div class="teamTask-box-top-icon" v-if="overKey === card._key">
          <q-btn flat round icon="more_horiz" size="9px" @click.stop="">
            <q-menu class="q-pa-sm">
              <q-list dense>
                <q-item clickable v-close-popup @click="deleteTask(card)">
                  <q-item-section>删除</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-card-section>
      <q-card-section class="teamTask-box-center q-py-none">
        <template
          v-for="(pathItem, pathIndex) in card.way"
          :key="`${card._key}path${pathIndex}`"
        >
          <span>{{ pathItem.name }}</span>
          <span v-if="pathIndex < card.way.length - 1" style="margin: 0px 2px">
            /
          </span>
        </template>
      </q-card-section>
      <q-card-section class="teamTask-box-bottom q-py-none">
        <div class="dp-center-center">
          <q-avatar color="#fff" size="20px" class="q-mr-sm">
            <img
              :src="
                card.assignorInfo?.userAvatar
                  ? card.assignorInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
            />
            <q-tooltip>
              {{ card.assignorInfo?.userName }}
            </q-tooltip>
          </q-avatar>
          {{
            card.assignorInfo?.userName.length > 5
              ? card.assignorInfo.userName.substring(0, 5)
              : card.assignorInfo.userName
          }}
          <q-icon name="arrow_right_alt" size="20px" class="q-ma-sm" />
          <q-avatar color="#fff" size="20px" class="q-mr-sm">
            <img
              :src="
                card.executorInfo?.userAvatar
                  ? card.executorInfo.userAvatar
                  : '/common/defaultPerson.png'
              "
            />
            <q-tooltip>
              {{ card.executorInfo?.userName }}
            </q-tooltip>
          </q-avatar>
          {{
            card.executorInfo?.userName.length > 5
              ? card.executorInfo.userName.substring(0, 3) + "..."
              : card.executorInfo.userName
          }}
        </div>
        {{ dayjs(card.createTime).fromNow() }}
        <!-- {{ dayjs(card.updateTime).fromNow() }} -->
      </q-card-section>
    </q-card></template
  >
  <c-drawer
    :visible="drawerVisible"
    @close="drawerVisible = false"
    :drawerStyle="{
      width: '400px',
      height: 'calc(100% - 78px)',
      background: '#f2f3f6',
      marginTop: '72px',
    }"
    opacityMask
  >
    <template #content>
      <TreeDetail
        :nodeKey="card._key"
        @updateDetail="updateTask"
        @close="drawerVisible = false"
        v-if="card?._key"
      />
    </template>
  </c-drawer>
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
.teamDoc-box-container {
  width: 100%;
  min-height: 40px;
  border-radius: 0px;
  padding: 0px 10px;
  box-sizing: border-box;
  .teamDoc-box-top {
    width: 100%;
    min-height: 40px;
    font-size: 14px;
    padding: 5px 0px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
    .teamDoc-box-top-title {
    }
    .teamDoc-box-top-icon {
      width: 52px;
      flex-shrink: 0;
    }
  }
  .teamDoc-box-bottom {
    width: 100%;
    min-height: 30px;
    font-size: 12px;
    color: $grey-5;
    @include flex(space-between, center, null);
    > div {
      flex-wrap: wrap;
    }
  }
}
.teamTaskTree-box-container {
  width: 100%;
  min-height: 50px;
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
  // border-radius: 0px;
  padding: 5px 0px;
  box-sizing: border-box;
  .teamTask-box-top {
    width: 100%;
    min-height: 35px;
    font-size: 16px;
    position: relative;
    z-index: 1;
    @include flex(space-between, flex-start, null);
    .teamTask-box-top-done {
      width: 25px;
      height: 25px;
      position: absolute;
      top: 0px;
      left: 18px;
      z-index: 2;
      @include flex(center, flex-start, null);
    }
    .teamTask-box-top-title {
      padding-left: 25px;
      padding-top: 5px;
      box-sizing: border-box;
      flex: 1;
      line-height: 20px;
      // word-wrap: break-word;
      // white-space: pre-wrap;
      // text-align: left;
    }
    .teamTask-box-top-icon {
      width: 25px;
      flex-shrink: 0;
    }
  }
  .teamTask-box-center {
    width: 100%;
    min-height: 18px;
    // height: 80px;
    color: $grey-6;
    font-size: 12px;
    line-height: 14px;
    margin-bottom: 5px;
  }
  .teamTask-box-bottom {
    width: 100%;
    height: 25px;

    font-size: 12px;
    // height: 80px;
    @include flex(space-between, center, null);
  }
}
</style>
<style></style>
