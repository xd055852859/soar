import { User } from "./User";

export interface ResultProps<T = any> {
  msg: string;
  data: T;
  status: number;
  pageNum?: number;
  totalNum?: number;
  total?: number;
  rooter?: any;
  playMedia?: string | number;
}
export interface Notice {
  _key: string;
  boardInfo: {
    _key: string;
    title: string;
  };
  cardInfo: {
    _key: string;
    title: string;
  } | null;
  fromUserInfo: User;
  hasRead: number;
  log: string;
  time: string;
  type: string;
  status?: number;
  applyKey?: string;
  newRole?: number;
}
export enum ROLELIST {
  "SpaceSuperAdmin" = -2,
  "SpaceAdmin" = -1,
  //箭头类型
  "SuperAdmin" = 0,
  "Admin" = 1,
  "Editor" = 2,
  "author" = 3,
  "Member" = 4,
}
export const ROLE_OPTIONS = [
  {
    label: "超管",
    value: 0,
  },
  {
    label: "管理员",
    value: 1,
  },
  {
    label: "编辑",
    value: 2,
  },
  {
    label: "作者",
    value: 3,
  },
  {
    label: "只读",
    value: 4,
  },
];
