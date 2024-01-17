import _ from "lodash"
export const fileArray = [
  {
    label: "全部类型",
    value: "",
  },
  {
    label: "图片",
    value: "image",
  },
  {
    label: "文档",
    value: "doc",
  },

  {
    label: "视频",
    value: "mp3",
  },
  {
    label: "音频",
    value: "mp3",
  },
];
export const nameArray = [
  {
    label: "文件",
    key: "totalDoc",
  },
  {
    label: "文档",
    key: "totalFile",
  },
  {
    label: "发布任务",
    key: "totalTask",
  },
  {
    label: "完成任务",
    key: "totalFinish",
  },
];
export const docArray = [
  {
    label: "全部类型",
    value: "",
  },
  {
    label: "文档",
    value: "text",
  },
  {
    label: "绘图",
    value: "draw",
  },
  {
    label: "脑图",
    value: "mind",
  },
  {
    label: "表格",
    value: "table",
  },
  {
    label: "演示",
    value: "ppt",
  },
  {
    label: "知识库",
    value: "knowledgeBase",
  },
];
export const viewArray = [
  {
    value: "taskTree",
    label: "任务",
  },
  {
    value: "doc",
    label: "文档",
  },
  {
    value: "file",
    label: "文件",
  },
  {
    value: "knowledgeBase",
    label: "知识库",
  },
  {
    value: "table",
    label: "多维表",
  },
  {
    value: "taskBox",
    label: "任务盒子",
  },
];
export const dayArray = [
  {
    value: 7,
    label: "7天",
  },
  {
    value: 30,
    label: "30天",
  },
  {
    value: 90,
    label: "90天",
  },
];

export const formatName = (list) => {
  let chartArray = [];
  let chartNameArray: any = [];
  chartArray = list.map((item) => {
    let arr: any = [];
    for (let key in item) {
      if (key !== "time") {
        arr.push([
          item.time,
          item[key],
          nameArray[_.findIndex(nameArray, { key: key })].label,
        ]);
        if (
          chartNameArray.indexOf(
            nameArray[_.findIndex(nameArray, { key: key })].label
          ) === -1
        ) {
          chartNameArray.push(
            nameArray[_.findIndex(nameArray, { key: key })].label
          );
        }
      }
    }
    return arr;
  });
  return [ _.flatten(chartArray), chartNameArray];
};
