<script setup lang="ts">
import { applyReactInVue, applyPureReactInVue } from "veaury";
import Tree from "@/components/react_app/tree.jsx";
import { ResultProps } from "@/interface/Common";
import cDialog from "@/components/common/cDialog.vue";
import cCalendar from "@/components/common/cCalendar.vue";
import treeIcon from "@/components/tree/icon.vue";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { uploadFile } from "@/services/util/file";
import NoteList from "@/views/home/note/NoteList.vue";
import Icon from "../common/Icon.vue";
import cDrawer from "../common/cDrawer.vue";
import dayjs from "dayjs";
import fileCard from "../fileCard/fileCard.vue";
import NoteEditor from "@/views/home/note/NoteEditor.vue";
import { tagArray } from "@/services/config/config";
const CustomTree = applyReactInVue(Tree);
const { token } = storeToRefs(appStore.authStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamMemberList, teamKey } = storeToRefs(appStore.teamStore);
const { setCardKey, setCardVisible } = appStore.cardStore;
const { note } = storeToRefs(appStore.noteStore);
const { clearNoteDetail } = appStore.noteStore;

const props = defineProps<{
  cardKey?: string;
  viewType: string;
}>();
const cardDetail = ref<any>(null);

const treeWidth = ref<number>(0);
const treeHeight = ref<number>(0);
const rootKey = ref<string>("");
const treeRef = ref<any>(null);
const targetEl = ref<any>(null);
const menuVisible = ref<boolean>(false);

const nodeDetail = ref<any>(null);
const nodeInfo = ref<any>(null);
const nodes = ref<any>(null);
const nodeContent = ref<string>("");

const commentVisible = ref<boolean>(false);
const commentList = ref<string>("");
const comment = ref<string>("");

const nodeUrl = ref<string>("");
const nodeUrlText = ref<string>("");

const pathList = ref<any>([]);

const updateVisible = ref<boolean>(false);
const updateList = ref<any>([]);

const milestoneList = ref<any>([]);
const milestoneTaskList = ref<any>([]);

const fileVisible = ref<boolean>(false);
const fileInput = ref<string>("");
const searchList = ref<any>([]);
const cardType = ref<string>("doc");
// const imageUrl = ref<string>("");
// const imageHeight = ref<number>(0);
// const imageWidth = ref<number>(0);
const noteDialog = ref(false);
const detailDialog = ref(false);

