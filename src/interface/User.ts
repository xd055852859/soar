export interface Person {
  userAvatar: string;
  userName: string;
  _key: string;
}
export interface User extends Person {
  email?: string;
  mobile?: string;
  online?: boolean;
  mobileArea?: string;
  gender: number;
  config: any;
  addedSpace?: number;
  role?: string;
  totalSpace?: number;
  usedSpace?: number;
  mainAgentKey:string
}
export interface Member extends Person {
  role: number;
  added?: boolean;
  online?: boolean;
}
