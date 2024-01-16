import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    component: () => import("@/views/login/index.vue"),
    children: [],
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/home/index.vue"),
    redirect: "/home/work",
    children: [
      {
        path: "work",
        name: "work",
        component: () => import("@/views/home/work/index.vue"),
        children: [],
      },
      {
        path: "task",
        name: "task",
        component: () => import("@/views/home/task/index.vue"),
        children: [],
      },
      {
        path: "resource",
        name: "resource",
        component: () => import("@/views/home/resource/index.vue"),
        children: [],
      },
      {
        path: "team",
        name: "team",
        component: () => import("@/views/home/team/index.vue"),
        redirect: "/home/team/recent",
        children: [
          {
            path: "recent",
            name: "recent",
            component: () => import("@/views/home/team/tab/recent.vue"),
            children: [],
          },
          {
            path: "doc",
            name: "teamDoc",
            component: () => import("@/views/home/team/tab/teamDoc.vue"),
            children: [],
          },
          {
            path: "file",
            name: "teamFile",
            component: () => import("@/views/home/team/tab/teamFile.vue"),
            children: [],
          },
          {
            path: "taskTree",
            name: "teamTask",
            component: () => import("@/views/home/team/tab/teamTask.vue"),
            children: [],
          },
        ],
      },
    ],
  },
  {
    path: "/space",
    name: "space",
    component: () => import("@/views/space/index.vue"),
    redirect: "/space/setting",
    children: [
      {
        path: "setting",
        name: "setting",
        component: () => import("@/views/space/manage/setting.vue"),
        children: [],
      },
      {
        path: "member",
        name: "member",
        component: () => import("@/views/space/manage/member.vue"),
        children: [],
      },
      {
        path: "group",
        name: "group",
        component: () => import("@/views/space/manage/group.vue"),
        children: [],
      },
      {
        path: "safety",
        name: "safety",
        component: () => import("@/views/space/manage/safety.vue"),
        children: [],
      },
      {
        path: "vip",
        name: "vip",
        component: () => import("@/views/space/manage/vip.vue"),
        children: [],
      },
    ],
    props: true,
  },
  {
    path: "/spaceList",
    name: "spaceList",
    component: () => import("@/views/space/list.vue"),
    children: [],
  },
  {
    path: "/test",
    name: "test",
    component: () => import("@/views/test.vue"),
    children: [],
  },
];
const routerHistory = createWebHashHistory();
const router = createRouter({
  history: routerHistory,
  routes,
});
//全局后置守卫
router.afterEach((to, from, failure) => {
  // if (window.parent != window.self && from.fullPath !== "/") {
  //   window.parent.postMessage({ url: location.href }, "*");
  //   localStorage.setItem("url", to.fullPath);
  // }
});
export default router;
