<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
import _ from "lodash";
import member from "./member.vue";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey, teamInfo, teamMemberList, teamList, teamFoldList } =
  storeToRefs(appStore.teamStore);
const { setTeamKey, setTeamList, setTeamFoldList } = appStore.teamStore;
const $q = useQuasar();
const addVisible = ref<boolean>(false);
const memberVisible = ref<boolean>(false);
const name = ref<string>("");
const isPublic = ref<boolean>(true);
const defaultRole = ref<number>(3);
const memo = ref<string>("");
const overKey = ref<string>("");
const views = ref<string[]>(["taskTree", "doc", "file"]);
const viewArray = [
  {
    value: "taskTree",
    label: "任务",
  },
  {
    value: "doc",
    label: "文档",
  },
  {
    value: "file",
    label: "文件",
  },
  {
    value: "knowledgeBase",
    label: "知识库",
  },
  {
    value: "table",
    label: "多维表",
  },
  {
    value: "taskBox",
    label: "任务盒子",
  },
];

const updateTeam = async () => {
  if (!name.value) {
    setMessage("error", "请输入名称");
    return;
  }
  let obj: any = {
    name: name.value,
    isPublic: isPublic.value,
    defaultRole: defaultRole.value,
    memo: memo.value,
    views: views.value,
  };
  if (overKey.value) {
    let teamRes = (await api.request.patch("project", {
      projectKey: overKey.value,
      ...obj,
    })) as ResultProps;
    if (teamRes.msg === "OK") {
      let list = _.cloneDeep(teamList.value);
      setMessage("success", "编辑小组成功");
      let index = _.findIndex(list, { _key: overKey.value });
      console.log(index, overKey.value, list);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          name: name.value,
        };
        setTeamList(list);
      }
      addVisible.value = false;
    }
  } else {
    let teamRes = (await api.request.post("project", {
      teamKey: spaceKey.value,
      ...obj,
    })) as ResultProps;
    if (teamRes.msg === "OK") {
      setMessage("success", "创建小组成功");
      setTeamKey(teamRes.data._key);
      setTeamList([...teamList.value, teamRes.data]);
      addVisible.value = false;
    }
  }
};
const toggleTeam = async (item, visible) => {
  if (item) {
    overKey.value = item._key;
  } else {
    overKey.value = "";
    name.value = "";
    isPublic.value = true;
    defaultRole.value = 3;
    memo.value = "";
    views.value = ["taskTree", "doc", "file"];
  }
  addVisible.value = visible;
};
const watchTeam = async (item) => {
  let teamRes = (await api.request.patch("project/watch", {
    projectKey: item._key,
    watch: !item.watch,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    setMessage("success", `${item.watch ? "取消关注" : "关注"}小组成功`);
    let list = _.cloneDeep(teamList.value);
    let index = _.findIndex(list, { _key: item._key });
    list[index] = { ...list[index], watch: !item.watch };
    setTeamList(list);
  }
};
const deleteTeam = (key) => {
  $q.dialog({
    title: "删除小组",
    message: "请将资源(任务、文档、文件)全部删除后再删除",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const teamRes = (await api.request.delete("project", {
        projectKey: key,
      })) as ResultProps;
      if (teamRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "删除小组成功");
        let index = _.findIndex(list, { _key: key });
        index !== -1 && list.splice(index, 1);
        setTeamList(list);
      }
    })
    .onCancel(() => {});
};
const foldTeam = async (key, state) => {
  const teamRes = (await api.request.patch("project/fold", {
    projectKey: key,
    fold: state,
  })) as ResultProps;
  if (teamRes.msg === "OK") {
    let list = _.cloneDeep(teamList.value);
    let foldList = _.cloneDeep(teamFoldList.value);
    if (state) {
      setMessage("success", "折叠小组成功");
      let index = _.findIndex(list, { _key: key });
      if (index !== -1) {
        let item = list.splice(index, 1)[0];
        foldList.push(item);
      }
    } else {
      setMessage("success", "取消折叠小组成功");
      let index = _.findIndex(foldList, { _key: key });
      if (index !== -1) {
        let item = foldList.splice(index, 1)[0];
        list.push(item);
      }
    }
    setTeamList(list);
    setTeamFoldList(foldList);
  }
};
watchEffect(() => {
  if (views.value.length === 0) {
    views.value = ["taskTree", "doc", "file"];
  }
});
watch(addVisible, (newVisible) => {
  if (!newVisible) {
    name.value = "";
  }
});
watch(teamInfo, (newInfo) => {
  if (newInfo) {
    name.value = newInfo.name;
    isPublic.value = newInfo.isPublic;
    defaultRole.value = newInfo.defaultRole;
    memo.value = newInfo.memo;
    views.value = newInfo.views;
  }
});
</script>
<template>
  <div class="teamMenu">
    <div class="teamMenu-title">
      <div>小组</div>
      <q-btn flat round icon="add_circle" @click="toggleTeam(null, true)" />
    </div>
    <div class="teamMenu-list">
      <div
        class="teamMenu-item icon-point"
        v-for="(item, index) in teamList"
        :key="`team${index}`"
        @mouseenter="overKey = item._key"
        @click="
          setTeamKey(item._key);
          $router.push(`/home/team`);
        "
      >
        <div># {{ item.name }}</div>
        <div class="teamMenu-item-icon" v-if="overKey === item._key">
          <q-btn flat round icon="more_horiz" size="12px"> </q-btn>
          <q-menu anchor="top right" self="top left" class="q-pa-sm">
            <q-list dense>
              <q-item clickable v-close-popup @click="toggleTeam(item, true)">
                <q-item-section>编辑</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="watchTeam(item)">
                <q-item-section>{{
                  item.watch ? "取消关注" : "关注"
                }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="">
                <q-item-section>置顶</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="memberVisible = true">
                <q-item-section>成员</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="">
                <q-item-section>合并到</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="">
                <q-item-section>克隆</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="deleteTeam(item._key)">
                <q-item-section>删除</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="foldTeam(item._key, true)"
              >
                <q-item-section>折叠</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
    </div>
    <div class="teamMenu-title">
      <div>折叠的小组</div>
    </div>
    <div class="teamMenu-list">
      <div
        class="teamMenu-item icon-point"
        v-for="(item, index) in teamFoldList"
        @mouseenter="overKey = item._key"
        :key="`foldTeam${index}`"
      >
        <div># {{ item.name }}</div>
        <div class="teamMenu-item-icon" v-if="overKey === item._key">
          <q-btn flat round icon="more_horiz" size="12px">
            <q-menu anchor="top right" self="top left" class="q-pa-sm">
              <q-list dense>
                <q-item
                  clickable
                  v-close-popup
                  @click="foldTeam(item._key, false)"
                >
                  <q-item-section>取消折叠</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
  <cDialog
    :visible="addVisible"
    @close="addVisible = false"
    :title="`${teamKey ? '编辑' : '创建'}小组`"
    :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
  >
    <template #content>
      <div class="teamAdd-container">
        <div class="q-mb-sm">小组名称</div>
        <q-input
          outlined
          v-model="name"
          placeholder="请输入小组名称"
          dense
          class="full-width q-mb-md"
          clearable
        />
        <div class="q-mb-sm">小组属性</div>
        <q-checkbox v-model="isPublic" label="全平台可见" />
        <div class="q-mb-sm">小组简介</div>
        <q-input
          outlined
          v-model="memo"
          placeholder="请输入小组简介"
          dense
          class="full-width q-mb-md"
          type="textarea"
        />
        <div class="q-mb-sm">默认权限</div>
        <q-select
          outlined
          dense
          v-model="defaultRole"
          :options="ROLE_OPTIONS"
          class="full-width q-mb-md"
          emit-value
          map-options
        />
        <div class="q-mb-sm">选择功能块</div>
        <q-option-group v-model="views" :options="viewArray" type="checkbox" />
      </div>
    </template>
    <template #footer>
      <q-btn
        flat
        label="取消"
        color="grey-5"
        @click="addVisible = false"
        :dense="true" />
      <q-btn label="确认" color="primary" @click="updateTeam"
    /></template>
  </cDialog>
  <cDialog
    :visible="memberVisible"
    @close="memberVisible = false"
    title="成员"
    :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
  >
    <template #content><member /></template>
  </cDialog>
</template>
<style scoped lang="scss">
.teamMenu {
  @include p-number(0px, 10px);
  .teamMenu-title {
    width: 100%;
    height: 40px;
    font-weight: bold;
    font-size: 18px;
    @include flex(space-between, center, null);
  }
  .teamMenu-list {
    .teamMenu-item {
      width: 100%;
      height: 30px;
      padding-left: 10px;
      box-sizing: border-box;
      margin-bottom: 10px;
      @include flex(space-between, center, null);
    }
  }
}
.teamAdd-container {
  width: 100%;
  height: 70vh;
  padding: 15px 34px;
  box-sizing: border-box;
  @include scroll();
}
</style>
<style></style>
