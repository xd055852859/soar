<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
import cHeader from "@/components/common/cHeader.vue";
import cDialog from "@/components/common/cDialog.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import _ from "lodash";
import { useQuasar } from "quasar";
import { formatData } from "@/services/util/data";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { setMessage } from "@/services/util/common";
import { statusArray } from "@/services/config/config";
const $q = useQuasar();
const { spaceKey, spaceInfo } = storeToRefs(appStore.spaceStore);
const { departmentList, departmentTree, departmentInfo } = storeToRefs(
  appStore.departmentStore,
);
const { setDepartmentTree, getDepartmentInfo } = appStore.departmentStore;
const departmentMemberList = ref<any>([]);

const departmentKey = ref<string>("");
const moveDepartmentKey = ref<string>("");
const dragDepartmentKey = ref<string>("");
const departmentName = ref<string>("");
const departmentRef = ref(null);
const departmentVisible = ref<boolean>(false);
const departmentMemberKey = ref<string>("");
const departmentMemberIndex = ref<number>(-1);
const dataepartmentMemberRef = ref(null);
const departmentMemberName = ref<string>("");
const activeStatus = ref<number>(1);
const showAll = ref<boolean>(true);
const notActiveNum = ref<number>(0);
const chooseDepartmentKeyList = ref<string[]>([]);
const dragId = ref<string>("");
const dropId = ref<string>("");

const columns: any = [
  {
    name: "name",
    required: true,
    label: "姓名",
    align: "center",
    field: "name",
  },
  {
    name: "post",
    align: "center",
    label: "职位",
    field: "post",
  },
  {
    name: "activeStatus",
    align: "center",
    label: "账号状态",
    field: "activeStatus",
    style: "width: 200px",
  },

  {
    name: "department",
    align: "center",
    label: "部门",
    field: "department",
  },
  {
    name: "operate",
    align: "center",
    label: "操作",
    field: "operate",
  },
];

