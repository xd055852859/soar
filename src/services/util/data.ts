//转换树
export const formatData = (nodes: any, nodeId: string) => {
  let obj: any = {
    ...nodes[nodeId],
    key: nodeId,
    label: nodes[nodeId].name,
    children: [],
  };

  if (nodes[nodeId].sortList && nodes[nodeId].sortList.length > 0) {
    nodes[nodeId].sortList.forEach((item: any) => {
      let nodeItem = formatData(nodes, item);
      obj.children.push(nodeItem);
    });
  }
  return obj;
};