const colorArray = [
  "rgb(89, 89, 89)",
  "rgb(251, 191, 188)",
  "rgb(248, 230, 171)",
  "rgb(226, 198, 214)",
  "rgb(186, 206, 253)",
  "rgb(169, 239, 230)",
  "rgb(223, 238, 150)",
  "rgb(222, 224, 227)",
];
const fileArray = [
  {
    value: "doc",
    label: "文档",
  },
  {
    value: "file",
    label: "文件",
  },
];
onMounted(() => {
  treeWidth.value = document.getElementById("teamTree")!.offsetWidth;
  treeHeight.value = document.getElementById("teamTree")!.offsetHeight;
});
const getTreeInfo = async (key) => {
  let cardRes = (await api.request.get("card/detail", {
    cardKey: key,
  })) as ResultProps;
  if (cardRes.msg === "OK") {
    cardDetail.value = cardRes.data;
    rootKey.value = cardRes.data.rootKey;
    console.log(rootKey.value);
  }
};
const showMenu = (node, el) => {
  menuVisible.value = true;
  targetEl.value = el;
  nodeInfo.value = { ...node };
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  nodeContent.value = node.content;
};
const updateContent = () => {
  treeRef.value.__veauryReactRef__.updateNodeObj(
    { content: nodeContent.value },
    async (newNodes) => {},
    nodeDetail.value._key
  );
};
const updateExecutor = async (userKey, avatarUri) => {
  let updateRes = (await api.request.patch("node/executor", {
    nodeKey: nodeInfo.value._key,
    executor: userKey,
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    nodes.value[nodeInfo.value._key].avatarUri = userKey
      ? avatarUri
        ? avatarUri
        : "/common/defaultPerson.png"
      : "";
    nodes.value[nodeInfo.value._key].executor = userKey;
    nodes.value[nodeInfo.value._key].showCheckbox = userKey ? true : false;
    treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
  }
};
const updateStyle = (key, value?: string) => {
  let newNode = { ...nodeInfo.value };
  treeRef.value.__veauryReactRef__.updateNodeObj(
    { [key]: value ? value : !newNode[key] },
    async (newNodes) => {
      newNodes[newNode._key][key] = value ? value : !newNode[key];
      nodeInfo.value[key] = value ? value : !newNode[key];
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      nodes.value = newNodes;
    },
    nodeInfo.value._key
  );
};
const updateUrl = () => {
  // getUrlInfo: (url: string) => {
  //   return request.get("https://nodeserver.qingtime.cn/urlIconOrigin?=", {
  //     linkUrl: url,
  //   });
  // },
  let newNode = { ...nodeInfo.value };
  setAdornmentContent(newNode, "endAdornmentContent", {
    link: { url: nodeUrl.value, text: nodeUrlText.value },
  });
};
const uploadImage = (file) => {
  console.log(file);
  let newNode = { ...nodeInfo.value };
  let mimeType = ["image/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      let img: any = new Image();
      //@ts-ignore
      img.src = url;
      img.onload = () => {
        //默认按比例压缩
        let width = img.width;
        let height = img.height;
        console.log(img);
        let obj = {
          imageUrl: url,
          imageHeight: width,
          imageWidth: height,
        };
        nodes.value[nodeInfo.value._key] = {
          ...nodes.value[nodeInfo.value._key],
          ...obj,
        };
        treeRef.value.__veauryReactRef__.updateNodeObj(
          { ...obj },
          async (newNodes) => {
            newNodes[newNode._key] = { ...newNodes[newNode._key], ...obj };
            treeRef.value.__veauryReactRef__.setNodes(newNodes);
            menuVisible.value = false;
            nodes.value = newNodes;
          },
          nodeInfo.value._key
        );
      };
    });
  }
};
const changePath = async (nodeKey, startNodeKey, includeStartNodeKey) => {
  let pathRes = (await api.request.get("node/way", {
    nodeKey: nodeKey,
    startNodeKey: startNodeKey,
    includeStartNodeKey: includeStartNodeKey,
  })) as ResultProps;
  if (pathRes.msg === "OK") {
    pathList.value = pathRes.data;
  }
};

