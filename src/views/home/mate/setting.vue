<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
const { user } = storeToRefs(appStore.authStore);
const { spaceMemberList, spaceKey } = storeToRefs(appStore.spaceStore);
const { setSpaceMemberList } = appStore.spaceStore;
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
    name: "mobile",
    align: "center",
    label: "手机号",
    field: "mobile",
  },
  {
    name: "operate",
    align: "center",
    label: "操作",
    field: "operate",
  },
];
const addMate = async (userKey) => {
  const setRes = (await api.request.post("teamMate", {
    teamKey: spaceKey.value,
    mateKey: userKey,
  })) as ResultProps;
  if (setRes.msg === "OK") {
    let list = _.cloneDeep(spaceMemberList.value);
    setMessage("success", "添加队友成功");
    let index = _.findIndex(spaceMemberList.value, { userKey: userKey });
    console.log(index);
    if (index !== -1) {
      list[index] = { ...list[index], beMate: true };
    }
    setSpaceMemberList(list);
  }
};
const removeMate = async (userKey) => {
  const setRes = (await api.request.delete("teamMate", {
    teamKey: spaceKey.value,
    mateKey: userKey,
  })) as ResultProps;
  if (setRes.msg === "OK") {
    let list = _.cloneDeep(spaceMemberList.value);
    setMessage("success", "删除队友成功");
    let index = _.findIndex(spaceMemberList.value, { userKey: userKey });
    if (index !== -1) {
      list[index] = { ...list[index], beMate: false };
    }
    setSpaceMemberList(list);
  }
};
</script>
<template>
  <div class="setting">
    <cHeader title="通讯录" backPath="/home/mate" />
    <div class="setting-container">
      <q-table
        :rows="spaceMemberList.filter(item => item.userKey !== user!._key)"
        :columns="columns"
        row-key="_key"
        class="common-table member-table"
        :pagination="{
          rowsPerPage: 20,
        }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="userAvatar" :props="props" style="width: 100px">
              <q-avatar color="#fff" size="lg">
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

            <q-td key="mobile" :props="props" style="width: 200px">
              {{ props.row.mobile }}
            </q-td>

            <q-td key="operate" :props="props" style="width: 100px">
              <q-btn
                flat
                label="添加"
                color="primary"
                @click="addMate(props.row.userKey)"
                v-if="!props.row.beMate"
              />
              <q-btn
                flat
                label="移除"
                color="grey-5"
                @click="removeMate(props.row.userKey)"
                v-else-if="props.row.beMate && props.row.userKey !== user?._key"
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.setting {
  width: 100%;
  height: 100%;

  .setting-container {
    width: 100%;
    height: calc(100% - 65px);
    @include p-number(15px, 25px);
  }
  .setting-table {
    height: 100%;
  }
}
</style>
<style></style>
