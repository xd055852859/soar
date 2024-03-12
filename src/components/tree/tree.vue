<script setup lang="ts">
import { applyReactInVue, applyPureReactInVue } from "veaury";
import Tree from "@/components/react_app/tree.jsx";
import Editor from "@/components/note/Editor.vue";
import { ResultProps } from "@/interface/Common";
import cCalendar from "@/components/common/cCalendar.vue";
import treeIcon from "@/components/tree/treeIcon.vue";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { uploadFile } from "@/services/util/file";
import NoteList from "@/views/home/note/NoteList.vue";
import Icon from "../common/Icon.vue";
import cDrawer from "../common/cDrawer.vue";
import fileCard from "../fileCard/fileCard.vue";
import { startAdornments } from "@/components/common/treesvg.js";
import { tagArray } from "@/services/config/config";
import { setMessage } from "@/services/util/common";
import { formatDocUrl } from "@/services/util/url";
import TreeDetail from "./treeDetail.vue";
const dayjs: any = inject("dayjs");
const CustomTree = applyReactInVue(Tree);
const { token, user } = storeToRefs(appStore.authStore);
const { removeNote } = appStore.noteStore;
const { setSearchVisible, setIframeVisible } = appStore.commonStore;
const {
  teamInfo,
  targetTeamKey,
  targetTeamMemberList,
  teamMemberList,
  teamKey,
} = storeToRefs(appStore.teamStore);
const { setCardKey, setCardVisible } = appStore.cardStore;
const { note } = storeToRefs(appStore.noteStore);
const { clearNoteDetail, getNoteDetail } = appStore.noteStore;

const props = defineProps<{
  cardKey?: string;
}>();
const cardDetail = ref<any>(null);
const treeType = ref<string>("tree");
const treeWidth = ref<number>(0);
const treeHeight = ref<number>(0);
const rootKey = ref<string>("");
const treeRef = ref<any>(null);
const targetEl = ref<any>(null);

const menuVisible = ref<boolean>(false);
const contentVisible = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const executorVisible = ref<boolean>(false);
const iconVisible = ref<boolean>(false);
const iconKey = ref<string>("");
const tagVisible = ref<boolean>(false);
const milestoneVisible = ref<boolean>(false);

const changed = ref(false);
const nodeDetail = ref<any>(null);
const nodeKey = ref<string>("");
const nodeInfo = ref<any>(null);
const nodes = ref<any>(null);
const selectnodes = ref<any>(null);
const selectKeys = computed(() =>
  selectnodes.value.map((item) => {
    return item._key;
  })
);
const nodeContent = ref<any>("");
const editorRef = ref();

const commentVisible = ref<boolean>(false);
const commentList = ref<string>("");
const comment = ref<string>("");

const drawerVisible = ref<boolean>(false);

const pathList = ref<any>([]);

const updateVisible = ref<boolean>(false);
const updateList = ref<any>([]);

const milestoneList = ref<any>([]);
const milestoneTaskList = ref<any>([]);
const showFile = ref<boolean>(false);
const cardType = ref<string>("doc");

const highlightUser = ref<any>(null);
// const imageUrl = ref<string>("");
// const imageHeight = ref<number>(0);
// const imageWidth = ref<number>(0);
const noteDialog = ref(false);

let timeout: any;