const getUpdateList = async () => {
  let updateRes = (await api.request.get("task/card", {
    cardKey: props.cardKey,
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    updateList.value = [...updateRes.data];
  }
};
//里程碑
const getmilestoneList = async (newKey) => {
  let dataRes = (await api.request.get("node/milestone", {
    cardKey: newKey,
    // startTime: dayjs().subtract(90, "day").startOf("day").valueOf(),
    // endTime: dayjs().valueOf(),
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    milestoneList.value = dataRes.data.map((item) => {
      [item.year, item.month, item.day] = item.ctime.split("-");
      item.time = dayjs(item.ctime).endOf("day").valueOf();
      item.bgColor =
        dayjs(item.ctime).endOf("day").valueOf() <
        dayjs().endOf("day").valueOf()
          ? "#f44336"
          : "#07be51";
      return item;
    });
  }
};
const updatemilestone = (date) => {
  let newNode = { ...nodeInfo.value };
  let endTime = dayjs(date).endOf("day").valueOf();
  treeRef.value.__veauryReactRef__.updateNode(
    "endTime",
    endTime,
    async (newNodes) => {
      newNodes[newNode._key].endTime = endTime;
      setAdornmentContent(newNode, "bottomAdornmentContent", {
        milestone: {},
      });
    },
    nodeInfo.value._key
  );
};
const chooseMilestone = async (detail) => {
  let dataRes = (await api.request.get("node/milestone/detail", {
    cardKey: props.cardKey,
    filterDate: detail.time,
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    milestoneTaskList.value = [...dataRes.data];
  }
};
//文件筛选
const searchFile = async () => {
  let dataRes = (await api.request.get("card/search", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    cardType: cardType.value,
    keyword: fileInput.value,
    // startTime: dayjs().subtract(90, "day").startOf("day").valueOf(),
    // endTime: dayjs().valueOf(),
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    searchList.value = [...dataRes.data];
  }
};
const updateFile = (detail) => {
  let newNode = { ...nodeInfo.value };
  setAdornmentContent(newNode, "bottomAdornmentContent", {
    file: {
      fileKey: detail._key,
      fileType: detail.type,
      subType: detail.subType,
    },
  });
};
const setAdornmentContent = (node, adornmentContent, obj) => {
  treeRef.value.__veauryReactRef__.updateNodeObj(
    {
      bottomAdornmentContent: {
        ...node[adornmentContent],
        ...obj,
      },
    },
    async (newNodes) => {
      let adornmentContentObj = {};
      if (newNodes[node._key] && newNodes[node._key][adornmentContent]) {
        adornmentContentObj = { ...newNodes[node._key][adornmentContent], ...obj };
      } else {
        adornmentContentObj = { ...obj };
      }
      newNodes[node._key][adornmentContent] = { ...adornmentContentObj };
      nodeInfo.value[adornmentContent] = {
        ...adornmentContentObj,
      };
      newNodes[node._key] = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[node._key]
      );
      nodeInfo.value = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[node._key]
      );
      nodes.value = newNodes;
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      fileVisible.value = false;
    },
    nodeInfo.value._key
  );
};
const openAlt = (node) => {
  let fileKey = node.bottomAdornmentContent.file.fileKey;
  let fileType = node.bottomAdornmentContent.file.fileType;
  let subType = node.bottomAdornmentContent.file.subType;
  switch (fileType) {
    case "doc":
      chooseDoc(subType, fileKey);
      break;
    case "file":
      chooseFile(fileKey);
      break;
  }
};

const updateTag = (color) => {
  let newNode = { ...nodeInfo.value };
  setAdornmentContent(newNode, "bottomAdornmentContent", {
    tag: { color: color },
  });
};
//文档
const chooseDoc = (type, cardKey) => {
  setCardKey(cardKey);
  let detailUrl = "";
  const getApi = api.API_URL + "card/detail";
  const getParams = `{"cardKey": "${cardKey}" }`;
  const patchApi = api.API_URL + "card";
  const patchData = `["content", "title"]`;
  const uptokenApi = api.API_URL + "account/qiniuToken";
  const uptokenParams = `{"target": "cdn-soar"}`;
  switch (type) {
    case "text":
      detailUrl = `https://notecute.com/#/editor?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "draw":
      detailUrl = `https://draw.workfly.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams}}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":${patchData}}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2`;
      break;
    case "mind":
      detailUrl = `https://mind.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "ppt":
      detailUrl = `https://ppt.mindcute.com/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
    case "table":
      detailUrl = `https://sheets.qingtime.cn/?token=${token.value}&getDataApi={"url":"${getApi}","params":${getParams},"docDataName":"content"}&patchDataApi={"url":"${patchApi}","params":${getParams},"docDataName":"content"}&getUptokenApi={"url":"${uptokenApi}","params":${uptokenParams}}&isEdit=2&hideHead=1`;
      break;
  }
  console.log(detailUrl);
  setCardVisible(true, "doc", detailUrl);
};
const chooseFile = (cardKey) => {
  setCardKey(cardKey);
  // setCardVisible(true, "doc", detailUrl);
};
const chooseHighlight = (type, value?: string) => {
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  switch (type) {
    case "executor":
      for (let key in nodes.value) {
        let node = nodes.value[key];
        let element = document.getElementById(`tree-node-${node._key}`);
        element!.style.opacity = node.executor !== value ? "0.2" : "1";

        // node.color = node.executor === value ? "#fff" : "#fafafa";
        // node.backgroundColor = node.executor === value ? "#07be51" : "#f5f5f5";
      }
      break;
    case "task":
      for (let key in nodes.value) {
        let node = nodes.value[key];
        let element = document.getElementById(`tree-node-${node._key}`);
        element!.style.opacity = node.executor !== value ? "0.2" : "1";
      }
      break;
    case "finish":
      for (let key in nodes.value) {
        let node = nodes.value[key];
        let element = document.getElementById(`tree-node-${node._key}`);
        element!.style.opacity = node.hasDone && node.executor ? "0.2" : "1";
        // node.color = node.hasDone && node.executor ? "#fafafa" : "";
        // node.backgroundColor =
        //   node.hasDone && node.executor
        //     ? "#f5f5f5"
        //     : node._key === rootKey.value
        //     ? "#07be51"
      }
      break;
    case "clear":
      for (let key in nodes.value) {
        let node = nodes.value[key];
        let element = document.getElementById(`tree-node-${node._key}`);
        element!.style.opacity = "1";

        // node.color = "#595959";
        // node.backgroundColor = "#f0f0f0";
        // node.color = "";
        // node.backgroundColor = node._key === rootKey.value ? "#07be51" : "";

        //@ts-ignore
      }
      break;
  }
  treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
};
watch(
  () => props.cardKey,
  (newKey) => {
    getTreeInfo(newKey);
    getmilestoneList(newKey);
  },
  { immediate: true }
);
watch(updateVisible, (newVisible) => {
  console.log(newVisible);
  if (newVisible) {
    getUpdateList();
  }
});
watch(fileInput, (newName) => {
  if (!newName) {
    searchList.value = [];
  }
});
watch(note, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    detailDialog.value = true;
  }
});

watch(detailDialog, (newVal, oldVal) => {
  if (!newVal) {
    clearNoteDetail();
  }
});
</script>
<template>
  <div class="teamTree" id="teamTree" @click="chooseHighlight('clear')">
    <!-- <button :draggable="true">测试</button> -->
    <div class="teamTree-header">
      <div class="teamTree-header-path">
        <q-breadcrumbs gutter="xs">
          <template v-slot:separator>
            <q-icon size="1.5em" name="chevron_right" color="primary" />
          </template>
          <q-breadcrumbs-el
            v-for="(item, index) in pathList"
            :key="`path${index}`"
            :label="item.name"
            @click="treeRef.__veauryReactRef__.setStartId(item._key)"
          />
        </q-breadcrumbs>
      </div>
      <div class="teamTree-header-button">
        <q-btn flat round @click="noteDialog = true">
          <Icon name="a-suji21" :size="22" />
        </q-btn>
        <q-btn flat round icon="o_update" @click="updateVisible = true" />
        <q-btn flat round icon="o_more_horiz" size="12px" @click.stop="">
          <q-menu anchor="top right" self="top left" class="q-pa-sm">
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                clickable
                v-close-popup
                @click="chooseHighlight('finish')"
              >
                <q-item-section>隐藏已完成</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <div class="teamTree-footer">
      <div
        class="footer-milestone"
        @click="chooseMilestone(item)"
        v-for="(item, index) in milestoneList"
        :key="`milestone${index}`"
      >
        <div class="footer-top" :style="{ backgroundColor: item.bgColor }">
          {{ item.month }}
        </div>
        <div class="footer-bottom">{{ item.day }}</div>
        <q-badge color="red" floating>{{ item.count }}</q-badge>
        <q-menu
          style="width: 350px"
          anchor="top left"
          self="bottom left"
          class="q-px-md q-pt-md q-pb-xs milestone-menu"
        >
          <template
            v-for="(taskItem, taskIndex) in milestoneTaskList"
            :key="`taskItem${taskIndex}`"
          >
            <fileCard :card="taskItem" type="task" />
          </template>
        </q-menu>
      </div>
    </div>
    <div class="teamTree-right">
      <div
        class="icon-point"
        v-for="(item, index) in teamMemberList"
        :key="`task${index}`"
        @click.stop="chooseHighlight('executor', item.userKey)"
      >
        <!-- <q-circular-progress
       
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
        > -->
        <q-avatar size="35px" class="q-mb-sm">
          <img
            :src="
              item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
            "
          />
          <q-tooltip :offset="[10, 5]">
            {{ item.userName }}
          </q-tooltip>
        </q-avatar>
        <!-- </q-circular-progress> -->
      </div>
    </div>
    <CustomTree
      ref="treeRef"
      :rootKey="rootKey"
      :viewType="viewType"
      @showMenu="showMenu"
      @changePath="changePath"
      @openAlt="openAlt"
    />

    <q-menu :target="targetEl" v-model="menuVisible">
      <q-btn flat round>
        <q-avatar size="28px">
          <img
            :src="
              nodeDetail?.avatarUri
                ? nodeDetail.avatarUri
                : '/common/defaultPerson.png'
            "
          />
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                class="row items-center justify-between"
                @click="updateExecutor('', '')"
              >
                无
              </q-item>
              <q-item
                v-for="(item, index) in teamMemberList"
                :key="`member${index}`"
                clickable
                class="row items-center justify-between"
                @click="updateExecutor(item.userKey, item.userAvatar)"
              >
                <q-avatar size="24px" class="q-mr-sm">
                  <img
                    :src="
                      item?.userAvatar
                        ? item?.userAvatar
                        : '/common/defaultPerson.png'
                    "
                  />
                </q-avatar>
                <div class="single-to-long" style="width: 120px">
                  {{ item.userName }}
                </div>

                <q-icon
                  name="check"
                  color="primary"
                  size="24px"
                  v-if="item.userKey === nodeDetail?.executor"
                />
                <q-space v-else />
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </q-btn>
      <q-btn flat round icon="o_format_size">
        <q-menu class="row items-center">
          <q-btn flat round icon="format_bold" @click="updateStyle('bold')" />
          <q-btn
            flat
            round
            icon="format_italic"
            @click="updateStyle('italic')"
          />
          <q-btn
            flat
            round
            icon="format_underlined"
            @click="
              updateStyle(
                'textDecoration',
                nodeInfo?.textDecoration ? '' : 'underline'
              )
            "
          />
          <div
            v-for="(item, index) in colorArray"
            :key="`color${index}`"
            class="icon-point q-mr-sm"
            style="width: 23px; height: 23px"
            :style="{ background: item }"
            @click="updateStyle('color', item)"
          ></div>
        </q-menu>
      </q-btn>
      <!-- <q-btn flat round icon="sentiment_satisfied">
        <treeIcon />
      </q-btn> -->
      <!-- <q-btn flat round icon="o_bookmarks" @click="commentVisible = true" /> -->
      <q-btn flat round icon="link">
        <q-menu style="width: 250px">
          <q-card>
            <q-card-section class="full-width">链接</q-card-section>
            <q-card-section class="full-width">
              <q-input
                outlined
                v-model="nodeUrl"
                label="链接地址"
                dense
                class="full-width"
              />
            </q-card-section>
            <q-card-section class="full-width">
              <q-input
                outlined
                v-model="nodeUrlText"
                label="链接名称"
                dense
                class="full-width"
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn label="保存" color="primary" @click="updateUrl" />
            </q-card-actions>
          </q-card>
        </q-menu>
      </q-btn>
      <q-btn flat round icon="o_alternate_email" @click="fileVisible = true" />
      <q-btn flat round icon="o_sell">
        <q-menu>
          <q-list dense>
            <!--  @click="editFile(item._key, index)" -->
            <q-item
              clickable
              v-close-popup
              v-for="(item, index) in tagArray"
              :key="`tag${index}`"
              @click="updateTag(item.value)"
              :style="{ backgroundColor: item.value }"
            >
              <q-item-section class="text-white">{{
                item.label
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn flat round icon="o_calendar_month">
        <q-menu style="width: 250px" auto-close>
          <cCalendar @clickDate="updatemilestone" />
        </q-menu>
      </q-btn>
      <q-btn flat round icon="o_group">
        <q-menu auto-close>
          <q-list>
            <q-item clickable class="row items-center justify-between">
              无
            </q-item>
            <q-item
              v-for="(item, index) in teamMemberList"
              :key="`member${index}`"
              clickable
              class="row items-center justify-between"
            >
              <q-avatar size="24px" class="q-mr-sm">
                <img
                  :src="
                    item?.userAvatar
                      ? item?.userAvatar
                      : '/common/defaultPerson.png'
                  "
                />
              </q-avatar>
              <div class="single-to-long" style="width: 120px">
                {{ item.userName }}
              </div>

              <q-icon
                name="check"
                color="primary"
                size="24px"
                v-if="item.userKey === nodeDetail?.executor"
              />
              <q-space v-else />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
      <!-- <q-btn flat round icon="o_description" /> -->
      <q-btn flat round class="upload-button">
        <q-icon name="o_image" size="28px" />
        <input
          type="file"
          accept="image/*"
          @change="
            //@ts-ignore
            uploadImage($event.target.files[0])
          "
          class="upload-img"
        />
      </q-btn>
    </q-menu>
    <cDrawer
      :visible="commentVisible"
      @close="commentVisible = false"
      :drawerStyle="{ width: '350px' }"
    >
      <template #content>
        <q-card-section class="q-pt-none">备注</q-card-section>
        <q-card-section class="full-width">
          <q-input
            outlined
            v-model="nodeContent"
            placeholder="请输入备注"
            dense
            class="full-width q-mb-md"
            type="textarea"
            @blur="updateContent"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">评论</q-card-section>
        <q-card-section class="q-pt-none">
          <!-- <q-card
          flat
          bordered
          v-for="(item, index) in commentList"
          :key="`space${index}`"
          class="space-item"
        >
          <q-card-section horizontal>
            <q-img
              class="col-2"
              :src="item.logo ? item.logo : '/common/defaultGroup.png'"
            />
            <q-card-section class="col-10">
              <div class="space-content">
                <div class="space-title">
                  <div class="top"></div>
                  <div class="bottom"></div>
                </div>
                <q-icon name="keyboard_arrow_right" size="28px" />
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>

        <q-input
          outlined
          v-model="comment"
          placeholder="请输入评论"
          dense
          class="full-width q-mb-md"
        /> -->
        </q-card-section>
      </template>
    </cDrawer>
    <cDrawer
      :visible="updateVisible"
      @close="updateVisible = false"
      title="更新动态"
      :drawerStyle="{ width: '350px' }"
    >
      <template #content>
        <div class="update-box">
          <template
            v-for="(taskItem, taskIndex) in updateList"
            :key="`taskItem${taskIndex}`"
          >
            <fileCard :card="taskItem" type="task" />
          </template>
        </div>
      </template>
    </cDrawer>
    <cDialog
      :visible="fileVisible"
      title="搜索文件"
      @close="fileVisible = false"
    >
      <template #content>
        <div class="file-search">
          <div class="file-search-title">
            <q-select
              style="width: 150px; margin-right: 10px"
              outlined
              v-model="cardType"
              :options="fileArray"
              dense
              emit-value
              map-options
            />
            <q-input
              outlined
              v-model="fileInput"
              placeholder="搜索用户名或手机号"
              dense
              class="full-width"
              @keyup.enter="searchFile"
              clearable
            />
          </div>
          <div class="file-search-container">
            <template v-if="searchList.length > 0">
              <q-list bordered>
                <q-item
                  v-for="(item, index) in searchList"
                  :key="`search${index}`"
                  class="q-my-sm file-search-item"
                >
                  <q-item-section avatar>
                    <q-icon name="description" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ item.title }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      flat
                      label="链接"
                      color="primary"
                      @click="updateFile(item)"
                      :dense="true"
                      class="file-search-button"
                    />
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
    </cDialog>
    <q-dialog v-model="noteDialog" position="right" class="note-list-dialog">
      <q-card style="width: 350px; height: 100%">
        <NoteList draggable closable @close="noteDialog = false" />
      </q-card>
    </q-dialog>
    <q-dialog v-model="detailDialog">
      <q-card style="width: 80%; height: 100%; max-width: 420px">
        <NoteEditor />
      </q-card>
    </q-dialog>
  </div>
</template>
<style scoped lang="scss">
.teamTree {
  position: relative;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  .teamTree-header {
    width: 100%;
    height: 40px;
    position: absolute;
    z-index: 2;
    top: 20px;
    left: 0px;
    @include flex(space-between, center, null);
    @include p-number(0px, 10px);
    padding-left: 60px;
    .teamTree-header-path {
      height: 100%;
      @include flex(center, center, null);
    }
    .teamTree-header-button {
      @include flex(flex-end, center, null);
    }
  }
  .teamTree-footer {
    height: 70px;
    position: absolute;
    z-index: 2;
    bottom: 20px;
    left: 20px;
    @include flex(space-between, center, null);
    .footer-milestone {
      width: 60px;
      height: 70px;
      margin-right: 8px;
      border: 1px solid $grey-5;
      cursor: pointer;
      position: relative;
      z-index: 1;
      .footer-top {
        width: 100%;
        height: 25px;
        text-align: center;
        color: #fff;
        line-height: 25px;
        font-size: 16px;
      }
      .footer-bottom {
        width: 100%;
        height: 45px;
        text-align: center;
        line-height: 45px;
        font-size: 24px;
      }
    }
  }
  .teamTree-right {
    width: 50px;
    height: calc(100% - 55px);
    position: absolute;
    z-index: 2;
    top: 70px;
    right: 0px;
    align-content: flex-start;
    @include flex(center, center, wrap);
    @include scroll();
  }
}
.update-box {
  width: 100%;
  height: 100%;
}
.file-search {
  width: 500px;
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
<style>
.note-list-dialog > .q-dialog__backdrop {
  display: none;
}
.milestone-menu {
  max-height: 60vh !important;
}
</style>
