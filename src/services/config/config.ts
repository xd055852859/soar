import _ from "lodash";
export const fileArray = ["全部", "图片", "文档", "视频", "音频", "其他"];
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
    value: "sheet",
  },
  {
    label: "演示",
    value: "ppt",
  },
  // {
  //   label: "知识库",
  //   value: "knowledgeBase",
  // },
];
export const viewArray = [
  {
    value: "taskTree",
    label: "事务",
  },
  // {
  //   value: "doc",
  //   label: "文档",
  // },
  // {
  //   value: "file",
  //   label: "文件",
  // },
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
export const tagArray = [
  {
    value: "#8bc34a",
    label: "建议",
  },
  {
    value: "#03a9f4",
    label: "强烈建议",
  },
  {
    value: "#ffc107",
    label: "错误",
  },
  {
    value: "#ff5722",
    label: "严重错误",
  },
  {
    value: "#f44336",
    label: "致命错误",
  },
  {
    value: "#9c27b0",
    label: "顶级优先",
  },
];
export const planArray = [
  {
    value: "",
    label: "全部",
  },
  {
    value: "today",
    label: "今日",
  },
  {
    value: "tomorrow",
    label: "明日",
  },
  // {
  //   value: "weekend",
  //   label: "本周截止",
  // },
  // {
  //   value: "monthend",
  //   label: "本月截止",
  // },

  {
    value: "future",
    label: "未来",
  },
];
export const signatureArray = [
  {
    color: "#16d4b1",
    label: "在岗",
  },
  {
    color: "#6887f3",
    label: "外出",
  },
  {
    color: "#8f8f8f",
    label: "请假",
  },
  {
    color: "#fcb64e",
    label: "出差",
  },
];
export const statusArray = [
  {
    value: 1,
    label: "正常",
  },
  {
    value: 2,
    label: "未激活",
  },
  // {
  //   value: 3,
  //   label: "已暂停",
  // },
];
export const searchArray = [
  { label: "百度", url: "https://www.baidu.com/s?ie=utf-8&word=" },
  { label: "必应", url: "https://www.bing.com/search?q=" },
  { label: "谷歌", url: "https://www.google.com/search?q=" },
  { label: "Magi", url: "https://magi.com/search?q=" },
  { label: "F搜", url: "https://fsoufsou.com/search?q=" },
  { label: "Yandex", url: "https://yandex.com/search/?text=" },
  { label: "DuckDuckGo", url: "https://duckduckgo.com/?q=DuckDuckGo" },
  { label: "搜狗搜索", url: "https://www.sogou.com/web?query=" },
  { label: "360搜索", url: "https://www.so.com/s?q=" },
];
export const formatName = (list) => {
  let chartArray = [];
  let chartNameArray: any = [];
  chartArray = list.map((item) => {
    let arr: any = [];
    for (let key in item) {
      if (key !== "time") {
        console.log(item[key])
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
  return [_.flatten(chartArray), chartNameArray];
};
export const typeIcon: { [_key: string]: string } = {
  folder: "material-symbols:folder-outline",
  text: "mdi:file-text-outline",
  outline: "mdi:file-text-outline",
  ppt: "mingcute:ppt-line",
  draw: "material-symbols-light:draw-outline",
  mind: "icon-park-outline:mind-mapping",
  sheet: "lucide:sheet",
  file: "mdi:file-outline",
  link: "mdi:link",
  taskTree: "mdi:subtasks",
};
