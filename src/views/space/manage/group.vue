<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import cHeader from "@/components/common/cHeader.vue";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import Member from "@/views/home/team/menu/member.vue";
import { SpaceMember } from "@/interface/Space";
import _ from "lodash";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
const { spaceKey, spaceRole, spaceMemberList } = storeToRefs(
  appStore.spaceStore
);
const { teamList, targetTeamMemberList } = storeToRefs(appStore.teamStore);
const { setTeamList, setTargetTeamKey } = appStore.teamStore;
const dayjs: any = inject("dayjs");

const $q = useQuasar();
const groupList = ref<SpaceMember[]>([]);
const searchList = ref<any>([]);
const searchName = ref<string>("");
const groupInput = ref<string>("");
const creator = ref<string>("");
const creatorArray = ref<any>([]);
const memberVisible = ref<boolean>(false);
const columns: any = [
  {
    name: "name",
    label: "群组名称",
    align: "center",
    field: "name",
  },
  {
    name: "userName",
    required: true,
    label: "超级管理员",
    align: "center",
  },
  {
    name: "memberCount",
    align: "center",
    label: "人数",
    field: "memberCount",
  },
  {
    name: "cardNum",
    align: "center",
    label: "资源",
    field: "cardNum",
  },
  {
    name: "updateTime",
    align: "center",
    label: "更新时间",
    field: "updateTime",
  },
  {
    name: "operate",
    align: "center",
    label: "操作",
    field: "operate",
  },
];
const getTeamList = async () => {
  let groupRes = (await api.request.get("project/team", {
    teamKey: spaceKey.value,
    name: searchName.value,
    creator: creator.value,
  })) as ResultProps;
  if (groupRes.msg === "OK") {
    groupList.value = [...groupRes.data];
  }
};

const deleteTeam = (groupKey) => {
  $q.dialog({
    title: "删除群组",
    message: "是否确认删除该群组",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const groupRes = (await api.request.delete("project", {
        projectKey: groupKey,
      })) as ResultProps;
      if (groupRes.msg === "OK") {
        let list = _.cloneDeep(teamList.value);
        setMessage("success", "删除群组成功");
        let groupIndex = _.findIndex(groupList.value, { userKey: groupKey });
        groupIndex !== -1 && groupList.value.splice(groupIndex, 1);
        let index = _.findIndex(list, { userKey: groupKey });
        index !== -1 && list.splice(groupIndex, 1);
        setTeamList(list);
      }
    })
    .onCancel(() => {});
};
watchEffect(() => {
  if (spaceKey.value) {
    getTeamList();
  }
});
watch(
  spaceMemberList,
  (newList) => {
    if (newList.length > 0) {
      creatorArray.value = newList.map((item) => {
        return {
          value: item.userKey,
          label: item.userName ? item.userName : "无",
        };
      });
      creatorArray.value.unshift({
        value: "",
        label: "所有成员",
      });
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="group">
    <cHeader title="群组管理" />
    <div class="group-container">
      <div class="row justify-between items-center q-mb-md">
        <q-input
          rounded
          outlined
          v-model="searchName"
          placeholder="请输入群组名称"
          dense
          style="width: 250px"
          clearable
          @keyup.enter="getTeamList()"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-select
          outlined
          dense
          v-model="creator"
          :options="creatorArray"
          emit-value
          map-options
        />
        <!-- <q-btn
          rounded
          color="primary"
          label="添加群组"
          @click="addVisible = true"
          style="width: 120px"
        /> -->
      </div>
      <q-table
        :rows="groupList"
        :columns="columns"
        row-key="_key"
        class="common-table group-table"
        :pagination="{
          rowsPerPage: 20,
        }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="name" :props="props" style="width: 200px">
              {{ props.row.name }}
            </q-td>
            <q-td key="userName" :props="props" style="width: 200px">
              {{ props.row.creatorInfo.userName }}
            </q-td>
            <q-td key="memberCount" :props="props" style="width: 80px">
              {{ props.row.memberCount }}
            </q-td>
            <q-td key="cardNum" :props="props" style="width: 80px">
              {{ props.row.cardNum }}
            </q-td>
            <q-td key="updateTime" :props="props" style="width: 100px">
              {{ dayjs(props.row.updateTime).format("YYYY-MM-DD HH:mm") }}
            </q-td>
            <q-td key="operate" :props="props" style="width: 40px">
              <q-btn
                flat
                label="成员权限"
                color="grey-5"
                @click="
                  setTargetTeamKey(props.row._key);
                  memberVisible = true;
                "
              />
              <q-btn
                flat
                label="移除"
                color="grey-5"
                @click="deleteTeam(props.row._key)"
                v-if="spaceRole === 1"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <cDialog
      :visible="memberVisible"
      @close="memberVisible = false"
      title="成员"
      :dialogStyle="{ width: '700px', maxWidth: '80vw' }"
    >
      <template #content
        ><Member v-if="targetTeamMemberList.length > 0" type="target"
      /></template>
    </cDialog>
  </div>
</template>
<style scoped lang="scss">
.group {
  width: 100%;
  height: 100%;
  .group-container {
    width: 100%;
    height: calc(100% - 75px);
    @include p-number(15px, 25px);
  }
  .group-table {
    height: calc(100% - 65px);
  }
}
.group-search {
  width: 700px;
  .group-search-title {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
  }
  .group-search-container {
    width: 100%;
    height: 50vh;
    @include scroll();
    .group-search-item {
      width: 100%;
      height: 70px;
      @include flex(space-between, center, null);
      .group-search-left {
        @include flex(space-between, center, null);
      }
      .group-search-right {
        height: 100%;
        @include flex(center, center, null);
      }
    }
  }
}
</style>
<style lang="scss"></style>
