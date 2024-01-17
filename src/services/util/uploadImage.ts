import * as qiniu from "qiniu-js";
import { guid, getFileTypeByName } from "./util";
import api from "@/services/api";
const DOMAIN = import.meta.env.VITE_QINIU_CDN;
let singleSizeLimit = 0;

interface Api {
  url: string;
  params: any;
  responseName?: string;
  docDataName?: string;
}

//将base64转换为文件
export function dataURLtoFile(dataurl: string, filename: string) {
  let arr = dataurl.split(",");
  let match = arr[0].match(/:(.*?);/);
  let mime = match ? match[1] : null;
  if (!mime) return null;
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function dataURItoBlob(dataURI: string) {
  var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]; // mime类型
  var byteString = atob(dataURI.split(",")[1]); //base64 解码
  var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
  var intArray = new Uint8Array(arrayBuffer); //创建视图

  for (var i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([intArray], { type: mimeString });
}

export const uploadImg = ({
  file,
  cardKey,
  accept = "image/*",
  overwrite = false,
  allType,
  nodeKey,
  updatePercent,
  qiniuToken,
  getUptokenApi,
}: {
  file: File;
  cardKey: string;
  accept?: string;
  overwrite?: boolean;
  allType?: boolean;
  nodeKey?: string;
  updatePercent?: (percent: string, imageUrl?: string) => void;
  qiniuToken?: string;
  getUptokenApi?: Api | null;
}) => {
  const putExtra = allType
    ? {
        // 文件原文件名
        fname: "",
        // 自定义变量
        params: {},
      }
    : {
        // 文件原文件名
        fname: "",
        // 自定义变量
        params: {},
        // 限制上传文件类型
        mimeType: accept,
      };

  const qiniuConfig = {
    useCdnDomain: true,
    disableStatisticsReport: false,
    retryCount: 5,
    region: qiniu.region.z0,
    // https://blog.csdn.net/Wuyo_7/article/details/112478365
    forceDirect: true,
  };

  const fileName = overwrite
    ? file.name
    : `${guid(8, 16)}${
        file.name ? file.name.substr(file.name.lastIndexOf(".")) : ".png"
      }`;

  return new Promise(async function (resolve, reject) {
    try {
      let observer = {
        next(res: any) {
          if (updatePercent) {
            updatePercent(res.total.percent.toFixed(2));
          }
        },
        error(err: any) {
          console.log("---上传失败---", err);
          reject(err);
        },
        complete(res: any) {
          const url =
            (getUptokenApi
              ? `https://${getUptokenApi.params.target}.qingtime.cn/`
              : DOMAIN) + encodeURIComponent(res.key);
          if (updatePercent) {
            updatePercent("100", url);
          }
          // api.auth.updateStorage([
          //   {
          //     url: url,
          //     fileType: file.type,
          //     fileSize: file.size,
          //     nodeKey,
          //   },
          // ]);

          // todo
          if (!getUptokenApi) {
            // api.auth.qiniuStatistic(cardKey, url, file.size);
          }

          resolve(url);
        },
      };

      if (file.size > singleSizeLimit) {
        return reject({
          msg: `limit: ${singleSizeLimit / 1024 / 1024}`,
        });
      }

      const tagKey = window.location.hash.includes("/tags")
        ? localStorage.getItem("LAST_TAG") || undefined
        : undefined;

      // todo
      // const res: any = getUptokenApi
      //   ? { status: 200 }
      //   : await api.auth.qiniuRemain(file.size, cardKey, tagKey);
      const res: any = { status: 200 };

      if (res.status === 200) {
        let uptoken;
        if (qiniuToken) {
          uptoken = qiniuToken;
        } else {
          let uptokenRes: any;
          if (getUptokenApi) {
            uptokenRes = await api.request.get(getUptokenApi.url, {
              ...getUptokenApi.params,
              ...{ token: api.getToken() },
            });
          } else {
            uptokenRes = await api.qiniu.getUptoken();
          }
          uptoken = uptokenRes.result || uptokenRes.data;
        }
        if (!uptoken) {
          return reject({ msg: "qiniu-failed" });
        }
        // 上传
        let observable = qiniu.upload(
          file,
          fileName,
          uptoken,
          putExtra,
          qiniuConfig
        );
        // 上传开始
        observable.subscribe(observer);
      } else {
        return reject({
          msg: "no storage",
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const uploadImgs = async ({
  files,
  cardKey,
  accept = "image/*",
  overwrite = false,
  allType,
  nodeKey,
}: {
  files: File[];
  cardKey: string;
  accept?: string;
  overwrite?: boolean;
  allType?: boolean;
  nodeKey?: string;
}) => {
  return new Promise(async function (resolve, reject) {
    try {
      let totalSize = 0;
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        totalSize += file.size;
        if (file.size > singleSizeLimit) {
          return reject({
            msg: `limit: ${singleSizeLimit / 1024 / 1024}`,
          });
        }
      }

      const tagKey = window.location.hash.includes("/tags")
        ? localStorage.getItem("LAST_TAG") || undefined
        : undefined;
      const res: any = await api.qiniu.qiniuRemain(totalSize, cardKey, tagKey);
      if (res.status !== 200) {
        return reject({
          msg: "no storage",
        });
      }
      const uptokenRes: any = await api.qiniu.getUptoken();
      const uptoken = uptokenRes.result;
      if (!uptoken) {
        return reject({ msg: "qiniu-failed" });
      }
      const promises = Array.from(new Array(files.length).keys()).map((item) =>
        uploadImg({
          file: files[item],
          cardKey,
          accept,
          overwrite,
          allType,
          nodeKey,
          qiniuToken: uptoken,
        })
      );
      Promise.all(promises)
        .then(function (posts) {
          let res: Object[] = [];
          for (let index = 0; index < files.length; index++) {
            const file = files[index];
            let filetype = file.type;
            if (!filetype) {
              filetype = getFileTypeByName(file.name);
            }
            res.push({
              url: posts[index],
              fileSize: file.size,
              fileType: filetype,
              name: file.name,
            });
          }
          // api.auth.updateStorage(res);
          resolve(res);
        })
        .catch(function (reason) {
          console.log("---error---", reason);
          reject(reason);
        });
    } catch (error) {
      reject(error);
    }
  });
};

export const setSingleSizeLimit = (limit: number) => {
  singleSizeLimit = limit;
};
