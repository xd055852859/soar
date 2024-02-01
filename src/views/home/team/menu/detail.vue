<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
const { targetTeamKey, targetTeamInfo, teamKey, teamList, teamInfo } =
  storeToRefs(appStore.teamStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setTeamKey, setTeamList, setTeamInfo } = appStore.teamStore;
const props = defineProps<{
  type: string;
  visible: boolean;
  state: boolean;
}>();
const emits = defineEmits<{
  (e: "close"): void;
}>();
const menuTeamInfo = ref<any>(null);
const menuTeamKey = ref<any>("");
const name = ref<string>("新小组");
const isPublic = ref<boolean>(true);
const defaultRole = ref<number>(3);
const memo = ref<string>("");
// const overKey = ref<string>("");
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
  if (props.state) {
    let teamRes = (await api.request.patch("project", {
      projectKey: menuTeamKey.value,
      ...obj,
    })) as ResultProps;
    if (teamRes.msg === "OK") {
      let list = _.cloneDeep(teamList.value);
      setMessage("success", "编辑小组成功");
      let index = _.findIndex(list, { _key: menuTeamKey.value });
      if (index !== -1) {
        list[index] = {
          ...list[index],
          name: name.value,
        };
        menuTeamInfo.value = {
          ...menuTeamInfo.value,
          ...teamRes.data,
        };
        setTeamList(list);
        if (props.type === "target") {
          setTeamInfo(menuTeamInfo.value, "target");
        } else {
          setTeamInfo(menuTeamInfo.value);
        }
      }
      emits("close");
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
      emits("close");
    }
  }
};
watchEffect(() => {
  if (views.value.length === 0) {
    views.value = ["taskTree", "doc", "file"];
  }
});
watchEffect(() => {
  if (props.state) {
    if (props.type === "target") {
      menuTeamInfo.value = _.cloneDeep(targetTeamInfo.value);
    } else {
      menuTeamInfo.value = _.cloneDeep(teamInfo.value);
    }
    if (menuTeamInfo.value) {
      menuTeamKey.value = menuTeamInfo.value._key;
      name.value = menuTeamInfo.value.name;
      isPublic.value = menuTeamInfo.value.isPublic;
      defaultRole.value = menuTeamInfo.value.defaultRole;
      memo.value = menuTeamInfo.value.memo;
      views.value = menuTeamInfo.value.views;
    }
  } else {
    menuTeamKey.value = "";
    name.value = "新小组";
    isPublic.value = true;
    defaultRole.value = 3;
    memo.value = "";
    views.value = ["taskTree", "knowledgeBase", "doc", "file"];
  }
});
</script>
<template>
  <c-dialog
    :visible="visible"
    @close="emits('close')"
    :title="`${state ? '编辑' : '创建'}小组`"
    :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
  >
    <template #content>
      <div class="teamAdd-container">
        <div class="q-mb-sm teamAdd-title">小组名称</div>
        <q-input
          outlined
          v-model="name"
          placeholder="请输入小组名称"
          dense
          class="full-width q-mb-md"
          clearable
        />
        <div class="q-mb-sm teamAdd-title">小组属性</div>
        <q-checkbox v-model="isPublic" label="空间内小组名公开" />
        <div class="q-mb-sm teamAdd-title">小组简介</div>
        <q-input
          outlined
          v-model="memo"
          placeholder="请输入小组简介"
          dense
          class="full-width q-mb-md"
          type="textarea"
        />
        <div class="q-mb-sm teamAdd-title">默认权限</div>
        <q-select
          outlined
          dense
          v-model="defaultRole"
          :options="
            ROLE_OPTIONS.slice(menuTeamInfo.role + 1, ROLE_OPTIONS.length)
          "
          class="full-width q-mb-md"
          emit-value
          map-options
        />
        <div class="q-mb-sm teamAdd-title">选择功能块</div>
        <q-option-group v-model="views" :options="viewArray" type="checkbox" />
      </div>
    </template>
    <template #footer>
      <q-btn
        flat
        label="取消"
        color="grey-5"
        @click="emits('close')"
        :dense="true" />
      <q-btn label="确认" color="primary" @click="updateTeam"
    /></template>
  </c-dialog>
</template>
<style scoped lang="scss">
.teamAdd-container {
  width: 100%;
  height: 70vh;
  padding: 15px 34px;
  box-sizing: border-box;
  @include scroll();
  .teamAdd-title {
    font-weight: bolder;
    font-size: 16px;
  }
}
</style>
<style></style>