const addDepartment = async () => {
  if (!departmentKey.value) {
    setMessage("error", "请选择部门节点");
    return;
  }
  $q.dialog({
    title: "新增部门",
    message: "请输入10字以内的部门名",
    prompt: {
      model: "",
      type: "text", // optional
      isValid: (val) => val.length > 0 && val.length < 11, // << here is the magic
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk(async (data) => {
    if (data) {
      let departmentRes = (await api.request.post("department", {
        teamKey: spaceKey.value,
        fatherId: departmentKey.value,
        name: data,
      })) as ResultProps;
      if (departmentRes.msg === "OK") {
        setMessage("success", "新增部门成功");
        let newTree = { ...departmentTree.value };
        newTree[departmentRes.data._key] = { ...departmentRes.data };
        newTree[departmentRes.data.father].sortList.push(
          departmentRes.data._key,
        );
        setDepartmentTree(newTree, true);
      }
    }
  });
};
const updateDepartment = async (item) => {
  // departmentKey.value = item._key;
  $q.dialog({
    title: "编辑部门",
    prompt: {
      model: item.name,
      type: "text", // optional
    },
    cancel: {
      color: "grey-5",
      flat: true,
    },
  }).onOk(async (data) => {
    let departmentRes = (await api.request.patch("department", {
      departmentKey: item._key,
      name: data,
    })) as ResultProps;
    if (departmentRes.msg === "OK") {
      setMessage("success", "编辑部门成功");
      let newTree = { ...departmentTree.value };
      newTree[item._key].name = data;
      setDepartmentTree(newTree, true);
    }
  });
};
const deleteDepartment = async (item) => {
  $q.dialog({
    title: "删除部门",
    message: `是否删除部门 ${item.label}`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("department", {
        departmentKey: item._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", "删除成功");
        let newTree = { ...departmentTree.value };
        let fatherKey = newTree[item._key].father;
        let index = newTree[fatherKey].sortList.indexOf(item._key);
        if (index !== -1) {
          newTree[fatherKey].sortList.splice(index, 1);
          delete newTree[item._key];
          setDepartmentTree(newTree, true);
          departmentKey.value = fatherKey;
        }
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const chooseDepartment = async () => {
  getDepartmentInfo(departmentKey.value);
  let departmentRes = (await api.request.get("department/member", {
    departmentKey: departmentKey.value,
    activeStatus: activeStatus.value,
    showAll: !showAll.value,
  })) as ResultProps;
  if (departmentRes.msg === "OK") {
    departmentMemberList.value = [...departmentRes.data];
    //@ts-ignore
    notActiveNum.value = departmentRes.notActiveNum;
  }
};
const chooseDepartmentMember = (item, index) => {
  departmentMemberKey.value = item._key;
  departmentMemberIndex.value = index;
  chooseDepartmentKeyList.value = item.department.map((item) => {
    return item._key;
  });
  departmentVisible.value = true;
};
const changeDepartment = async () => {
  if (chooseDepartmentKeyList.value.length === 0) {
    chooseDepartmentKeyList.value = [spaceInfo.value!.rootDepartment!];
  }
  let departmentRes = (await api.request.patch("department/member", {
    teamKey: spaceKey.value,
    memberKey: departmentMemberKey.value,
    departmentKeyArr: chooseDepartmentKeyList.value,
  })) as ResultProps;
  if (departmentRes.msg === "OK") {
    // if (chooseDepartmentKeyList.value.indexOf(departmentKey.value) === -1) {
    //   departmentMemberList.value.splice(departmentMemberIndex.value, 1);
    // }else{
    chooseDepartment();
    // }
    departmentVisible.value = false;
  }
};
const handleDragStart = (e) => {
  dragId.value = e.currentTarget.id;
  console.log(e.currentTarget.id);
};

const handleDragOver = (e) => {
  e.preventDefault();
  dragDepartmentKey.value = e.currentTarget.id;
};

const handleDrop = async (e) => {
  dropId.value = e.currentTarget.id;
  // 根据需要处理拖放逻辑，将节点插入到新的位置
  let departmentRes = (await api.request.patch("department/drag", {
    departmentKey: dragId.value,
    targetDepartmentKey: dropId.value,
    type: "child",
  })) as ResultProps;
  if (departmentRes.msg === "OK") {
    let newTree = { ...departmentTree.value };
    let oldFatherKey = newTree[dragId.value].father;
    let index = newTree[oldFatherKey].sortList.indexOf(dragId.value);
    if (index !== -1) {
      newTree[oldFatherKey].sortList.splice(index, 1);
      newTree[dropId.value].sortList.push(dragId.value);
      newTree[dragId.value].father = dropId.value;
      setDepartmentTree(newTree, true);
    }
  }
};

const handleDragEnd = (e) => {
  // 清理拖动操作
  dragDepartmentKey.value = "";
};
watch(
  spaceInfo,
  (newInfo) => {
    if (newInfo?.rootDepartment) {
      departmentKey.value = newInfo.rootDepartment;
    }
  },
  { immediate: true },
);
watchEffect(() => {
  if (departmentKey.value) {
    chooseDepartment();
  }
});
</script>
<template>
  <div class="department">
    <cHeader title="组织结构" />
    <div class="department-container">
      <div class="department-left">
        <div class="department-left-search small-input">
          <q-input
            rounded
            dense
            outlined
            ref="departmentRef"
            v-model="departmentName"
            style="width: calc(100% - 40px)"
            color="primary"
            placeholder="请输入部门名"
          />
          <q-btn flat round @click="addDepartment()">
            <Icon name="a-chuangjian2" :size="20" />
          </q-btn>
        </div>
        <div class="department-left-tree">
          <q-tree
            :nodes="departmentList"
            node-key="key"
            no-connectors
            default-expand-all
            no-transition
            no-nodes-label="当前无部门"
            no-results-label="未找到匹配的部门"
            :filter="departmentName"
            style="width: 100%"
            v-if="departmentList && spaceInfo"
          >
            <template v-slot:default-header="prop">
              <div
                class="row items-center justify-between full-width department-item icon-point"
                @click.stop="departmentKey = prop.node._key"
                :style="
                  departmentKey === prop.node._key
                    ? { color: '#07be51' }
                    : dragDepartmentKey === prop.node._key
                      ? { border: '1px solid #07be51' }
                      : {}
                "
                :id="prop.node._key"
                @mouseenter="moveDepartmentKey = prop.node._key"
                :draggable="true"
                @dragstart="handleDragStart"
                @dragend="handleDragEnd"
                @dragover="handleDragOver"
                @drop="handleDrop"
              >
                <div class="department-item-title">
                  <q-avatar
                    rounded
                    color="#fff"
                    size="sm"
                    class="q-mr-sm"
                    v-if="prop.node._key === spaceInfo?.rootDepartment"
                  >
                    <img
                      :src="
                        spaceInfo?.logo
                          ? spaceInfo.logo
                          : '/common/defaultGroup.png'
                      "
                    />
                  </q-avatar>
                  {{
                    prop.node._key === spaceInfo?.rootDepartment
                      ? spaceInfo.name
                      : prop.node.label
                  }}
                </div>
                <div
                  class="department-item-icon"
                  v-if="
                    moveDepartmentKey === prop.node._key &&
                    prop.node._key !== spaceInfo?.rootDepartment
                  "
                >
                  <q-btn round flat size="10px" @click.stop="">
                    <Icon name="gengduo" :size="18" />
                    <q-menu>
                      <q-list dense>
                        <q-item
                          clickable
                          v-close-popup
                          @click="updateDepartment(prop.node)"
                        >
                          <q-item-section>编辑</q-item-section></q-item
                        >
                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteDepartment(prop.node)"
                          ><q-item-section>删除</q-item-section></q-item
                        >
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-tree>
        </div>
      </div>
      <div class="department-right" v-if="departmentInfo && spaceInfo">
        <div class="department-right-title dp--center">
          {{
            departmentInfo._key === spaceInfo?.rootDepartment
              ? spaceInfo.name
              : departmentInfo.name
          }}
          <!-- <div class="text-caption q-ml-md">
            总人数
            {{ departmentMemberList.length }} &nbsp;&nbsp;&nbsp;未激活人数
            {{ notActiveNum }}
          </div> -->
        </div>
        <div class="department-right-set">
          <!-- {{ showAll ? "直属" : "当前" }} -->
          仅展示直属部门成员
          <q-toggle v-model="showAll" color="green" />
          <q-select
            outlined
            v-model="activeStatus"
            :options="statusArray"
            dense
            emit-value
            map-options
          />
        </div>
        <q-table
          :rows="departmentMemberList"
          :columns="columns"
          row-key="_key"
          class="common-table department-right-table"
          :pagination="{
            rowsPerPage: 20,
          }"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props" style="width: 200px">
                {{ props.row.name }}
              </q-td>
              <q-td key="post" :props="props">
                {{ props.row.post }}
              </q-td>
              <q-td key="activeStatus" :props="props">
                {{ statusArray[props.row.activeStatus - 1].label }}
              </q-td>

              <q-td key="department" :props="props">
                <q-chip
                  v-for="(item, index) in props.row.department"
                  :key="`departmentTable${index}`"
                  class="q-mr-sm"
                  size="sm"
                  >{{ item.name }}</q-chip
                >
              </q-td>
              <q-td key="operate" :props="props" style="width: 40px">
                <q-btn
                  flat
                  label="变更部门"
                  color="grey-5"
                  @click="chooseDepartmentMember(props.row, props.rowIndex)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <c-dialog
      :visible="departmentVisible"
      @close="
        departmentVisible = false;
        departmentMemberName = '';
      "
      :title="`设置 ${departmentMemberList[departmentMemberIndex]?.name} 部门`"
      :dialogStyle="{ width: '700px', height: '70vh', maxWidth: '80vw' }"
    >
      <template #content>
        <div class="small-input q-mb-sm" style="width: 100%">
          <q-input
            round
            dense
            outlined
            ref="dataepartmentMemberRef"
            v-model="departmentMemberName"
            color="primary"
            placeholder="搜索部门名"
          />
        </div>
        <div class="department-search-tree">
          <q-tree
            :nodes="departmentList"
            node-key="key"
            no-nodes-label="当前无部门"
            no-results-label="未找到匹配的部门"
            no-connectors
            default-expand-all
            no-transition
            v-model:ticked="chooseDepartmentKeyList"
            tick-strategy="strict"
            :filter="departmentMemberName"
            v-if="departmentList"
          />
        </div>
      </template>
      <template #footer>
        <q-btn
          flat
          label="取消"
          color="grey-5"
          @click="
            departmentVisible = false;
            departmentMemberName = '';
          "
          :dense="true" />
        <q-btn label="确认" color="primary" @click="changeDepartment"
      /></template>
    </c-dialog>
  </div>
</template>
<style scoped lang="scss">
.department {
  width: 100%;
  height: 100%;
  .department-container {
    width: 100%;
    height: calc(100% - 75px);
    padding-right: 25px;
    box-sizing: border-box;
    @include flex(space-between, center, null);
    .department-left {
      width: 300px;
      height: 100%;
      @include p-number(5px, 10px);
      .department-left-search {
        width: 100%;
        height: 30px;

        @include flex(space-between, center, null);
      }
      .department-left-tree {
        width: 100%;
        // min-height:0px;
        height: calc(100% - 40px);
        margin-top: 10px;
        // align-content: flex-start;
        @include scroll();
        @include flex(flex-start, flex-start, null);
        .department-item {
          width: 100%;
          height: 30px;
          padding-left: 5px;
          box-sizing: border-box;
        }
      }
    }
    .department-right {
      width: calc(100% - 300px);
      height: 100%;
      .department-right-title {
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        margin-bottom: 5px;
      }
      .department-right-set {
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        margin-bottom: 15px;
        @include flex(flex-start, center, null);
      }
      .department-right-table {
        height: calc(100% - 100px);
      }
    }
  }
}
.department-search-tree {
  width: 100%;
  height: calc(70vh - 180px);
  @include scroll;
}
</style>
<style lang="scss"></style>