onMounted(() => {
  console.log(props.cardKey);
  treeType.value = localStorage.getItem("treeType")
    ? (localStorage.getItem("treeType") as string)
    : "tree";
  window.addEventListener("message", getMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", getMessage);
});
const getMessage = (e) => {
  if (e.data && !e.data.source) {
    const messageData =
      typeof e.data === "string" ? JSON.parse(e.data) : e.data;
    console.log(messageData);
    switch (messageData.eventName) {
      case "changeName":
        // router.push(`/home/taskBoard`);
        nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
        nodes.value[rootKey.value].name = messageData.data;
        treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
        break;
    }
  }
};
const getTreeInfo = async (key) => {
  let cardRes = (await api.request.get("card/detail", {
    cardKey: key,
  })) as ResultProps;
  if (cardRes.msg === "OK") {
    cardDetail.value = cardRes.data;
    rootKey.value = cardRes.data.rootKey;
  }
};
const showMenu = (node, el, type, other?: string) => {
  switch (type) {
    case "menu":
      menuVisible.value = true;
      break;
    case "content":
      contentVisible.value = true;
      break;
    case "executor":
      executorVisible.value = true;
      break;
    case "icon":
      iconVisible.value = true;
      iconKey.value = other!;
      break;
    case "tag":
      console.log(node, el, type);
      tagVisible.value = true;
      break;
    case "milestone":
      console.log(node, el, type);
      milestoneVisible.value = true;
      break;
  }
  targetEl.value = el;
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  nodeKey.value = node._key;
  nodeInfo.value = { ...nodes.value[node._key] };
};
const showDrawer = (key) => {
  drawerVisible.value = true;
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  nodeKey.value = key;
  nodeInfo.value = { ...nodes.value[nodeKey.value] };
};
const updateContent = (title, json) => {
  let newNode = { ...nodeInfo.value };
  treeRef.value.__veauryReactRef__.updateNodeObj(
    { content: json },
    async (newNodes) => {
      newNodes[newNode._key].content = json;
      // nodeContent.value = json;
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      nodes.value = newNodes;
    },
    nodeInfo.value._key
  );
};
const saveContent = () => {
  if (editorRef.value) {
    editorRef.value.handlePost();
  }
};
const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    saveContent();
    changed.value = false;
  }, 2000);
};
const updateExecutor = async (userKey, avatarUri) => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  if (selectnodes.value.length === 0) {
    selectnodes.value = [nodes.value[nodeInfo.value._key]];
  }
  if (selectnodes.value.length > 0) {
    let updateRes = (await api.request.patch("node/executor/batch", {
      nodeKeyArr: selectKeys.value,
      executor: userKey,
    })) as ResultProps;
    if (updateRes.msg === "OK") {
      selectKeys.value.forEach((item) => {
        nodes.value[item].avatarUri = userKey
          ? avatarUri
            ? avatarUri
            : "/common/defaultPerson.png"
          : "";
        nodes.value[item].executor = userKey;
        nodes.value[item].isTask = userKey ? true : false;
        nodes.value[item].showCheckbox = userKey ? true : false;
      });
      console.log(nodes.value);
      treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
    }
  }
  //  else {
  //   let updateRes = (await api.request.patch("node/executor", {
  //     nodeKey: nodeInfo.value._key,
  //     executor: userKey,
  //   })) as ResultProps;
  //   if (updateRes.msg === "OK") {
  //     nodes.value[nodeInfo.value._key].avatarUri = userKey
  //       ? avatarUri
  //         ? avatarUri
  //         : "/common/defaultPerson.png"
  //       : "";
  //     nodes.value[nodeInfo.value._key].executor = userKey;
  //     nodes.value[nodeInfo.value._key].showCheckbox = userKey ? true : false;
  //     nodes.value[nodeInfo.value._key].isTask = userKey ? true : false;
  //     treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
  //   }
  // }
};
const updateFile = async () => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  if (selectnodes.value.length === 0) {
    if (nodeInfo.value._key) {
      nodeKey.value = nodeInfo.value._key;
    } else {
      setMessage("error", "请选择节点");
      return;
    }
  } else {
    setMessage("error", "外链只能单选节点,无法批量操作");
    return;
  }
  setSearchVisible(true, (node) => {
    updateDetail("file", {
      fileKey: node._key,
      fileName: node.name,
    });
    setSearchVisible(false);
  });
  // drawerVisible.value = true;
  // showFile.value = true;
};
const updateIcon = (type, index) => {
  nodeInfo.value = treeRef.value.__veauryReactRef__.getNodeInfo()[0];
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  selectnodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[2];
  if (selectnodes.value.length === 0) {
    selectnodes.value = [nodes.value[nodeInfo.value._key]];
  }
  let obj = {
    [type]: {
      index,
    },
  };
  treeRef.value.__veauryReactRef__.updateNodeBatch(
    {
      startAdornmentContent: {
        ...obj,
      },
    },
    async (newNodes) => {
      selectnodes.value.forEach((item) => {
        newNodes[item._key].startAdornmentContent = setAdornmentContentArr(
          newNodes[item._key],
          "startAdornmentContent",
          obj
        );
        newNodes[item._key] = treeRef.value.__veauryReactRef__.formatNode(
          newNodes[item._key]
        );
      });
      nodes.value = newNodes;
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
    },
    selectKeys.value,
    false
  );
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
//批量操作
const updateMilestones = (date) => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  if (selectnodes.value.length === 0) {
    selectnodes.value = [nodes.value[nodeInfo.value._key]];
  }
  let endTime = dayjs(date).endOf("day").valueOf();
  let obj = {
    milestone: {
      date: endTime,
      month: dayjs(date).month() + 1,
      day: dayjs(date).date(),
    },
  };
  treeRef.value.__veauryReactRef__.updateNodeBatch(
    {
      endTime: endTime,
      startAdornmentContent: {
        ...obj,
      },
    },
    async (newNodes) => {
      selectnodes.value.forEach((item) => {
        newNodes[item._key].endTime = endTime;
        newNodes[item._key].startAdornmentContent = setAdornmentContentArr(
          newNodes[item._key],
          "startAdornmentContent",
          obj
        );
        newNodes[item._key] = treeRef.value.__veauryReactRef__.formatNode(
          newNodes[item._key]
        );
      });
      nodes.value = newNodes;
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      getmilestoneList(props.cardKey);
    },
    selectKeys.value,
    false
  );
};
const updateNoExecutorTask = () => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  let isAllTask = true;
  if (selectnodes.value.length === 0) {
    selectnodes.value = [nodes.value[nodeInfo.value._key]];
  }
  selectnodes.value = selectnodes.value.filter(
    (item) => item._key !== rootKey.value
  );
  selectnodes.value.forEach((item) => {
    if (!nodes.value[item._key].isTask) {
      isAllTask = false;
    }
  });
  console.log(isAllTask);
  if (isAllTask) {
    updateExecutor("", "");
  } else {
    treeRef.value.__veauryReactRef__.updateNodeBatch(
      { isTask: true },
      async (newNodes) => {
        selectnodes.value.forEach((item) => {
          newNodes[item._key].showCheckbox = true;
          newNodes[item._key].isTask = true;
        });
        nodes.value = newNodes;
        treeRef.value.__veauryReactRef__.setNodes(newNodes);
      },
      selectKeys.value
    );
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

const chooseMilestone = async (detail) => {
  let dataRes = (await api.request.get("node/milestone/detail", {
    cardKey: props.cardKey,
    filterDate: detail.time,
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    milestoneTaskList.value = [...dataRes.data];
  }
};

const setAdornmentContent = (node, adornmentContent, obj) => {
  treeRef.value.__veauryReactRef__.updateNodeObj(
    {
      [adornmentContent]: {
        ...node[adornmentContent],
        ...obj,
      },
    },
    async (newNodes) => {
      let adornmentContentObj = {};
      if (newNodes[node._key] && newNodes[node._key][adornmentContent]) {
        adornmentContentObj = {
          ...newNodes[node._key][adornmentContent],
          ...obj,
        };
      } else {
        adornmentContentObj = { ...obj };
      }
      formatAdornmentContent(
        adornmentContent,
        { ...adornmentContentObj },
        node,
        newNodes
      );
    },
    nodeKey.value
  );
};
const clearAdornmentContent = (
  adornmentContent,
  key,
  newNodes,
  callback?: any
) => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  if (selectnodes.value.length === 0) {
    selectnodes.value = [newNodes[nodeInfo.value._key]];
  }
  console.log(selectnodes.value);
  treeRef.value.__veauryReactRef__.clearNodeBatch(
    adornmentContent,
    key,
    async () => {
      selectnodes.value.forEach((item) => {
        delete item[adornmentContent][key];
        newNodes[item._key][adornmentContent] = {
          ...item[adornmentContent],
        };
        console.log(newNodes[item._key][adornmentContent]);
        console.log(newNodes[item._key]);
        newNodes[item._key] = treeRef.value.__veauryReactRef__.formatNode(
          newNodes[item._key]
        );
      });
      nodes.value = newNodes;
      treeRef.value.__veauryReactRef__.setNodes(newNodes);
      if (callback) {
        callback();
      }
    },
    selectKeys.value
  );
};
const formatAdornmentContent = (adornmentContent, obj, node, newNodes) => {
  newNodes[node._key][adornmentContent] = { ...obj };
  nodeInfo.value[adornmentContent] = {
    ...obj,
  };
  newNodes[node._key] = treeRef.value.__veauryReactRef__.formatNode(
    newNodes[node._key]
  );
  nodeInfo.value = treeRef.value.__veauryReactRef__.formatNode(
    newNodes[node._key]
  );
  nodes.value = newNodes;
  console.log(newNodes);
  treeRef.value.__veauryReactRef__.setNodes(newNodes);
};

const setAdornmentContentArr = (node, adornmentContent, obj) => {
  let adornmentContentObj = {};
  if (node && node[adornmentContent]) {
    adornmentContentObj = {
      ...node[adornmentContent],
      ...obj,
    };
  } else {
    adornmentContentObj = { ...obj };
  }
  node[adornmentContent] = {
    ...adornmentContentObj,
  };
  return node[adornmentContent];
};

const chooseHighlight = (type, value) => {
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  switch (type) {
    case "executor":
      for (let key in nodes.value) {
        if (key !== rootKey.value) {
          let node = nodes.value[key];
          let element = document.getElementById(`tree-node-${node._key}`);
          if (value === "all") {
            element!.style.opacity = !node.executor ? "0.6" : "1";
          } else {
            element!.style.opacity = node.executor !== value ? "0.6" : "1";
          }

          // node.color = node.executor === value ? "#fff" : "#fafafa";
          // node.backgroundColor = node.executor === value ? "#07be51" : "#f5f5f5";
        }
      }

      break;
    case "task":
      for (let key in nodes.value) {
        if (key !== rootKey.value) {
          let node = nodes.value[key];
          let element = document.getElementById(`tree-node-${node._key}`);
          element!.style.opacity = node.executor !== value ? "0.6" : "1";
        }
      }
      break;
    case "finish":
      for (let key in nodes.value) {
        if (key !== rootKey.value) {
          let node = nodes.value[key];
          let element = document.getElementById(`tree-node-${node._key}`);
          element!.style.opacity = node.hasDone && node.executor ? "0.6" : "1";
        }
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
      }
      break;
  }
  highlightUser.value = value;
  treeRef.value.__veauryReactRef__.setNodes({ ...nodes.value });
};
const chooseExecutor = (executorDetail) => {
  nodeInfo.value = treeRef.value.__veauryReactRef__.getNodeInfo()[0];
  selectnodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[2];
  if (!nodeInfo.value) {
    setMessage("error", "请选择节点");
    return;
  }
  if (nodeInfo.value._key === rootKey.value) {
    setMessage("error", "不能选择根节点");
    return;
  }
  updateExecutor(executorDetail.userKey, executorDetail.userAvatar);
};

const openAlt = (node) => {
  let fileKey = node.endAdornmentContent.file.fileKey;
  let fileName = node.endAdornmentContent.file.fileName;
  setIframeVisible(true, {
    url: `https://soar.cn/base/#/login?token=${token.value}&redirectPath=node/${fileKey}`,
    title: fileName,
  });
  // setCardKey(fileKey);
  // setCardVisible(true, fileType === "file" ? "file" : "doc");
};
const openFile = (node) => {};

// const openNote = (node) => {
//   clearNoteDetail();
//   getNoteDetail(node.endAdornmentContent.note.key);
// };
//文档
const updateDetail = (type, obj) => {
  nodes.value = treeRef.value.__veauryReactRef__.getNodeInfo()[1];
  nodeInfo.value = { ...nodes.value[nodeKey.value] };
  switch (type) {
    case "name":
      treeRef.value.__veauryReactRef__.updateNode(
        "name",
        obj.name,
        async (newNodes) => {
          newNodes[nodeKey.value].name = obj.name;
          treeRef.value.__veauryReactRef__.setNodes(newNodes);
        },
        nodeKey.value
      );
      break;
    case "hasDone":
      treeRef.value.__veauryReactRef__.updateNode(
        "hasDone",
        obj.hasDone,
        async (newNodes) => {
          newNodes[nodeKey.value].hasDone = obj.hasDone;
          newNodes[nodeKey.value].checked = obj.hasDone;
          treeRef.value.__veauryReactRef__.setNodes(newNodes);
        },
        nodeKey.value
      );
      break;
    case "executor":
      selectnodes.value = [];
      updateExecutor(obj.userKey, obj.userAvatar);
      break;
    case "tag":
      setAdornmentContent(nodeInfo.value, "startAdornmentContent", {
        tag: { label: obj.label, color: obj.color },
      });
      break;
    case "milestone":
      let endTime = dayjs(obj.date).endOf("day").valueOf();
      treeRef.value.__veauryReactRef__.updateNode(
        "endTime",
        endTime,
        async (newNodes) => {
          newNodes[nodeKey.value].endTime = endTime;
          setAdornmentContent(nodeInfo.value, "startAdornmentContent", {
            milestone: {
              date: endTime,
              month: dayjs(obj.date).month() + 1,
              day: dayjs(obj.date).date(),
            },
          });
        },
        nodeKey.value
      );
      break;
    case "content":
      treeRef.value.__veauryReactRef__.updateNodeObj(
        { content: obj.content },
        async (newNodes) => {
          newNodes[nodeKey.value].content = obj.content;
          nodeInfo.value.content = obj.content;
          treeRef.value.__veauryReactRef__.setNodes(newNodes);
          setAdornmentContent(nodeInfo.value, "endAdornmentContent", {
            note: { content: obj.content },
          });
        },
        nodeKey.value
      );
      break;
    case "link":
      setMessage("success", "保存链接成功");
      setAdornmentContent(nodeInfo.value, "endAdornmentContent", {
        link: { url: obj.nodeUrl, text: obj.nodeUrlText },
      });
      break;
    case "file":
      setAdornmentContent(nodeInfo.value, "endAdornmentContent", {
        file: {
          fileKey: obj.fileKey,
          fileType: obj.fileType,
          fileName: obj.fileName,
        },
      });
      break;
    case "relaters":
      treeRef.value.__veauryReactRef__.updateNode(
        "relaters",
        obj.relaters,
        async (newNodes) => {
          newNodes[nodeKey.value].relaters = obj.relaters;
          treeRef.value.__veauryReactRef__.setNodes(newNodes);
        },
        nodeKey.value
      );
      break;
    case "clear":
      delete nodeInfo.value[obj.adornmentContent + "AdornmentContent"][
        obj.type
      ];
      setAdornmentContent(
        nodeInfo.value,
        obj.adornmentContent + "AdornmentContent",
        {}
      );
  }
  // setAdornmentContent(newNode, "endAdornmentContent", {
  //   link: { url: nodeUrl.value, text: nodeUrlText.value },
  // });
};
const clearDetail = (type, key?: string) => {
  [nodeInfo.value, nodes.value, selectnodes.value] =
    treeRef.value.__veauryReactRef__.getNodeInfo();
  if (selectnodes.value.length === 0) {
    selectnodes.value = [nodes.value[nodeInfo.value._key]];
  }
  switch (type) {
    case "icon":
      iconVisible.value = false;
      clearAdornmentContent("startAdornmentContent", key, nodes.value);
      break;
    case "milestone":
      milestoneVisible.value = false;
      treeRef.value.__veauryReactRef__.updateNodeBatch(
        { endTime: null },
        async (newNodes) => {
          selectnodes.value.forEach((item) => {
            newNodes[item._key].endTime = null;
          });
          clearAdornmentContent("startAdornmentContent", type, newNodes, () => {
            getmilestoneList(props.cardKey);
          });
        },
        selectKeys.value
      );
      break;
  }
  // targetEl.value = null;
};
const changeTreeType = (newType) => {
  treeType.value = newType;
  localStorage.setItem("treeType", treeType.value);
};
const changeOutData = (type, data) => {
  switch (type) {
    case "note":
      removeNote(data);
      break;
  }
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

// watch(note, (newVal, oldVal) => {
//   if (newVal && !oldVal) {
//     detailDialog.value = true;
//   }
// });

// watch(detailDialog, (newVal, oldVal) => {
//   if (!newVal) {
//     clearNoteDetail();
//   }
// });
watch(contentVisible, (newVisible) => {
  if (!newVisible) {
    changed.value = false;
    clearTimeout(timeout);
    timeout = null;
  }
});
// watch(
//   () => props.viewType,
//   (newType) => {
//     console.log(newType);
//     treeType.value = newType;
//   },
//   { immediate: true }
// );
</script>
<template>
  <div class="teamTree" id="teamTree">
    <!--     @contextmenu.prevent="menuVisible = false" -->
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
      <div class="teamTree-header-center">
        <q-btn round flat size="sm" class="q-mr-sm">
          <Icon name="a-kuangjia2" :size="16" />
          <q-menu
            anchor="bottom middle"
            self="top middle"
            style="width: 200px"
            auto-close
          >
            <q-btn
              round
              flat
              class="q-mr-sm"
              @click="changeTreeType('mind-single')"
            >
              <Icon name="xiangyou" :size="22"
            /></q-btn>
            <q-btn round flat class="q-mr-sm" @click="changeTreeType('mind')">
              <Icon name="bazhaoyu" :size="22"
            /></q-btn>
            <q-btn round flat class="q-mr-sm" @click="changeTreeType('tree')">
              <Icon name="duolie" :size="22"
            /></q-btn>
            <q-btn
              round
              flat
              class="q-mr-sm"
              @click="changeTreeType('tree-single')"
            >
              <Icon name="a-luojitu1" :size="22"
            /></q-btn>
          </q-menu>
        </q-btn>
        <q-separator vertical />
        <q-btn
          round
          flat
          size="sm"
          class="q-mx-xs"
          @click="updateNoExecutorTask"
        >
          <Icon name="a-xuanzhong2" :size="16" />
        </q-btn>
        <q-btn
          round
          flat
          size="sm"
          class="q-mx-xs"
          @click="memberVisible = !memberVisible"
        >
          <Icon name="a-renyuan2" :size="16" />
        </q-btn>
        <q-btn round flat size="sm" class="q-mx-xs">
          <Icon name="a-biaoqing22" :size="16" />
          <treeIcon @clickIcon="updateIcon" />
        </q-btn>
        <q-btn round flat size="sm" class="q-mx-xs">
          <Icon name="a-rili2" :size="16" />
          <q-menu style="width: 290px">
            <c-calendar
              @clickDate="updateMilestones"
              @clearDate="clearDetail('milestone')"
            />
          </q-menu>
        </q-btn>

        <q-btn round flat size="sm" class="q-mx-xs" @click="updateFile">
          <Icon name="a-2" :size="16" />
        </q-btn>
      </div>
      <div class="teamTree-header-button">
        <template v-if="highlightUser">
          <template v-if="highlightUser === 'all'">全部任务</template>
          <template v-else-if="highlightUser === 'unfinish'"
            >隐藏已完成</template
          >
          <template v-else
            ><q-avatar color="#fff" size="22px" class="q-mr-sm">
              <img
                :src="
                  highlightUser.userAvatar
                    ? highlightUser.userAvatar
                    : '/common/defaultPerson.png'
                "
              />
            </q-avatar>
            {{ highlightUser.userName }}
          </template>
          <img
            src="/close.svg"
            class="q-ml-sm icon-point"
            style="width: 15px; height: 15px"
            alt=""
            @click="chooseHighlight('clear', null)"
          />
        </template>

        <q-btn flat round size="12px">
          <Icon name="a-guolv2" :size="16" />
          <q-menu auto-close class="q-pa-sm" style="width: 250px">
            <q-list>
              <q-item clickable @click="chooseHighlight('executor', 'all')">
                <q-item-section class="common-title">全部任务</q-item-section>
              </q-item>
              <q-item
                v-for="(item, index) in teamMemberList"
                :key="`filter${index}`"
                clickable
                @click="chooseHighlight('executor', item)"
              >
                <q-item-section avatar>
                  <!--  @click="editFile(item._key, index)" -->
                  <q-avatar color="#fff" size="35px" class="q-mb-sm">
                    <img
                      :src="
                        item.userAvatar
                          ? item.userAvatar
                          : '/common/defaultPerson.png'
                      "
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{ item.userName }}
                  {{
                    item.userKey === user?._key ? "(我)" : ""
                  }}</q-item-section
                >
                <q-item-section
                  side
                  v-if="highlightUser?.userKey === item.userKey"
                >
                  <q-icon name="check" color="primary" size="24px" />
                </q-item-section>
                <q-space v-else />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- <q-btn flat round size="12px" @click="noteDialog = true">
          <Icon name="a-suji22" :size="20" />
        </q-btn> -->
        <!-- <q-btn flat round icon="o_update" @click="updateVisible = true" /> -->
        <q-btn flat round size="12px" @click.stop="">
          <Icon name="gengduo" :size="18" />
          <q-menu class="q-pa-sm">
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <q-item
                clickable
                v-close-popup
                @click="
                  chooseHighlight(
                    highlightUser === 'unfinish' ? 'clear' : 'finish',
                    highlightUser === 'unfinish' ? null : 'unfinish'
                  )
                "
              >
                <q-item-section class="common-title">{{
                  highlightUser === "unfinish" ? "显示已完成" : "隐藏已完成"
                }}</q-item-section>
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
            <fileCard :card="taskItem" type="taskBox" />
          </template>
        </q-menu>
      </div>
    </div>
    <div class="teamTree-right" v-if="memberVisible">
      <div class="teamTree-right-title">执行人</div>
      <div class="teamTree-right-box">
        <div
          class="icon-point"
          v-for="(item, index) in teamMemberList"
          :key="`task${index}`"
          @click.stop="chooseExecutor(item)"
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

          <q-avatar color="#fff" size="35px" class="q-mb-sm">
            <img
              :src="
                item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
              "
            />
          </q-avatar>
          <div class="teamTree-right-name single-to-long">
            {{ item.userName }}
          </div>
          <!-- </q-circular-progress> -->
        </div>
      </div>
    </div>
    <CustomTree
      ref="treeRef"
      :rootKey="rootKey"
      :viewType="treeType"
      :drawerVisible="drawerVisible"
      @showMenu="showMenu"
      @showDrawer="showDrawer"
      @closeMenu="menuVisible = false"
      @changePath="changePath"
      @openAlt="openAlt"
      @openFile="openFile"
      @changeOutData="changeOutData"
    />
    <!-- 编辑器 -->
    <q-menu
      :target="targetEl"
      v-model="contentVisible"
      anchor="bottom middle"
      self="top middle"
    >
      <!-- <q-card-section style="font-size: 18px;font-weight: bold;">备注</q-card-section> -->
      <div class="node-editor">
        <span v-if="nodeInfo" class="node-save">{{
          changed ? "有变更" : "已保存"
        }}</span>
        <Editor
          v-if="nodeInfo"
          ref="editorRef"
          :initData="nodeInfo"
          :autoSave="true"
          @onChange="handleChange"
          :handleSave="updateContent"
        />
      </div>
    </q-menu>
    <q-menu
      :target="targetEl"
      v-model="executorVisible"
      anchor="bottom middle"
      self="top middle"
    >
      <q-list>
        <q-item
          v-for="(item, index) in teamMemberList"
          :key="`filter${index}`"
          clickable
          @click.stop="chooseExecutor(item)"
        >
          <q-item-section>
            <!--  @click="editFile(item._key, index)" -->
            <q-avatar color="#fff" size="30px">
              <img
                :src="
                  item.userAvatar
                    ? item.userAvatar
                    : '/common/defaultPerson.png'
                "
              />
            </q-avatar>
          </q-item-section>
          <q-tooltip class="text-body2" :offset="[10, 10]">
            {{ item.userName }}
          </q-tooltip>
        </q-item>
      </q-list>
    </q-menu>
    <q-menu
      :target="targetEl"
      v-model="iconVisible"
      anchor="bottom middle"
      self="top middle"
    >
      <q-card>
        <q-card-section class="q-pa-sm">
          <q-btn
            flat
            round
            v-for="(item, index) in startAdornments[iconKey]"
            :key="`${iconKey}${index}`"
            @click="updateIcon(iconKey, index)"
          >
            <svg
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              style="margin: 5px"
            >
              <rect
                x="0"
                y="0"
                width="1024"
                height="1024"
                fill-opacity="0"
              ></rect>
              <g v-html="item"></g>
            </svg>
          </q-btn>
          <q-btn
            flat
            round
            key="delIcon"
            @click="
              iconVisible = false;
              clearDetail('icon', iconKey);
            "
          >
            <Icon name="huishouzhan" :size="20" />
          </q-btn>
        </q-card-section>
      </q-card>
    </q-menu>
    <q-menu
      :target="targetEl"
      v-model="tagVisible"
      anchor="bottom middle"
      self="top middle"
    >
      <q-list dense>
        <!--  @click="editFile(item._key, index)" -->
        <!-- @click="updateTag(item.value)" -->
        <q-item
          clickable
          v-close-popup
          :style="{ backgroundColor: '#fff' }"
          @click="
            updateDetail('clear', {
              type: 'tag',
              adornmentContent: 'start',
            })
          "
        >
          <q-item-section>无</q-item-section>
        </q-item>
        <q-item
          clickable
          v-close-popup
          v-for="(item, index) in tagArray"
          :key="`tag${index}`"
          :style="{ backgroundColor: item.value }"
          @click="
            updateDetail('tag', {
              label: item.label,
              color: item.value,
            })
          "
        >
          <q-item-section class="text-white">{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <q-menu
      :target="targetEl"
      v-model="milestoneVisible"
      anchor="bottom middle"
      self="top middle"
      style="width: 290px"
    >
      <c-calendar
        :endTime="nodeInfo.endTime"
        @clickDate="updateMilestones"
        @clearDate="clearDetail('milestone')"
      />
    </q-menu>

    <c-drawer
      :visible="commentVisible"
      @close="commentVisible = false"
      :drawerStyle="{ width: '350px' }"
    >
      <template #content>
        <q-card-section style="font-size: 18px; font-weight: bold"
          >备注</q-card-section
        >
        <q-card-section class="full-width">
          <q-input
            outlined
            v-model="nodeContent"
            placeholder="请输入备注"
            dense
            class="full-width q-mb-md"
            type="textarea"
          />
          <!--             @blur="updateContent" -->
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
    </c-drawer>
    <!-- <c-drawer
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
    </c-drawer> -->
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
          :nodeKey="nodeKey"
          :nodeInfo="nodeInfo"
          :showFile="showFile"
          @updateDetail="updateDetail"
          @close="drawerVisible = false"
          v-if="nodeKey"
        />
      </template>
    </c-drawer>
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
  z-index: 3;
  .teamTree-header {
    width: 100%;
    height: 40px;
    position: absolute;
    z-index: 2;
    top: 10px;
    left: 0px;
    @include flex(space-between, center, null);
    @include p-number(0px, 10px);
    padding-left: 60px;
    .teamTree-header-path {
      height: 100%;
      font-size: 16px;
      @include flex(center, center, null);
    }
    .teamTree-header-center {
      width: 260px;
      height: 100%;
      border: 1px solid rgba(151, 151, 151, 0.34);
      border-radius: 8px;
      position: absolute;
      z-index: 2;
      left: calc(50% - 130px);
      top: 0px;
      background-color: #fff;
      @include flex(space-between, center, null);
      @include p-number(10px, 15px);
    }
    .teamTree-header-button {
      @include flex(flex-end, center, null);
    }
  }

  .teamTree-footer {
    height: 70px;
    position: absolute;
    z-index: 2;
    bottom: 25px;
    left: 90px;
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
        height: 40px;
        text-align: center;
        line-height: 40px;
        font-size: 24px;
        background-color: #fff;
      }
    }
  }
  .teamTree-right {
    /* prettier-ignore */
    width: 60px;
    height: 85%;
    position: absolute;
    z-index: 2;
    bottom: 0px;
    left: 0px;
    color: #7c84a0;
    align-content: flex-start;
    border-top: 1px solid #c7cdd5;
    border-right: 1px solid #c7cdd5;
    border-top-right-radius: 12px;
    background-color: #fff;
    @include p-number(10px, 0px);
    @include flex(center, center, wrap);

    .teamTree-right-title {
      margin: 10px 0px;
      font-size: 16px;
      font-weight: bolder;
    }
    .teamTree-right-box {
      height: calc(100% - 40px);
      @include scroll();
      > div {
        @include flex(center, center, wrap);
      }
    }
    .teamTree-right-name {
      text-align: center;
      margin-bottom: 10px;
    }
  }
}
.update-box {
  width: 100%;
  height: 100%;
}

.node-editor {
  min-width: 350px;
  max-height: 250px;
  position: relative;
  z-index: 1;
  @include scroll();
  .node-save {
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 10px;
    color: $grey-5;
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
