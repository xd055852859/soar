const API_URL = import.meta.env.VITE_API_URL;
const DOMAIN = import.meta.env.VITE_QINIU_CDN;

export type Type = "ppt" | "draw" | "mind" | "sheet";
/**
 * 获取第三方应用地址
 * @param nodeKey
 * @returns
 */
export const getThirdAppUrl = (
  nodeKey: string,
  nodeType: Type,
  appUrl: string,
  editMode?: boolean,
  name?: string,
  showHead?: boolean
) => {
  const getDataApi = JSON.stringify({
    url: `${API_URL}/note/detail`,
    params: { noteKey: nodeKey },
    docDataName: "content",
  });
  const patchDataApi = JSON.stringify({
    url: `${API_URL}/note`,
    params: { noteKey: nodeKey },
    docDataName: nodeType === "draw" ? ["content", "name"] : "content",
  });
  const getUptokenApi = JSON.stringify({
    url: "https://soarfoxx.qingtime.cn/account/qiniuToken",
    params: { target: "cdn-soar" },
  });
  const token = localStorage.getItem("auth_token");
  // isEdit 2:编辑模式 1:预览 0:只读

  const qiniuRegion = "z2";
  const qiniuDomain = DOMAIN;

  const query = `token=${token}&getDataApi=${encodeURIComponent(
    getDataApi
  )}&patchDataApi=${encodeURIComponent(
    patchDataApi
  )}&getUptokenApi=${encodeURIComponent(
    getUptokenApi
  )}&qiniuRegion=${qiniuRegion}&isEdit=${
    editMode ? 2 : 1
  }&qiniuDomain=${qiniuDomain}&hideHead=1`;
  return `${appUrl}?${query}`;
};

export type AppInfo = {
  icon: string;
  url: string;
};

export const getAppInfo = (type: Type) => {
  switch (type) {
    case "ppt":
      return {
        icon: "ppt",
        url: "https://ppt.mindcute.com",
      };
    case "draw":
      return {
        icon: "draw",
        url: "https://draw.workfly.cn",
      };
    case "mind":
      return {
        icon: "mind",
        url: "https://mind.qingtime.cn",
      };
    case "sheet":
      return {
        icon: "sheet",
        url: "https://sheets.qingtime.cn",
      };
    default:
      return null;
  }
};
