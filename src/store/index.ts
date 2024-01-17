import { authStore } from "@/store/auth";
import { commonStore } from "@/store/common";
import { spaceStore } from "@/store/space";
import { teamStore } from "@/store/team";
import { createPinia } from "pinia";
import { noteStore } from "@/store/note";

export interface IAppStore {
  authStore: ReturnType<typeof authStore>;
  commonStore: ReturnType<typeof commonStore>;
  spaceStore: ReturnType<typeof spaceStore>;
  teamStore: ReturnType<typeof teamStore>;
  noteStore: ReturnType<typeof noteStore>;
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
};

export default appStore;
