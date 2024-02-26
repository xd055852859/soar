import router from "@/router";
import appStore from "@/store";
import axios from "axios";
import { commonStore } from "@/store/common";
import { setLoading, setMessage } from "./util/common";
import { JSONContent } from "@tiptap/vue-3";
const AUTH_URL = import.meta.env.VITE_AUTH_URL;
const API_URL = import.meta.env.VITE_API_URL;
let token = localStorage.getItem("auth_token") || "";
let loadNum = 0;
axios.interceptors.request.use(
  function (config) {
    loadNum = loadNum + 1;
    // setLoading(true);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axios.interceptors.response.use(
  (response) => {
    loadNum = loadNum - 1;
    if (loadNum === 0) {
      // setLoading(false);
    }
    if (response.data.status === 701) {
      setMessage("error", "请登录");
      localStorage.clear();
      router.replace("/");
      token = "";
      commonStore().clearStore();
    } else if (
      response.data.status !== 200 &&
      response.data.statusCode !== "200"
    ) {
      setMessage("error", response.data.msg);
    } else {
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
const request = {
  get(path: string, params?: object, otherUrl?: boolean, otherPath?: string) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "get",
          url: otherPath
            ? otherPath
            : otherUrl
            ? AUTH_URL + path
            : API_URL + path,
          params: params,
          headers: {
            token: token,
            locale: "zh-CN",
            timeNow: new Date().getTime(),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  post(path: string, params?: object, newPath?: string) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "post",
          url: newPath ? newPath : API_URL + path,
          data: params,
          headers: {
            token: token,
            locale: "zh-CN",
            timeNow: new Date().getTime(),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  patch(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "patch",
          url: API_URL + path,
          data: params,
          headers: {
            token: token,
            locale: "zh-CN",
            timeNow: new Date().getTime(),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(path: string, params?: object) {
    return new Promise(async function (resolve, reject) {
      try {
        const response = await axios({
          method: "delete",
          url: API_URL + path,
          data: params,
          headers: {
            token: token,
            locale: "zh-CN",
            timeNow: new Date().getTime(),
          },
        });
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  },
};

const qiniu = {
  getUptoken() {
    return request.get("account/qiniuToken", {
      target: "cdn-soar",
    });
  },
  getUptokenOverWrite(key: string) {
    return request.get("/upTokenQiniu/getQiNiuUpTokenKey", {
      token: token,
      type: 2,
      key,
      bucketType: 7,
    });
  },
  qiniuRemain(fileSize: number, cardKey?: string, tagKey?: string) {
    return request.get("/qiniu/remain", {
      fileSize,
      cardKey,
      tagKey,
    });
  },
  qiniuStatistic(
    cardKey: string,
    url: string,
    fileSize: number,
    nodeKey?: string
  ) {
    return request.post("/qiniu", {
      cardKey,
      nodeKey,
      url,
      fileSize,
    });
  },
};

const note = {
  create(props: {
    type:
      | "text"
      | "outline"
      | "clip"
      | "link"
      | "file"
      | "ppt"
      | "draw"
      | "mind"
      | "sheet";
    title: string;
    content?: JSONContent;
    summary?: string;
    icon?: string;
    url?: string;
    fileType?: string;
  }) {
    return request.post("/note", props);
  },
  get(props: {
    page: number;
    limit: number;
    type?: "text" | "outline" | "clip" | "link" | "file";
    used?: boolean;
  }) {
    return request.get("/note", props);
  },
  delete(noteKey: string) {
    return request.delete("/note", { noteKey });
  },
  edit(props: {
    noteKey: string;
    type: "text" | "outline" | "clip" | "link" | "file";
    title: string;
    content: JSONContent;
    summary: string;
    icon?: string;
  }) {
    return request.patch("/note", props);
  },
  detail(noteKey: string) {
    return request.get("/note/detail", { noteKey });
  },
};

export default {
  request,
  qiniu,
  note,
  getUrlInfo: (url: string) => {
    return request.get(
      "",
      {
        url,
      },
      undefined,
      "https://nodeserver.qingtime.cn/linkInfo"
    );
  },
  setToken: (_token: string) => {
    localStorage.setItem("auth_token", _token);
    token = _token;
  },
  getToken: () => {
    return token;
  },
  API_URL,
  AUTH_URL,
};
