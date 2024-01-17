import { JSONContent } from "@tiptap/vue-3";

export interface Card {
  _key: string;
  title: string;
  type: "text" | "outline" | "clip" | "link" | "file";
  // 详情
  content?: JSONContent;
  icon?: string;
  // 摘要
  summary?: string;
}
