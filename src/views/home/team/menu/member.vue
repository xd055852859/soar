<script setup lang="ts">
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import api from "@/services/api";
import { useQuasar } from "quasar";
import { setMessage } from "@/services/util/common";
const {
  targetTeamMemberList,
  targetTeamInfo,
  targetTeamKey,
  teamMemberList,
  teamInfo,
  teamKey,
} = storeToRefs(appStore.teamStore);
const { spaceMemberList, spaceRole } = storeToRefs(appStore.spaceStore);
const $q = useQuasar();
const props = defineProps<{
  type: string;
}>();
const memberTeamKey = ref<string>("");
const memberList = ref<any>([]);
const memberTeamKeyInfo = ref<any>([]);
const searchMemberList = ref<any>([]);
const searchName = ref<string>("");
const chooseKey = ref<string>("");

const addMember = async (index) => {
  let list = _.cloneDeep(searchMemberList.value);
  const memberRes = (await api.request.post("projectMember", {
    projectKey: memberTeamKey.value,
    memberKey: list[index].userKey,
    role: memberTeamKeyInfo.value?.defaultRole,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    setMessage("success", "添加协作者成功");
    let list = _.cloneDeep(searchMemberList.value);
    list[index].role = memberTeamKeyInfo.value?.defaultRole;
    memberList.value.push(list[index]);
    // list.splice(index, 1);
    // searchMemberList.value = [...list];
  }
};
const changeRole = async (val, index) => {
  const roleRes = (await api.request.patch("projectMember/role", {
    projectKey: memberTeamKey.value,
    memberKey: memberList.value[index].userKey,
    newRole: val,
  })) as ResultProps;
  if (roleRes.msg === "OK") {
    memberList.value[index].role = val;
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
      projectKey: memberTeamKey.value,
      memberKeyArr: [memberList.value[index].userKey],
    })) as ResultProps;
    if (teamRes.msg === "OK") {
      setMessage("success", "删除协作者成功");
      memberList.value.splice(index, 1);
    }
  });
};
watch(
  [searchName, memberList],
  ([newName, newList]) => {
    console.log(newList);
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
  { immediate: true, deep: true }
);
watch(
  () => props.type,
  (newType) => {
    if (newType === "target") {
      memberTeamKey.value = targetTeamKey.value;
      memberTeamKeyInfo.value = targetTeamInfo.value;
      memberList.value = targetTeamMemberList.value;
    } else {
      memberTeamKey.value = teamKey.value;
      memberTeamKeyInfo.value = teamInfo.value;
      memberList.value = teamMemberList.value;
    }
  },
  { immediate: true }
);
</script>
<template>
  <div class="member" v-if="memberList.length > 0">
    <div class="member-title">已添加的协作者</div>
    <div
      class="member-item"
      v-for="(item, memberIndex) in memberList"
      :key="`board${item.userKey}`"
      @mouseenter="chooseKey = item._key"
    >
      <div class="member-item-left">
        <q-avatar color="primary" size="lg" class="q-mr-sm">
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
              v-for="(item, index) in ROLE_OPTIONS.slice(
                1,
                ROLE_OPTIONS.length
              )"
              :key="`role${index}`"
              @click="changeRole(item.value, memberIndex)"
            >
              <q-item-section class="common-title">{{
                item.label
              }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
              @click="deleteMember(memberIndex)"
              class="q-mt-sm"
            >
              <q-item-section class="text-weight-thin common-title"
                >删除</q-item-section
              >
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
          <q-avatar color="primary" size="lg" class="q-mr-sm">
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
    font-size: 20px;
    margin: 10px 0px 25px 0px;
  }
  .member-item {
    width: 100%;
    /* prettier-ignore */
    height: 40Px;
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
        height: 50px;
        color: #000000;
        line-height: 40px;
        font-size: 20px;
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
