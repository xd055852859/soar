import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
} from "react";
import { Mind, Tree } from "tree-graph-react";
import _ from "lodash";
import "tree-graph-react/dist/tree-graph-react.cjs.development.css";
import api from "@/services/api";
import Moveable from "./moveable";
import { Dialog } from "quasar";
import { setMessage } from "@/services/util/common";
import { getStartAdornment, getEndAdornment } from "./treesvg";
// const nodes = {
//   "001": {
//     _key: "001",
//     name: "项目管理",
//     father: "",
//     sortList: ["002", "003", "004", "005"],
//     contract: false,
//     avatarUri: "https://psnine.com/Upload/game/11387.png",
//     icon: "https://cdn-icare.qingtime.cn/rooter.svg",
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "002": {
//     _key: "002",
//     name: "计划进度",
//     father: "001",
//     sortList: ["006", "007"],
//     contract: false,
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//     icon: "https://cdn-icare.qingtime.cn/docFolder.svg",
//   },
//   "003": {
//     _key: "003",
//     name: "项目状态",
//     father: "001",
//     sortList: ["010", "011"],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//     icon: "https://cdn-icare.qingtime.cn/favFolder.svg",
//   },
//   "004": {
//     _key: "004",
//     name: "项目会议",
//     father: "001",
//     sortList: [],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "005": {
//     _key: "005",
//     name: "验收",
//     father: "001",
//     sortList: [],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "006": {
//     _key: "006",
//     name: "阶段壹",
//     father: "002",
//     contract: false,
//     sortList: ["008", "009"],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "007": {
//     _key: "007",
//     name: "阶段二",
//     father: "002",
//     sortList: [],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "008": {
//     _key: "008",
//     name: "备份json文件",
//     father: "006",
//     sortList: [],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "009": {
//     _key: "009",
//     name: "还原数据",
//     father: "006",
//     sortList: ["015"],
//     checked: false,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "010": {
//     _key: "010",
//     name: "4月计划",
//     father: "003",
//     sortList: [],
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "011": {
//     _key: "011",
//     name: "5月计划",
//     father: "003",
//     sortList: ["012", "013", "014"],
//     contract: false,
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "012": {
//     _key: "012",
//     name: "原型、界面设计",
//     father: "011",
//     sortList: [],
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "013": {
//     _key: "013",
//     name: "开发",
//     father: "011",
//     sortList: [],
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "014": {
//     _key: "014",
//     name: "测试",
//     father: "011",
//     sortList: [],
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
//   "015": {
//     _key: "015",
//     name: "还原数据-还原数据",
//     father: "009",
//     sortList: [],
//     checked: true,
//     hour: 0.1,
//     limitDay: 1610726400000,
//   },
// };
const CustomTree = React.forwardRef((props, ref) => {
  const { rootKey, zoomRatio, viewType, showMenu } = props;
  const treeRef = useRef(null);
  const moveRef = useRef(null);
  const [nodes, setNodes] = useState(null);
  const [startId, setStartId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [moreState, setMoreState] = useState("");

  useEffect(() => {
    if (rootKey) {
      setStartId(rootKey);
      getNodeList(rootKey);
    }
  }, [rootKey]);

  const getNodeList = async (key, type) => {
    let dataRes = await api.request.get("node/tree", {
      nodeKey: key,
    });
    if (dataRes.msg === "OK") {
      for (let key in dataRes.data) {
        let value = dataRes.data[key];
        if (value.executor) {
          value.showCheckbox = true;
          if (!value.avatarUri) {
            value.avatarUri = "/common/defaultPerson.png";
          }
        }
        value.checked = value.hasDone;
        value = formatNode(value);
      }
      if (type === "child") {
        setNodes({ ...nodes, ...dataRes.data });
      } else {
        setNodes(dataRes.data);
        // dispatch(setStartId(nodeKey));
      }
    }
  };
  const formatNode = (node) => {
    if (node.startAdornmentContent) {
      node.startAdornment = getStartAdornment(
        item.startAdornmentContent,
        handleClickNodeIcon
      );
      node.startAdornmentWidth =
        Object.keys(node.startAdornmentContent).length * (18 + 2);
      node.startAdornmentHeight = 18;
    }
    if (node.endAdornmentContent) {
      node.endAdornment = getEndAdornment(
        node.endAdornmentContent,
        {
          note: handleOpenNote,
          link: handleOpenLink,
        },
        node
      );
      node.endAdornmentWidth =
        Object.keys(node.endAdornmentContent).length * (18 + 2);
      node.endAdornmentHeight = 18;
    }
    return node;
  };
  const getNodePath = async (nodeKey, startNodeKey, includeStartNodeKey) => {
    let pathRes = await api.request.get("node/way", {
      nodeKey: nodeKey,
      startNodeKey: startNodeKey,
      includeStartNodeKey: includeStartNodeKey,
    });
    if (pathRes.msg === "OK") {
      setSelectedPath(pathRes.data);
    }
  };
  const editNodeText = async (nodeId, text) => {
    setSelectedId(nodeId);
    if (text.trim() === "") {
      text = "新节点";
    }
    updateNode(
      "name",
      text,
      (newNodes) => {
        newNodes[nodeId].name = text;
        setNodes(newNodes);
      },
      nodeId
    );
  };
  const clickDot = (node) => {
    // setStartId(node._key);
    getNodeList(node._key);
    setStartId(node._key);
    setSelectedId(node._key);
    // getNodePath(node._key, boardDetail?.rootKey, true);
    moveRef.current.reset();
  };
  const chooseNode = (node) => {
    if (node) {
      setSelectedNode(node);
      setSelectedId(node._key);
      // if (type === 1) {
      //   treeRef.current.rename();
      // }
    } else {
      setSelectedNode(null);
      setSelectedId("");
      setSelectedNodes([]);
    }
  };
  const addNode = async (nodeId, type) => {
    setSelectedId(nodeId);
    let newNodes = _.cloneDeep(nodes);
    if (type === "next" && rootKey === nodeId) {
      setMessage("error", "根结点不能新建同级节点");
      return;
    }
    let fatherKey = "";
    if (type === "child") {
      fatherKey = nodeId;
    } else {
      console.log(newNodes[nodeId]);
      if (newNodes[nodeId] && newNodes[nodeId].father) {
        fatherKey = newNodes[nodeId].father;
      } else {
        return;
      }
    }
    let addTaskRes = await api.request.post("node", {
      nodeKey: nodeId,
      fatherKey: fatherKey,
      addType: type,
    });
    if (addTaskRes.msg === "OK") {
      newNodes[fatherKey].sortList.push(addTaskRes.data._key);
      newNodes[addTaskRes.data._key] = { ...addTaskRes.data };
      setNodes(newNodes);
      chooseNode(addTaskRes.data, 1);
    }
  };
  const updateNode = async (key, value, callback, nodeKey) => {
    console.log(selectedId);
    let newNodes = _.cloneDeep(nodes);
    let updateRes = await api.request.patch("node", {
      nodeKey: nodeKey ? nodeKey : selectedId,
      [key]: value,
    });
    if (updateRes.msg === "OK") {
      callback(newNodes);
      if (key == "status" && value === 0) {
        chooseNode(null);
      } else {
        setSelectedNode({
          ...selectedNode,
          [key]: value,
        });
      }
    }
  };
  const updateNodeObj = async (obj, callback, nodeKey) => {
    console.log(selectedId);
    let newNodes = _.cloneDeep(nodes);
    let updateRes = await api.request.patch("node/more", {
      nodeKey: nodeKey ? nodeKey : selectedId,
      obj: { ...obj },
    });
    if (updateRes.msg === "OK") {
      callback(newNodes);
      if (key == "status" && value === 0) {
        chooseNode(null);
      } else {
        setSelectedNode({
          ...selectedNode,
          ...obj,
        });
      }
    }
  };
  const deleteNode = async () => {
    if (selectedId) {
      if (selectedId === rootKey) {
        setMessage("error", "根节点不允许删除");
        return;
      }
      Dialog.create({
        title: "删除节点",
        message: "是否删除该节点",
        cancel: {
          color: "grey-5",
          flat: true,
        },
      }).onOk(async () => {
        updateNode("status", 0, (newNodes) => {
          setMessage("success", "删除成功");
          let fatherKey = newNodes[selectedId].father;
          let index = newNodes[fatherKey].sortList.findIndex(
            (item) => item === selectedId
          );
          console.log(index);
          if (index !== -1) {
            newNodes[fatherKey].sortList.splice(index, 1);
          }
          delete newNodes[selectedId];
          console.log(newNodes);
          setNodes(newNodes);
        });
      });
    }
  };
  const dragNode = async (dragInfo) => {
    console.log(dragInfo);
    let newNodes = _.cloneDeep(nodes);
    let nodeKey = dragInfo.dragNodeId;
    let oldFatherKey = newNodes[nodeKey].father;
    let fatherKey = newNodes[dragInfo.dropNodeId].father;

    if (dragInfo.placement === "in") {
      fatherKey = dragInfo.dropNodeId;
      newNodes[dragInfo.dropNodeId].sortList.push(dragInfo.dragNodeId);
    } else if (fatherKey) {
      let nodeIndex = newNodes[fatherKey].sortList.indexOf(dragInfo.dropNodeId);
      let childrenIndex =
        dragInfo.placement === "up" ? nodeIndex : nodeIndex + 1;
      console.log(childrenIndex);
      newNodes[fatherKey].sortList.splice(
        childrenIndex,
        0,
        dragInfo.dragNodeId
      );
    }
    let index = newNodes[oldFatherKey].sortList.indexOf(nodeKey);
    if (index !== -1) {
      newNodes[oldFatherKey].sortList.splice(index, 1);
    }
    newNodes[nodeKey].father = fatherKey;
    console.log(newNodes);
    let dragRes = await api.request.patch("node/drag", {
      nodeKey: nodeKey,
      targetNodeKey: dragInfo.dropNodeId,
      placement: dragInfo.placement,
    });
    if (dragRes.msg === "OK") {
      setNodes(newNodes);
    }
  };
  //黏贴剪切节点
  const pasteNode = async (pasteNodeKey, pasteType, targetNodeKey) => {
    if (pasteType === "copy") {
      let copyRes = await api.request.post("node/copy", {
        nodeKey: pasteNodeKey,
        fatherId: targetNodeKey,
      });
      if (copyRes.msg === "OK") {
        getNodeList(targetNodeKey, "child");
      }
    } else if (pasteType === "cut") {
      dragNode({
        dragNodeId: pasteNodeKey,
        dropNodeId: targetNodeKey,
        placement: "in",
      });
    }
  };
  //完成任务
  const editFinishPercent = async (node) => {
    let newNodes = _.cloneDeep(nodes);
    let dataRes = await api.request.patch("node/finish", {
      nodeKey: node._key,
      hasDone: !newNodes[node._key].hasDone,
    });
    console.log(dataRes);
    if (dataRes.msg === "OK") {
      newNodes[node._key].hasDone = !newNodes[node._key].hasDone;
      newNodes[node._key].checked = newNodes[node._key].hasDone;
      setNodes(newNodes);
    }
  };
  //收缩节点
  const editContract = async (node) => {
    console.log(node);
    updateNode(
      "contract",
      !node.contract,
      async (newNodes) => {
        newNodes[node._key].contract = !node.contract;
        setNodes(newNodes);
      },
      node._key
    );
  };
  //上下顺序
  const editSortList = async (nodeId, sortList) => {
    updateNode(
      "sortList",
      sortList,
      (newNodes) => {
        newNodes[newNodes[nodeId].father].sortList = sortList;
        setNodes(newNodes);
      },
      nodes[nodeId].father
    );
  };

  // 插槽功能
  const handleClickNodeIcon = () => {};
  const handleOpenNote = () => {};
  const handleOpenLink = (node, nodeId) => {
    let url = node.endAdornmentContent.link.url;
    let linkUrl = "";
    if (url.includes("http://") || url.includes("https://")) {
      linkUrl = url;
    } else {
      linkUrl = `https://${url}`;
    }
    window.open(linkUrl);
    // console.log(nodes[nodeId].endAdornmentContent);
  };
  //修改图片大小
  const handleResizeNodeImage = (nodeId, nodeWidth) => {
    updateNodeObj(
      { imageWidth: nodeWidth },
      async (newNodes) => {
        newNodes[nodeId] = { ...newNodes[nodeId], imageWidth: nodeWidth };
        setNodes(newNodes);
      },
      nodeId
    );
  };
  //外部拖入
  const dragEndFromOutside = (node) => {
    console.log(node);
  };
  //获取内部数据
  const getNodeInfo = () => {
    return [selectedNode, nodes];
  };
  const tree = useMemo(() => {
    // if (rootKey && card?.content && card.content[rootKey]) {
    // console.log(props);
    if (nodes) {
      if (viewType.includes("tree")) {
        return (
          <Tree
            ref={treeRef}
            startId={startId}
            nodes={nodes}
            showIcon={true}
            showAvatar={true}
            showChildNum={true}
            uncontrolled={false}
            defaultSelectedId={selectedId || undefined}
            handleChangeNodeText={editNodeText}
            handleClickDot={clickDot}
            singleColumn={viewType.includes("-single")}
            // singleColumn={viewType.startsWith("single-")}
            // itemHeight={48}
            // pathWidth={2}
            // pathColor={darkMode ? "#FFF" : "#535953"}
            // nodeColor={"#e3e3e3"}
            // hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
            // paddingLeft={1000}
            // paddingTop={1000}
            handleCheck={editFinishPercent}
            handleClickExpand={editContract}
            handleShiftUpDown={editSortList}
            handleClickNode={chooseNode}
            handleDrag={dragNode}
            handleAddChild={(selectedNode) => {
              addNode(selectedNode, "child");
            }}
            handleAddNext={(selectedNode) => {
              addNode(selectedNode, "next");
            }}
            handleContextMenu={(selectedNode, e) => {
              setSelectedId(selectedNode);
              props.onShowMenu(nodes[selectedNode], e.target);
            }}
            handleDeleteNode={deleteNode}
            handlePaste={pasteNode}
            handleResizeNodeImage={handleResizeNodeImage}
            dragEndFromOutside={dragEndFromOutside}
          />
        );
      } else {
        return (
          <Mind
            ref={treeRef}
            singleColumn={viewType.includes("-single")}
            startId={startId}
            nodes={nodes}
            showIcon={true}
            showAvatar={true}
            showChildNum={true}
            uncontrolled={false}
            handleChangeNodeText={editNodeText}
            // defaultSelectedId={nextSelectKey || selectedKey || undefined}
            defaultSelectedId={selectedId || undefined}
            handleCheck={editFinishPercent}
            handleClickDot={clickDot}
            handleClickExpand={editContract}
            handleShiftUpDown={editSortList}
            handleClickNode={chooseNode}
            handleDrag={dragNode}
            handleAddChild={(selectedNode) => {
              addNode(selectedNode, "child");
            }}
            handleAddNext={(selectedNode) => {
              addNode(selectedNode, "next");
            }}
            handleContextMenu={(selectedNode, e) => {
              setSelectedId(selectedNode);
              props.onShowMenu(nodes[selectedNode], e.target);
            }}
            handleDeleteNode={deleteNode}
            handlePaste={pasteNode}
            handleResizeNodeImage={handleResizeNodeImage}
            dragEndFromOutside={dragEndFromOutside}
          />
        );
      }
    } else {
      return <div></div>;
    }
  }, [startId, selectedId, nodes]);
  useImperativeHandle(ref, () => ({
    addNode,
    updateNode,
    updateNodeObj,
    setNodes,
    getNodeInfo,
    formatNode,
    // handleAddNext,
    // handleDelete,
    // resetMove,
    // getSelectedIds: () => treeRef.current.getSelectedIds(),
    // getNodes: () => treeRef.current.saveNodes(),
    // updateNodesByIds: (nodes: NodeMap, ids: string[], data: any) => {
    //   treeRef?.current?.updateNodesByIds(nodes, ids, data);
    // },
    // clearSelectedNodes: () => {
    //   treeRef?.current.setselectedId("");
    //   treeRef?.current.setSelectedNodes([]);
    // },
    // exportImage: (type: "svg" | "png" | "pdf") => {
    //   treeRef?.current.exportImage(type);
    // },
  }));
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Moveable
        ref={moveRef}
        scrollable={true}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "absolute",
          left: 0,
          top: 0,
        }}
        rightClickToStart={true}
      >
        <div>{tree}</div>
      </Moveable>
    </div>
  );
});
export default CustomTree;
