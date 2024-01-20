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
const CustomTree = applyReactInVue(Tree);
const { teamMemberList } = storeToRefs(appStore.teamStore);
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
  treeRef.value.__veauryReactRef__.updateNodeObj(
    {
      endAdornmentContent: {
        ...newNode.endAdornmentContent,
        link: { url: nodeUrl.value, text: nodeUrlText.value },
      },
    },
    async (newNodes) => {
      newNodes[newNode._key].endAdornmentContent = {
        ...newNodes[newNode._key].endAdornmentContent,
        link: { url: nodeUrl.value, text: nodeUrlText.value },
      };
      nodeInfo.value.endAdornmentContent = {
        ...nodeInfo.value.endAdornmentContent,
        link: { url: nodeUrl.value, text: nodeUrlText.value },
      };
      newNodes[newNode._key] = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[newNode._key]
      );
      nodeInfo.value = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[newNode._key]
      );
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
    },
    nodeInfo.value._key
  );

  // endAdornmentHeight
  // :
  // 18
  // endAdornmentWidth
  // :
  // 20
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
const getmilestoneList = async (newKey) => {
  let dataRes = (await api.request.get("node/milestone", {
    cardKey: newKey,
    startTime: dayjs().subtract(90, "day").startOf("day").valueOf(),
    endTime: dayjs().valueOf(),
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    milestoneList.value = dataRes.data.map((item) => {
      [item.year, item.month, item.day] = item.ctime.split("-");
      item.time = dayjs(item.ctime).endOf("day").valueOf();
      item.bgColor =
        dayjs(item.ctime).endOf("day").valueOf() <
        dayjs().endOf("day").valueOf()
          ? "#07be51"
          : "#f44336";
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
      treeRef.value.__veauryReactRef__.updateNodeObj(
        {
          endAdornmentContent: {
            ...newNode.endAdornmentContent,
            milestone: {},
          },
        },
        async (newNodes) => {
          newNodes[newNode._key].endAdornmentContent = {
            ...newNodes[newNode._key].endAdornmentContent,
            milestone: {},
          };
          nodeInfo.value.endAdornmentContent = {
            ...nodeInfo.value.endAdornmentContent,
            milestone: {},
          };
          newNodes[newNode._key] = treeRef.value.__veauryReactRef__.formatNode(
            newNodes[newNode._key]
          );
          nodeInfo.value = treeRef.value.__veauryReactRef__.formatNode(
            newNodes[newNode._key]
          );
          treeRef.value.__veauryReactRef__.setNodes(newNodes);
        },
        nodeInfo.value._key
      );
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
const searchFile = async () => {};
const updateFile = (detail) => {
  let newNode = { ...nodeInfo.value };
  treeRef.value.__veauryReactRef__.updateNodeObj(
    {
      endAdornmentContent: {
        ...newNode.endAdornmentContent,
        file: { fileKey: detail._key },
      },
    },
    async (newNodes) => {
      newNodes[newNode._key].endAdornmentContent = {
        ...newNodes[newNode._key].endAdornmentContent,
        file: { fileKey: detail._key },
      };
      nodeInfo.value.endAdornmentContent = {
        ...nodeInfo.value.endAdornmentContent,
        file: { fileKey: detail._key },
      };
      newNodes[newNode._key] = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[newNode._key]
      );
      nodeInfo.value = treeRef.value.__veauryReactRef__.formatNode(
        newNodes[newNode._key]
      );
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      fileVisible.value = false;
    },
    nodeInfo.value._key
  );
};
const openAlt = (node) => {
  let fileKey = node.endAdornmentContent.file.fileKey;
  setCardKey(fileKey);
  setCardVisible(
    true,
    node.endAdornmentContent.file.fileType,
    node.endAdornmentContent.url
  );
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
  <div class="teamTree" id="teamTree">
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
          <Icon name="a-suji2" :size="22" />
        </q-btn>
        <q-btn flat round icon="o_update" @click="updateVisible = true" />
      </div>
    </div>
    <div class="teamTree-footer">
      <div
        class="footer-milestone"
        v-for="(item, index) in milestoneList"
        :key="`milestone${index}`"
        @click="chooseMilestone(item)"
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
      <q-btn flat round icon="o_alternate_email" />
      <q-btn flat round icon="o_sell" />
      <q-btn flat round icon="o_calendar_month">
        <q-menu style="width: 250px">
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
        <div class="member-search">
          <div class="member-search-title">
            <q-input
              rounded
              outlined
              v-model="fileInput"
              placeholder="搜索用户名或手机号"
              dense
              class="full-width"
              @keyup.enter="searchFile"
              clearable
            />
          </div>
          <div class="member-search-container">
            <template v-if="searchList.length > 0">
              <div
                class="member-search-item"
                v-for="(item, index) in searchList"
                :key="`search${index}`"
              >
                <div class="member-search-left">
                  <q-avatar color="primary" text-color="white" size="lg">
                    <img
                      :src="
                        item.userAvatar
                          ? item.row.userAvatar
                          : '/common/defaultPerson.png'
                      "
                    />
                  </q-avatar>
                  <div>{{ item.userName }}</div>
                </div>
                <div class="member-search-right">
                  <q-btn
                    flat
                    label="链接"
                    color="primary"
                    @click="updateFile(item)"
                    :dense="true"
                  />
                </div>
              </div>
            </template>
            <div class="dp-center-center" :style="{ height: '100%' }" v-else>
              未搜索到尚未加入该空间的系统用户
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
      margin-right: 5px;
      border: 1px solid $grey-5;
      cursor: pointer;
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
}
.update-box {
  width: 100%;
  height: 100%;
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
