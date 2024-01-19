import { JSONContent } from "@tiptap/vue-3";

export const is_mobile = () => {
  let regex_match =
    /(nokia|iphone|iPad|android|motorola|^mot-|softbank|foma|docomo|kddi|up.browser|up.link|htc|dopod|blazer|netfront|helio|hosin|huawei|novarra|CoolPad|webos|techfaith|palmsource|blackberry|alcatel|amoi|ktouch|nexian|samsung|^sam-|s[cg]h|^lge|ericsson|philips|sagem|wellcom|bunjalloo|maui|symbian|smartphone|midp|wap|phone|windows ce|iemobile|^spice|^bird|^zte-|longcos|pantech|gionee|^sie-|portalmmm|jigs browser|hiptop|^benq|haier|^lct|operas*mobi|opera*mini|320x320|240x320|176x220|Mobile)/i;
  let u = navigator.userAgent;
  if (null == u) {
    return true;
  }
  let result = regex_match.exec(u);

  if (null == result) {
    return false;
  } else {
    return true;
  }
};

export const guid = (len?: number, radix?: number) => {
  let chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uuid: string[] = [],
    i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join("");
};

export function getFileTypeByName(name: string) {
  const fileExtension = name.split(".").pop();
  if (
    fileExtension === "jpg" ||
    fileExtension === "png" ||
    fileExtension === "jpeg"
  ) {
    return "image/*";
  } else if (
    fileExtension === "mp3" ||
    fileExtension === "aac" ||
    fileExtension === "wav"
  ) {
    return "audio/*";
  } else if (fileExtension === "mp4") {
    return "video/*";
  } else if (fileExtension === "pdf") {
    return "application/pdf";
  } else if (
    fileExtension === "docx" ||
    fileExtension === "doc" ||
    fileExtension === "xls" ||
    fileExtension === "xlsx" ||
    fileExtension === "ppt" ||
    fileExtension === "pptx"
  ) {
    return "application/msword";
  } else {
    return "unknow";
  }
}

export function download(url: string, fileName: string) {
  fetch(url).then((res) =>
    res.blob().then((blob) => {
      var a = document.createElement("a");
      var url = window.URL.createObjectURL(blob);
      var filename = fileName;
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    })
  );
}

export function isElectron() {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf(" electron/") > -1) {
    return true;
  } else {
    return false;
  }
}

export function getDeviceType() {
  const ua = window.navigator.userAgent.toLowerCase();
  const matchs = ua.match(
    /electron|micromessenger|Android|webOS|iPhone|Macintosh|windows/i
  );
  return matchs && matchs.length ? matchs[0] : 1;
}

export function getDefaultLanguage() {
  const languages = ["zh-TW", "ja", "zh-CN", "zh", "en"];
  const localStorageLan = localStorage.getItem("LOCALE");
  if (localStorageLan && languages.includes(localStorageLan)) {
    return localStorageLan;
  } else {
    const systemLan = navigator.language;
    if (systemLan && languages.includes(systemLan)) {
      localStorage.setItem("LOCALE", systemLan);
      return systemLan;
    } else {
      return "en";
    }
  }
}

/**
 * 判断是否是絵文字
 * @param str
 * @returns
 */
export function isEmoji(str?: string) {
  return str
    ? /(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/g.test(
        str
      )
    : false;
}

// 获取随机数
export function randomNum(minNum: number, maxNum: number) {
  switch (arguments.length) {
    case 1:
      // @ts-ignore
      return parseInt(Math.random() * minNum + 1, 10);
    case 2:
      // @ts-ignore
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    default:
      return 0;
  }
}

export const defaultTaskList = {
  type: "taskList",
  content: [
    {
      type: "taskItem",
      attrs: {
        checked: false,
      },
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: "left",
          },
          content: [
            {
              type: "text",
              text: "task1",
            },
          ],
        },
      ],
    },
    {
      type: "taskItem",
      attrs: {
        checked: false,
      },
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: "left",
          },
          content: [
            {
              type: "text",
              text: "task2",
            },
          ],
        },
      ],
    },
    {
      type: "taskItem",
      attrs: {
        checked: false,
      },
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: "left",
          },
          content: [
            {
              type: "text",
              text: "task3",
            },
          ],
        },
      ],
    },
  ],
};

export function havePermission(
  role: "owner" | "admin" | "edit" | "author" | "read",
  targetRole: "owner" | "admin" | "edit" | "author" | "read"
) {
  const roles = ["owner", "admin", "edit", "author", "read"];
  const index = roles.findIndex((item) => item === role);
  const targetIndex = roles.findIndex((item) => item === targetRole);
  if (index < targetIndex) {
    return true;
  } else {
    return false;
  }
}

export type TreeNode = {
  label: string;
  children?: TreeNode[];
};

export function generateMenuTree(json: JSONContent) {
  let root: TreeNode | null = null;
  let stack: TreeNode[] = [];

  const content = json.content;
  for (let index = 0; content && index < content.length; index++) {
    const element = content[index];
    if (
      element.type === "heading" &&
      element.content &&
      element.content[0].text &&
      element.attrs
    ) {
      const text = element.content[0].text;
      const level = element.attrs.level;

      const newNode: TreeNode = { label: text };
      if (stack.length === 0) {
        root = newNode;
      } else {
        while (stack.length >= level) {
          stack.pop();
        }
        const parent = stack[stack.length - 1];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newNode);
        }
      }

      stack.push(newNode);
    }
  }

  return root;
}
export function jumpToTitle(titleText: string) {
  const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  elements.forEach((element) => {
    if (element.textContent === titleText) {
      // 移除先前点击的标题的样式
      document.querySelectorAll(".clicked-title").forEach((el) => {
        el.classList.remove("clicked-title");
      });

      // 添加当前点击的标题的样式
      element.classList.add("clicked-title");
      setTimeout(() => {
        element.classList.remove("clicked-title");
      }, 1000);
      // 使用 DOM 的 scrollIntoView 方法滚动到指定元素
      element.scrollIntoView({ behavior: "smooth" });
    }
  });
}

export function isUrl(text: string): boolean {
  // 这里简单判断是否为 URL，你可能需要使用更复杂的正则表达式或其他方式进行判断
  const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlPattern.test(text);
}

export function isOutline(json: JSONContent): boolean {
  let outline = false;
  const content = json.content;
  for (let index = 0; content && index < content.length; index++) {
    const item = content[index];
    if (item.type === "bulletList" || item.type === "orderedList") {
      outline = true;
      return outline;
    }
    outline = isOutline(content);
    if (outline) {
      return outline;
    }
  }
  return outline;
}
