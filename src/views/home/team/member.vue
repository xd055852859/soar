<script setup lang="ts">
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { useQuasar } from "quasar";
import { setMessage } from "@/services/util/common";
const { teamMemberList, teamInfo, teamKey } = storeToRefs(appStore.teamStore);
const { spaceMemberList, spaceRole } = storeToRefs(appStore.spaceStore);
const { setTeamMemberList } = appStore.teamStore;
const $q = useQuasar();
const searchMemberList = ref<any>([]);
const searchName = ref<string>("");
const chooseKey = ref<string>("");

const addMember = async (index) => {
  let list = _.cloneDeep(searchMemberList.value);
  const memberRes = (await api.request.post("projectMember", {
    projectKey: teamKey.value,
    memberKey: list[index].userKey,
    role: teamInfo.value?.defaultRole,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    setMessage("success", "添加协作者成功");
    let list = _.cloneDeep(searchMemberList.value);
    let memberlist = _.cloneDeep(teamMemberList.value);
    list[index].role = teamInfo.value?.defaultRole;
    memberlist.push(list[index]);
    setTeamMemberList(memberlist);
    list.splice(index, 1);
    searchMemberList.value = [...list];
  }
};
const changeRole = async (val, index) => {
  let list = _.cloneDeep(teamMemberList.value);
  const roleRes = (await api.request.patch("projectMember/role", {
    projectKey: teamKey.value,
    memberKey: list[index].userKey,
    newRole: val,
  })) as ResultProps;
  if (roleRes.msg === "OK") {
    list[index].role = val;
    setTeamMemberList(list);
  }
};
const deleteMember = async (index) => {
  $q.dialog({
    title: "删除协作者",
    message: "是否删除该协作者",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk(async () => {
    const teamRes = (await api.request.delete("projectMember", {
      projectKey: teamKey.value,
      memberKeyArr: [teamMemberList.value[index].userKey],
    })) as ResultProps;
    if (teamRes.msg === "OK") {
      let list = _.cloneDeep(teamMemberList.value);
      setMessage("success", "删除协作者成功");
      list.splice(index, 1);
      setTeamMemberList(list);
    }
  });
};
watch(
  [searchName, teamMemberList],
  ([newName, newList]) => {
    let memberList: any = [];
    spaceMemberList.value.forEach((spaceItem) => {
      if (
        newList.findIndex((item) => item.userKey === spaceItem.userKey) === -1
      ) {
        memberList.push(spaceItem);
      }
    });
    if (newName) {
      // let list = _.cloneDeep(searchMemberList);
      memberList = memberList.filter((item) => {
        return item.userName && item.userName.indexOf(newName) !== -1;
      });
    }
    searchMemberList.value = memberList;
  },
  { immediate: true }
);
</script>
<template>
  <div class="member" v-if="teamMemberList.length > 0">
    <div class="member-title">已添加的协作者</div>
    <div
      class="member-item"
      v-for="(item, memberIndex) in teamMemberList"
      :key="`board${item.userKey}`"
      @mouseenter="chooseKey = item._key"
    >
      <div class="member-item-left">
        <q-avatar color="primary" text-color="white" size="lg" class="q-mr-sm">
          <img
            :src="
              item?.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
            "
          />
        </q-avatar>
        <div class="member-item-nickName">{{ item.userName }}</div>
      </div>
      <div class="member-item-role icon-point">
        <q-btn flat :label="ROLE_OPTIONS[item.role].label" color="grey-9" />
        <q-menu class="q-pa-sm" v-if="spaceRole < item.role">
          <q-list dense>
            <q-item
              clickable
              v-close-popup
              v-for="(item, index) in ROLE_OPTIONS"
              :key="`role${index}`"
              @click="changeRole(item.value, memberIndex)"
            >
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
              @click="deleteMember(memberIndex)"
              class="q-mt-sm"
            >
              <q-item-section class="text-weight-thin">删除</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
    <q-input
      dense
      outlined
      v-model="searchName"
      label="空间用户名"
      class="full-width q-my-md"
    >
      <template v-slot:prepend>
        <q-icon name="search" />
      </template>
    </q-input>
    <div class="member-title">空间成员</div>
    <template v-if="searchMemberList.length > 0">
      <div
        v-for="(item, index) in searchMemberList"
        class="member-item"
        :key="`search${item.userKey}`"
      >
        <div class="member-item-left" style="width: calc(100% - 120px)">
          <q-avatar color="primary" text-color="white" size="lg">
            <img
              :src="
                item?.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
              "
            />
          </q-avatar>
          <div class="member-item-nickName">{{ item.userName }}</div>
        </div>
        <q-btn flat label="+ 协作" color="primary" @click="addMember(index)" />
      </div>
    </template>
    <!-- <div class="search" v-else>无数据</div> -->
  </div>
</template>
<style scoped lang="scss">
.member {
  width: 100%;
  height: 70vh;
  padding: 0px 10px;
  box-sizing: border-box;
  @include scroll();
  .member-title {
    color: #606266;
    font-size: 12px;
    margin: 10px 0px 25px 0px;
  }
  .member-item {
    width: 100%;
    height: 40px;
    margin-bottom: 10px;
    font-size: 14px;
    @include flex(space-between, center, null);
    .member-item-left {
      height: 60px;
      @include flex(flex-start, center, null);
      .member-item-avatar {
        width: 35px;
        height: 35px;
        overflow: hidden;
        margin-right: 8px;
        border-radius: 50%;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .member-item-nickName {
        // width: 150px;
        height: 40px;
        color: #000000;
        line-height: 40px;
      }
    }
    .member-item-button {
      width: 40px;
      display: none;
    }
    &:hover {
      .member-item-button {
        @include flex(center, center, null);
      }
    }
    .member-item-role {
      color: #606266;
      @include flex(flex-start, center, null);
    }
  }
}
</style>
<style></style>
