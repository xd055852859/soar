<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import _ from "lodash";
import { storeToRefs } from "pinia";
const { spaceKey, spaceRole } = storeToRefs(appStore.spaceStore);
// const { getLockList } = appStore.spaceStore;
const applicationList = ref<any>([]);
const columns: any = [
  {
    name: "icon",
    label: "图标",
    align: "center",
    field: "icon",
  },
  {
    name: "name",
    align: "center",
    label: "名称",
    field: "name",
  },
  {
    name: "type",
    align: "center",
    label: "类型",
    field: "type",
  },
  {
    name: "isOpen",
    align: "center",
    label: "开启(成员可见)",
    field: "isOpen",
  },
  {
    name: "isDefault",
    align: "center",
    label: "默认启用(出现在首页)",
    field: "isDefault",
  },
];
const getApplicationList = async () => {
  let applicationRes = (await api.request.get("app/team", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (applicationRes.msg === "OK") {
    applicationList.value = [...applicationRes.data];
    console.log(applicationList.value);
  }
};
// const addApplication = async () => {
//   let departmentRes = (await api.request.post("app", {
//     icon: "apiTable",
//     name: "维格表",
//     enName: "apiTable",
//     appType: "",
//   })) as ResultProps;
//   if (departmentRes.msg === "OK") {
//   }
// };

const updateApplication = async (value, key, application) => {
  let obj: any = { [key]: value };
  if (key === "isOpen" && !value) {
    obj.isDefault = false;
  }
  let appRes = (await api.request.patch("app/team", {
    teamKey: spaceKey.value,
    appKey: application._key,
    ...obj,
  })) as ResultProps;
  if (appRes.msg === "OK") {
    let applicationIndex = _.findIndex(applicationList.value, {
      _key: application._key,
    });
    if (applicationIndex !== -1) {
      applicationList.value[applicationIndex] = {
        ...applicationList.value[applicationIndex],
        ...obj,
      };
    }
    // getLockList(spaceKey.value);
  }
};
const updateApplicationAll = async (value, key, application) => {
  let obj: any = { [key]: value };
  let appRes = (await api.request.patch("app", {
    appKey: application._key,
    ...obj,
  })) as ResultProps;
  if (appRes.msg === "OK") {
    let applicationIndex = _.findIndex(applicationList.value, {
      _key: application._key,
    });
    if (applicationIndex !== -1) {
      applicationList.value[applicationIndex] = {
        ...applicationList.value[applicationIndex],
        ...obj,
      };
    }
  }
};

watchEffect(() => {
  if (spaceKey.value) {
    getApplicationList();
  }
});
watch(
  applicationList,
  (newList) => {
    console.log(newList);
  },
  { deep: true }
);
</script>
<template>
  <div class="application">
    <cHeader title="应用配置">
      <template #button>
        <!-- <q-btn
          style="color: #1976d2"
          label="修改应用"
          @click="
            updateApplicationAll('AI', 'name', {
              _key: '1538755380',
            })
          "
        />-->
        <!-- <q-btn
          style="color: #1976d2"
          label="新增应用"
          @click="addApplication()"
        />  -->
      </template>
    </cHeader>
    <div class="application-container">
      <q-table
        :rows="applicationList"
        :columns="columns"
        row-key="_key"
        class="common-table application-table"
        :pagination="{
          rowsPerPage: 20,
        }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="icon" :props="props">
              <Icon :name="props.row.icon" :size="25" />
            </q-td>
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="type" :props="props">
              {{ props.row.type }}
            </q-td>
            <q-td key="isOpen" :props="props">
              <q-checkbox
                v-model="props.row.isOpen"
                :disable="spaceRole > 1"
                @click.native="
                  updateApplication(props.row.isOpen, 'isOpen', props.row)
                "
              />
            </q-td>
            <q-td key="isDefault" :props="props">
              <q-checkbox
                v-model="props.row.isDefault"
                :disable="!props.row.isOpen || spaceRole > 1"
                @click.native="
                  updateApplication(props.row.isDefault, 'isDefault', props.row)
                "
              />
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>
<style scoped lang="scss">
.application {
  width: 100%;
  height: 100%;
  .application-container {
    width: 100%;
    height: calc(100% - 75px);
    @include p-number(15px, 25px);
  }

  .application-table {
    height: 100%;
  }
}
</style>
<style></style>
