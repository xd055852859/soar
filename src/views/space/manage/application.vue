<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
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
    required: true,
    label: "名称",
    align: "name",
  },
  {
    name: "type",
    align: "center",
    label: "人数",
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
</script>
<template>
  <div class="application">
    <cHeader title="应用配置" />
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
          <q-td key="icon" :props="props">
            <q-avatar color="#fff" size="lg">
              <img :src="props.row.icon" />
            </q-avatar>
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="isOpen" :props="props">
            <q-checkbox v-model="props.row.isOpen" />
          </q-td>
          <q-td key="isDefault" :props="props">
            <q-checkbox v-model="props.row.isDefault" />
          </q-td>
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
