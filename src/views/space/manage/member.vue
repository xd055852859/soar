<script setup lang="ts">
import cDialog from "@/components/common/cDialog.vue";
import cHeader from "@/components/common/cHeader.vue";
import { ROLE_OPTIONS, ResultProps } from "@/interface/Common";
import { SpaceMember } from "@/interface/Space";
import _ from "lodash";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
const { spaceKey, spaceRole, spaceMemberList, spaceList } = storeToRefs(
  appStore.spaceStore
);
const { setSpaceMemberList } = appStore.spaceStore;
const $q = useQuasar();
const memberList = ref<SpaceMember[]>([]);
const searchList = ref<any>([]);
const searchName = ref<string>("");
const addVisible = ref<boolean>(false);
const memberInput = ref<string>("");
const deleteVisible = ref<boolean>(false);
const columns: any = [
  {
    name: "userAvatar",
    label: "头像",
    align: "center",
    field: "userAvatar",
  },
  {
    name: "userName",
    required: true,
    label: "用户名",
    align: "center",
    field: "userName",
  },
  {
    name: "nickName",
    align: "center",
    label: "昵称",
    field: "nickName",
    style: "width: 200px",
  },
  {
    name: "post",
    align: "center",
    label: "职位头衔",
    field: "post",
  },
  {
    name: "mobile",
    align: "center",
    label: "账号",
    field: "mobile",
  },
  {
    name: "role",
    align: "center",
    label: "权限",
    field: "role",
  },
  {
    name: "operate",
    align: "center",
    label: "操作",
    field: "operate",
  },
];
const getSpaceMemberList = async () => {
  let memberRes = (await api.request.get("teamMember", {
    teamKey: spaceKey.value,
    keyWord: searchName.value,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    memberList.value = [...memberRes.data];
  }
};
const searchUser = async () => {
  const searchRes = (await api.request.get("user/search", {
    keyWord: memberInput.value,
  })) as ResultProps;
  if (searchRes.msg === "OK") {
    searchList.value = searchRes.data;
  }
};
const updateMember = async (value, key, member) => {
  let obj: any = { [key]: value };
  let memberRes = (await api.request.patch("teamMember", {
    teamKey: spaceKey.value,
    memberKey: member.userKey,
    ...obj,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
  }
};
const addMember = async (memberKey) => {
  const memberRes = (await api.request.post("teamMember", {
    teamKey: spaceKey.value,
    memberKey: memberKey,
    role: 3,
  })) as ResultProps;
  if (memberRes.msg === "OK") {
    let list = _.cloneDeep(spaceMemberList.value);
    setMessage("success", "添加成员成功");
    memberList.value.push(memberRes.data);
    list.push(memberRes.data);
    setSpaceMemberList(list);
    addVisible.value = false;
    memberInput.value = "";
  }
};
const deleteMember = (memberKey) => {
  $q.dialog({
    title: "删除成员",
    message: "是否确认删除该成员",
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      const memberRes = (await api.request.delete("teamMember", {
        teamKey: spaceKey.value,
        memberKeyArr: [memberKey],
      })) as ResultProps;
      if (memberRes.msg === "OK") {
        let list = _.cloneDeep(spaceMemberList.value);
        setMessage("success", "删除成员成功");
        let memberIndex = _.findIndex(memberList.value, { userKey: memberKey });
        memberIndex !== -1 && memberList.value.splice(memberIndex, 1);
        let index = _.findIndex(list, { userKey: memberKey });
        index !== -1 && list.splice(memberIndex, 1);
        setSpaceMemberList(list);
      }
    })
    .onCancel(() => {});
};
watchEffect(() => {
  if (spaceKey.value) {
    getSpaceMemberList();
  }
});
watch(memberInput, (newName) => {
  if (!newName) {
    searchList.value = [];
  }
});
</script>
<template>
  <div class="member">
    <cHeader title="成员管理" />
    <div class="member-container">
      <div class="row justify-between items-center q-mb-md">
        <q-input
          rounded
          outlined
          v-model="searchName"
          placeholder="搜索用户名或账号"
          dense
          style="width: 250px"
          clearable
          @keyup.enter="getSpaceMemberList()"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space />
        <q-btn
          rounded
          color="primary"
          label="添加成员"
          @click="addVisible = true"
          style="width: 120px"
        />
      </div>
      <q-table
        :rows="memberList"
        :columns="columns"
        row-key="_key"
        class="common-table member-table"
        :pagination="{
          rowsPerPage: 20,
        }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="userAvatar" :props="props">
              <q-avatar color="primary" text-color="white" size="lg">
                <img
                  :src="
                    props.row.userAvatar
                      ? props.row.userAvatar
                      : '/common/defaultPerson.png'
                  "
                />
              </q-avatar>
            </q-td>
            <q-td key="userName" :props="props" style="width: 200px">
              {{ props.row.userName }}
            </q-td>
            <q-td key="nickName" :props="props">
              {{ props.row.nickName }}
              <q-popup-edit
                v-model="props.row.nickName"
                v-slot="scope"
                @save="(value) => updateMember(value, 'nickName', props.row)"
                v-if="spaceRole < props.row.role"
              >
                <q-input
                  outlined
                  v-model="scope.value"
                  label="昵称"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="post" :props="props">
              {{ props.row.post }}
              <q-popup-edit
                v-model="props.row.post"
                v-slot="scope"
                @save="(value) => updateMember(value, 'post', props.row)"
                v-if="spaceRole < props.row.role"
              >
                <q-input
                  outlined
                  v-model="scope.value"
                  label="职位头衔"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="mobile" :props="props">
              {{ props.row.mobile }}
            </q-td>
            <q-td key="role" :props="props">
              {{ ROLE_OPTIONS[props.row.role].label }}
              <q-popup-edit
                v-model="props.row.role"
                v-slot="scope"
                v-if="spaceRole < props.row.role"
                auto-save
                @save="(value) => updateMember(value, 'newRole', props.row)"
              >
                <q-select
                  outlined
                  dense
                  v-model="scope.value"
                  :options="ROLE_OPTIONS"
                  class="full-width q-mb-md"
                  emit-value
                  map-options
                />
              </q-popup-edit>
            </q-td>
            <q-td key="operate" :props="props" style="width: 40px">
              <q-btn
                flat
                label="移除"
                color="grey-5"
                @click="deleteMember(props.row.userKey)"
                v-if="spaceRole < props.row.role"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <cDialog :visible="addVisible" title="搜索用户" @close="addVisible = false">
      <template #content>
        <div class="member-search">
          <div class="member-search-title">
            <q-input
              rounded
              outlined
              v-model="memberInput"
              placeholder="搜索用户名或手机号"
              dense
              class="full-width"
              @keyup.enter="searchUser"
              clearable
            />
          </div>
          <div class="member-search-container">
            <template v-if="searchList.length > 0">
              <div
                class="member-search-item"
                v-for="(item, index) in searchList"
                :key="`search${index}`"
              >
                <div class="member-search-left">
                  <q-avatar color="primary" text-color="white" size="lg">
                    <img
                      :src="
                        item.userAvatar
                          ? item.row.userAvatar
                          : '/common/defaultPerson.png'
                      "
                    />
                  </q-avatar>
                  <div>{{ item.userName }}</div>
                </div>
                <div class="member-search-right">
                  <q-btn
                    flat
                    label="添加"
                    color="primary"
                    @click="addMember(item._key)"
                    :dense="true"
                    v-if="
                      _.findIndex(spaceMemberList, {
                        userKey: item._key,
                      }) === -1
                    "
                  />
                </div>
              </div>
            </template>
            <div class="dp-center-center" :style="{ height: '100%' }" v-else>
              未搜索到尚未加入该空间的系统用户
            </div>
          </div>
        </div>
      </template>
    </cDialog>
  </div>
</template>
<style scoped lang="scss">
.member {
  width: 100%;
  height: 100%;
  .member-container {
    width: 100%;
    height: calc(100% - 65px);
    @include p-number(15px, 25px);
  }
  .member-table {
    height: calc(100% - 65px);
  }
}
.member-search {
  width: 500px;
  .member-search-title {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
  }
  .member-search-container {
    width: 100%;
    height: 50vh;
    @include scroll();
    .member-search-item {
      width: 100%;
      height: 70px;
      @include flex(space-between, center, null);
      .member-search-left {
        @include flex(space-between, center, null);
      }
      .member-search-right {
        height: 100%;
        @include flex(center, center, null);
      }
    }
  }
}
</style>
<style lang="scss"></style>
