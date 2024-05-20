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
import {
  getStartAdornment,
  getEndAdornment,
  getBottomAdornment,
  getCustmAdornment,
} from "./treesvg";
import "./tree.scss";
import dayjs from "dayjs";
const CustomTree = React.forwardRef((props, ref) => {
  const {
    rootKey,
    zoomRatio,
    viewType,
    onShowMenu,
    onShowDrawer,
    onChangePath,
    onOpenAlt,
    onOpenFile,
    onCloseMenu,
    drawerVisible,
    onChangeOutData,
    onOutGetNode,
  } = props;
  const treeRef = useRef(null);
  const moveRef = useRef(null);
  const [nodes, setNodes] = useState(null);
  const [startId, setStartId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState(null);
  const [parseState, setParseState] = useState(false);
  useEffect(() => {
    if (rootKey) {
      setStartId(rootKey);
      getNodeList(rootKey);
    }
  }, [rootKey]);
  useEffect(() => {
    if (startId) {
      onChangePath(startId, rootKey, true);
    }
  }, [startId]);

  const getNodeList = async (key, type) => {
    let dataRes = await api.request.get("node/tree", {
      nodeKey: key,
    });
    if (dataRes.msg === "OK") {
      for (let key in dataRes.data) {
        let value = dataRes.data[key];
        if (value.isTask) {
          value.showCheckbox = true;
        }
        if (value.executor && !value.avatarUri) {
          value.avatarUri = "/common/defaultPerson.png";
        }
        if (value.endTime) {
          value.showStatus = true;
          value.limitDay = dayjs(value.endTime).endOf("day").valueOf() + 1;
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
        node.startAdornmentContent,
        { tag: onShowMenu, icon: onShowMenu },
        node,
      );
      node.startAdornmentWidth =
        Object.keys(node.startAdornmentContent).length * (18 + 2);
      node.startAdornmentHeight = 18;
    }
    if (node.endAdornmentContent) {
      node.endAdornment = getEndAdornment(
        node.endAdornmentContent,
        {
          // note: onShowContent,
          link: handleOpenLink,
          file: onOpenAlt,
          // notefile: onOpenFile,
        },
        node,
      );
      node.endAdornmentWidth =
        Object.keys(node.endAdornmentContent).length * (18 + 2);
      node.endAdornmentHeight = 18;
    }
    if (node.bottomAdornmentContent) {
      node.bottomAdornment = getBottomAdornment(
        node.bottomAdornmentContent,
        {},
        node,
      );
      node.bottomAdornmentWidth =
        Object.keys(node.bottomAdornmentContent).length * (18 + 2);
      node.bottomAdornmentHeight = 18;
    }
    return node;
  };
  const editNodeText = async (nodeId, text, rootKey) => {
    setSelectedId(nodeId);
    if (text.trim() === "") {
      text = "新节点";
    }

    if (nodeId === rootKey) {
      console.log(window.opener);
      console.log(window.parent);
      if (window.opener) {
        window.opener.postMessage(
          {
            eventName: "changeName",
            data: text,
          },
          "*",
        );
      } else if (window.parent) {
        window.parent.postMessage(
          {
            eventName: "changeName",
            data: text,
          },
          "*",
        );
      }
    }
    updateNode(
      "name",
      text,
      (newNodes) => {
        newNodes[nodeId].name = text;
        setNodes(newNodes);
        onChangePath(startId, rootKey, true);
      },
      nodeId,
    );
  };
  const clickDot = (node) => {
    // setStartId(node._key);
    getNodeList(node._key, "child");
    setStartId(node._key);
    setSelectedId(node._key);
    // getNodePath(node._key, boardDetail?.rootKey, true);
    moveRef.current.reset();
  };
  const chooseNode = (node) => {
    if (node) {
      setSelectedNode(node);
      setSelectedId(node._key);
      onOutGetNode(node, "node");
      // if (type === 1) {
      //   treeRef.current.rename();
      // }
    } else {
      setSelectedNode(null);
      setSelectedId("");
      setSelectedNodes([]);
      onOutGetNode(null, "clear");
    }
  };
  const addNode = async (nodeId, type) => {
    setSelectedId(nodeId);
    let newNodes = _.cloneDeep(nodes);
    if (type === "next" && rootKey === nodeId) {
      setMessage("error", "根结点不能创建同级节点");
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
      setSelectedNode({
        ...selectedNode,
        ...obj,
      });
    }
  };
  const updateNodeBatch = async (obj, callback, nodeKeyArr, needCover) => {
    let newNodes = _.cloneDeep(nodes);
    let updateRes = await api.request.patch("node/more/batch", {
      nodeKeyArr: nodeKeyArr,
      obj: { ...obj },
      needCover: needCover,
    });
    if (updateRes.msg === "OK") {
      callback(newNodes);
    }
  };
  const clearNodeBatch = async (fieldName, objKey, callback, nodeKeyArr) => {
    let newNodes = _.cloneDeep(nodes);
    let updateRes = await api.request.patch("node/more/clean/batch", {
      nodeKeyArr: nodeKeyArr,
      fieldName,
      objKey,
    });
    if (updateRes.msg === "OK") {
      callback(newNodes);
    }
  };
  const deleteNode = async () => {
    if (selectedNodes.length > 0) {
      let selectIds = selectedNodes.map((item) => {
        return item._key;
      });
      Dialog.create({
        title: "批量删除节点",
        message: "是否批量删除该节点",
        cancel: {
          color: "grey-5",
          flat: true,
        },
      }).onOk(async () => {
        let delRes = await api.request.delete("node/batch", {
          nodeKeyArr: selectIds,
        });
        if (delRes.msg === "OK") {
          let newNodes = _.cloneDeep(nodes);
          setMessage("success", "批量删除成功");
          selectIds.forEach((delItem) => {
            let fatherKey = newNodes[delItem].father;
            let index = newNodes[fatherKey].sortList.findIndex(
              (item) => item === delItem,
            );
            if (index !== -1) {
              newNodes[fatherKey].sortList.splice(index, 1);
            }
            delete newNodes[delItem];
          });
          setNodes(newNodes);
        }
      });
    } else if (selectedId) {
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
        let delRes = await api.request.delete("node", {
          nodeKey: selectedId,
        });
        if (delRes.msg === "OK") {
          let newNodes = _.cloneDeep(nodes);
          setMessage("success", "删除成功");
          let fatherKey = newNodes[selectedId].father;
          let index = newNodes[fatherKey].sortList.findIndex(
            (item) => item === selectedId,
          );
          console.log(index);
          if (index !== -1) {
            newNodes[fatherKey].sortList.splice(index, 1);
          }
          delete newNodes[selectedId];
          console.log(newNodes);
          setNodes(newNodes);
          // fileList.value.splice(index, 1);
        }
      });
    }
  };
  const dragNode = async (dragInfo, dragSelectedNodes) => {
    let newNodes = _.cloneDeep(nodes);
    let fatherKey = newNodes[dragInfo.dropNodeId].father;
    if (dragSelectedNodes.length === 0) {
      dragSelectedNodes = [
        {
          nodeKey: dragInfo.dragNodeId,
          oldFather: newNodes[dragInfo.dragNodeId].father,
        },
      ];
    }
    console.log(newNodes);
    let nodeKeyArr = dragSelectedNodes.map((item) => {
      return item.nodeKey;
    });
    dragSelectedNodes.forEach((item) => {
      let nodeKey = item.nodeKey;
      let oldFatherKey = item.oldFather;
      if (dragInfo.placement === "in") {
        fatherKey = dragInfo.dropNodeId;
        newNodes[fatherKey].sortList.push(nodeKey);
      } else if (fatherKey) {
        let nodeIndex = newNodes[fatherKey].sortList.indexOf(
          dragInfo.dropNodeId,
        );
        let childrenIndex =
          dragInfo.placement === "up" ? nodeIndex : nodeIndex + 1;
        console.log(childrenIndex);
        newNodes[fatherKey].sortList.splice(childrenIndex, 0, nodeKey);
      }
      let index = newNodes[oldFatherKey].sortList.indexOf(nodeKey);
      if (index !== -1) {
        newNodes[oldFatherKey].sortList.splice(index, 1);
      }
      newNodes[nodeKey].father = fatherKey;
    });

    let dragRes = await api.request.patch("node/drag/batch", {
      nodeKeyArr: nodeKeyArr,
      targetNodeKey: dragInfo.dropNodeId,
      placement: dragInfo.placement,
    });
    if (dragRes.msg === "OK") {
      setNodes(newNodes);
    }
  };
  //黏贴剪切节点
  const pasteNode = async (pasteNodeKey, pasteType, targetNodeKey) => {
    console.log(pasteNodeKey, pasteType, targetNodeKey);
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
  const pasteText = async (text, event) => {
    // console.log(text.split(/\r?\n|\r/g),a,b);
    // /node/batch
    let copyRes = await api.request.post("node/batch", {
      nodeKey: selectedId,
      titleArr: text.split(/\r?\n|\r/g),
    });
    if (copyRes.msg === "OK") {
      getNodeList(selectedId, "child");
    }
  };
  //完成任务
  const editFinishPercent = async (node) => {
    let newNodes = _.cloneDeep(nodes);
    if (newNodes[node._key].executor) {
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
    } else {
      updateNodeBatch(
        { hasDone: !newNodes[node._key].hasDone },
        async (newNodes) => {
          newNodes[node._key].hasDone = !newNodes[node._key].hasDone;
          newNodes[node._key].checked = newNodes[node._key].hasDone;
          setNodes(newNodes);
        },
        [node._key],
      );
    }
  };
  //收缩节点
  const editContract = async (node) => {
    let newNodes = _.cloneDeep(nodes);
    let contractRes = await api.request.patch("node/contract", {
      nodeKey: node._key,
      contract: +!node.contract,
    });
    if (contractRes.msg === "OK") {
      console.log(node.contract);
      if (node.contract) {
        getNodeList(node._key, "child");
      } else {
        newNodes[node._key].childNum = contractRes.data;
        newNodes[node._key].contract = true;
        setNodes(newNodes);
      }
    }
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
      nodes[nodeId].father,
    );
  };

  // 插槽功能
  const handleClickNodeIcon = () => {};

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
      nodeId,
    );
  };
  //外部拖入
  const dragEndFromOutside = async (node, text) => {
    let useRes = await api.request.patch("note/use", {
      nodeKey: node._key,
      noteKey: text,
    });
    if (useRes.msg === "OK") {
      let note = useRes.data;
      switch (note.type) {
        case "text":
          //content
          updateNodeObj(
            { content: note.content },
            async (newNodes) => {
              setMessage("success", "插入速记内容成功");
              // setAdornmentContent(node, "endAdornmentContent", {
              //   note: { content: note.content },
              // });
            },
            node._key,
          );
          break;
        case "outline":
          getNodeList(node._key, "child");
          break;
        case "clip":
          updateNodeObj(
            { content: note.content },
            async (newNodes) => {
              newNodes[node._key] = {
                ...newNodes[node._key],
                content: note.content,
              };
              setNodes(newNodes);
              setAdornmentContent(node, "endAdornmentContent", {
                note: { content: note.content, type: "clip", key: text },
              });
            },
            node._key,
          );
          break;
        case "link":
          setAdornmentContent(node, "endAdornmentContent", {
            link: { url: note.link, text: note.title },
          });
          break;
        case "file":
          // setAdornmentContent(newNode, "bottomAdornmentContent", {
          //   file: {
          //     fileKey: detail._key,
          //     fileType: detail.type,
          //     subType: detail.subType,
          //   },
          // });
          break;
      }
      onChangeOutData("note", text);
    }
  };
  //获取内部数据
  const getNodeInfo = () => {
    return [selectedNode, nodes, selectedNodes];
  };
  const setAdornmentContent = (node, adornmentContent, obj) => {
    updateNodeObj(
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
        newNodes[node._key][adornmentContent] = { ...adornmentContentObj };
        newNodes[node._key] = formatNode(newNodes[node._key]);
        setNodes(newNodes);
      },
      node._key,
    );
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
            paddingLeft={1000}
            paddingTop={1000}
            startNodeBg="#07be51"
            defaultSelectedId={selectedId || undefined}
            singleColumn={viewType.includes("-single")}
            hideHour
            handleClickAvatar={(selectedNode, e) => {
              chooseNode(selectedNode);
              onShowMenu(selectedNode, e, "executor");
            }}
            handleClickStatus={(selectedNode, e) => {
              chooseNode(selectedNode);
              onShowMenu(selectedNode, e, "milestone");
            }}
            handleChangeNodeText={(nodeId, text) =>
              editNodeText(nodeId, text, rootKey)
            }
            handleClickDot={clickDot}
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
            }}
            handleDeleteNode={deleteNode}
            handlePaste={pasteNode}
            handlePasteText={(text) => {
              if (!drawerVisible) {
                pasteText(text);
              }
            }}
            handleResizeNodeImage={handleResizeNodeImage}
            dragEndFromOutside={dragEndFromOutside}
            handleMutiSelect={(nodeArray) => {
              setSelectedNodes(nodeArray);
              onOutGetNode(nodeArray, "array");
            }}
            customAdornment={({ x, y, height, nodeKey }) =>
              getCustmAdornment(
                x + 15,
                y + 5,
                height,
                nodeKey,
                rootKey,
                onShowDrawer,
              )
            }
          />
        );
      } else {
        return (
          <Mind
            ref={treeRef}
            singleColumn={viewType.includes("-single")}
            startId={startId}
            startNodeBg="#07be51"
            nodes={nodes}
            showIcon={true}
            showAvatar={true}
            showChildNum={true}
            uncontrolled={false}
            paddingLeft={1000}
            paddingTop={1000}
            hideHour
            handleClickAvatar={(selectedNode, e) => {
              chooseNode(selectedNode);
              onShowMenu(selectedNode, e, "executor");
            }}
            handleClickStatus={(selectedNode, e) => {
              chooseNode(selectedNode);
              onShowMenu(selectedNode, e, "milestone");
            }}
            handleChangeNodeText={editNodeText}
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
            // handleContextMenu={(selectedNode, e) => {
            //   setSelectedId(selectedNode);
            //   onShowDrawer(nodes[selectedNode], e.target);
            // }}
            handleDeleteNode={deleteNode}
            handlePaste={pasteNode}
            handlePasteText={(text) => {
              if (!drawerVisible) {
                pasteText(text);
              }
            }}
            handleResizeNodeImage={handleResizeNodeImage}
            dragEndFromOutside={dragEndFromOutside}
            handleMutiSelect={(nodeArray) => {
              setSelectedNodes(nodeArray);
            }}
            customAdornment={({ x, y, height, nodeKey }) =>
              getCustmAdornment(
                x + 15,
                y + 5,
                height,
                nodeKey,
                rootKey,
                onShowDrawer,
              )
            }
          />
        );
      }
    } else {
      return <div></div>;
    }
  }, [startId, selectedId, nodes, viewType]);
  useImperativeHandle(ref, () => ({
    addNode,
    updateNode,
    updateNodeObj,
    updateNodeBatch,
    clearNodeBatch,
    setSelectedNode,
    setNodes,
    setStartId,
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
      className="tree-component"
      onClick={(e) => {
        e.preventDefault();
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
        onCloseMenu={onCloseMenu}
        rightClickToStart={true}
      >
        <div style={{ transform: "scale(1)" }} className="tree-box">
          {tree}
        </div>
      </Moveable>
    </div>
  );
});
export default CustomTree;
