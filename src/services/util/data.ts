//转换树
export const formatData = (nodes: any, nodeId: string) => {
    let obj: any = {
      ...nodes[nodeId],
      key: nodeId,
      label: nodes[nodeId].name,
      children: [],
    };
  
    if (nodes[nodeId].children && nodes[nodeId].children.length > 0) {
      nodes[nodeId].children.forEach((item: any) => {
        let nodeItem = formatData(nodes, item);
        obj.children.push(nodeItem);
      });
    }
    return obj;
  };