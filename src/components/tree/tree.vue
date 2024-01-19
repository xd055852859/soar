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

const { teamMemberList } = storeToRefs(appStore.teamStore);
const CustomTree = applyReactInVue(Tree);

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
const commentVisible = ref<boolean>(false);
const nodeDetail = ref<any>(null);
const nodeInfo = ref<any>(null);
const nodes = ref<any>(null);
const nodeContent = ref<string>("");
const commentList = ref<string>("");
const comment = ref<string>("");
const nodeUrl = ref<string>("");
const nodeUrlText = ref<string>("");
// const imageUrl = ref<string>("");
// const imageHeight = ref<number>(0);
// const imageWidth = ref<number>(0);
const noteDialog = ref(false);

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
  treeRef.value.__veauryReactRef__.updateNode(
    "endAdornmentContent",
    {
      link: { url: nodeUrl.value, text: nodeUrlText.value },
    },
    async (newNodes) => {
      newNodes[newNode._key].endAdornmentContent = {
        link: { url: nodeUrl.value, text: nodeUrlText.value },
      };
      nodeInfo.value.endAdornmentContent = {
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
imageHeight: 134;
imageUrl: "https://cdn-notes.qingtime.cn/24DA2028.svg";
imageWidth: 134;
// const getCommentList=async()=>{
//   let commentRes = (await api.request.get("card/detail", {
//     cardKey: key,
//   })) as ResultProps;
//   if (cardRes.msg === "OK") {
//     cardDetail.value = cardRes.data;
//     rootKey.value = cardRes.data.rootKey;
//     console.log(rootKey.value);
//   }
// }
watch(
  () => props.cardKey,
  (newKey) => {
    getTreeInfo(newKey);
  },
  { immediate: true }
);
</script>
<template>
  <div class="teamTree" id="teamTree">
    <!-- <button :draggable="true">测试</button> -->
    <CustomTree
      ref="treeRef"
      :rootKey="rootKey"
      :viewType="viewType"
      @showMenu="showMenu"
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
      <q-btn flat round icon="format_size">
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
      <!-- <q-btn flat round icon="bookmark" @click="commentVisible = true" /> -->
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
      <q-btn flat round icon="alternate_email" />
      <q-btn flat round icon="sell" />
      <q-btn flat round icon="calendar_month">
        <q-menu style="width: 250px">
          <cCalendar :calendarTimeList="[]" />
        </q-menu>
      </q-btn>
      <q-btn flat round icon="group">
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
      <q-btn flat round icon="description" />
      <q-btn flat round class="upload-button">
        <q-icon name="image" size="28px" />
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
    <cDialog
      :visible="commentVisible"
      @close="commentVisible = false"
      title="备注"
      :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
    >
      <template #content>
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
    </cDialog>
    <q-btn
      class="note-button"
      color="primary"
      size="sm"
      @click="noteDialog = true"
      >速记</q-btn
    >
    <q-dialog v-model="noteDialog" position="right" class="note-list-dialog">
      <q-card style="width: 350px; height: 100%">
        <NoteList draggable closable @close="noteDialog = false" />
      </q-card>
    </q-dialog>
  </div>
</template>
<style scoped lang="scss">
.teamTree {
  position: relative;
  width: 100%;
  height: 100%;
}
.note-button {
  position: absolute;
  top: 15px;
  right: 15px;
}
</style>
<style>
.note-list-dialog > .q-dialog__backdrop {
  display: none;
}
</style>
