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
    redirect: "/home/explore",
    children: [
      {
        path: "explore",
        name: "explore",
        component: () => import("@/views/home/right/explore/index.vue"),
        children: [],
      },
      {
        path: "notice",
        name: "notice",
        component: () => import("@/views/home/right/notice/index.vue"),
        children: [],
      },
      {
        path: "calendar",
        name: "calendar",
        component: () => import("@/views/home/right/calendar/index.vue"),
        children: [],
      },
      {
        path: "mate",
        name: "mate",
        component: () => import("@/views/home/right/mate/index.vue"),
        redirect: "/home/mate/list",
        children: [
          {
            path: "list",
            name: "mateList",
            component: () => import("@/views/home/right/mate/list.vue"),
            children: [],
          },
          {
            path: "detail/:mateKey",
            name: "mateDetail",
            component: () => import("@/views/home/right/mate/detail.vue"),
            children: [],
            props: true,
          },
          {
            path: "setting",
            name: "mateSetting",
            component: () => import("@/views/home/right/mate/setting.vue"),
            children: [],
          },
        ],
      },

      {
        path: "task",
        name: "task",
        component: () => import("@/views/home/right/task/index.vue"),
        children: [],
      },
      {
        path: "taskBoard",
        name: "taskBoard",
        component: () => import("@/views/home/right/task/taskBoard/index.vue"),
        children: [],
      },
      {
        path: "note",
        name: "note",
        component: () => import("@/views/home/right/note/index.vue"),
        children: [],
      },
      {
        path: "freedom",
        name: "freedom",
        component: () => import("@/views/home/right/freedom/index.vue"),
        children: [],
      },
      {
        path: "team",
        name: "team",
        component: () => import("@/views/home/right/team/index.vue"),
        redirect: "/home/team/teamKnowledgeBase",
        children: [
          {
            path: "teamKnowledgeBase",
            name: "teamKnowledgeBase",
            component: () =>
              import("@/views/home/right/team/tab/teamKnowledgeBase.vue"),
            children: [],
          },
          {
            path: "teamTask/:cardKey",
            name: "teamTask",
            component: () => import("@/views/home/right/team/tab/teamTask.vue"),
            children: [],
            props: true,
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
        path: "department",
        name: "department",
        component: () => import("@/views/space/manage/department.vue"),
        children: [],
      },
      {
        path: "group",
        name: "group",
        component: () => import("@/views/space/manage/group.vue"),
        children: [],
      },
      {
        path: "application",
        name: "application",
        component: () => import("@/views/space/manage/application.vue"),
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
    path: "/share/:shareId",
    name: "share",
    component: () => import("@/views/share/index.vue"),
    children: [
      {
        path: "shareTree/:cardKey",
        name: "shareTree",
        component: () => import("@/components/tree/tree.vue"),
        children: [],
        props: true,
      },
      {
        path: "teamHome",
        name: "teamHome",
        component: () => import("@/views/home/right/team/tab/index.vue"),
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
