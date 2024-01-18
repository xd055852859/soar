import { Notify, Loading } from "quasar";
export const setMessage = (type: string, text: string) => {
  let icon: string = "";
  let color: string = "";
  switch (type) {
    case "success":
      icon = "done";
      color = "positive";
      break;
    case "error":
      icon = "error";
      color = "negative";
      break;
    case "warning":
      icon = "warning";
      color = "warning";
      break;
  }
  Notify.create({
    icon: icon,
    color: color,
    message: text,
    position: "top",
  });
};
export const setLoading = (visible: boolean) => {
  visible ? Loading.show() : Loading.hide();
};
export const commonscroll = (e, list, total, callback) => {
  //文档内容实际高度（包括超出视窗的溢出部分）
  let scrollHeight = e.target.scrollHeight;
  //滚动条滚动距离
  let scrollTop = e.target.scrollTop;
  //窗口可视范围高度
  let height = e.target.clientHeight;
  if (height + scrollTop >= scrollHeight && list.length < total.value) {
    callback();
  }
};
