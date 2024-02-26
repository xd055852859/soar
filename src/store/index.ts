import { authStore } from "@/store/auth";
import { commonStore } from "@/store/common";
import { spaceStore } from "@/store/space";
import { teamStore } from "@/store/team";
import { noteStore } from "@/store/note";
import { mateStore } from "@/store/mate";
import { cardStore } from "@/store/card";
import { exploreStore } from "@/store/explore";
import { departmentStore } from "@/store/department";
import { createPinia } from "pinia";

export interface IAppStore {
  authStore: ReturnType<typeof authStore>;
  commonStore: ReturnType<typeof commonStore>;
  spaceStore: ReturnType<typeof spaceStore>;
  teamStore: ReturnType<typeof teamStore>;
  noteStore: ReturnType<typeof noteStore>;
  mateStore: ReturnType<typeof mateStore>;
  cardStore: ReturnType<typeof cardStore>;
  exploreStore: ReturnType<typeof exploreStore>;
  departmentStore: ReturnType<typeof departmentStore>;
}

const appStore: IAppStore = {} as IAppStore;
/**
 * 注册app状态库
 */

export const registerStore = () => {
  appStore.authStore = authStore();
  appStore.commonStore = commonStore();
  appStore.spaceStore = spaceStore();
  appStore.teamStore = teamStore();
  appStore.noteStore = noteStore();
  appStore.mateStore = mateStore();
  appStore.cardStore = cardStore();
  appStore.exploreStore = exploreStore();
  appStore.departmentStore = departmentStore();
};

export default appStore;
