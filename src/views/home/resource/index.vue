<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import TeamDoc from "@/views/home/team/tab/teamDoc.vue";
import TeamFile from "@/views/home/team/tab/teamFile.vue";
import Recent from "@/views/home/team/tab/recent.vue";
const resourceTab = ref<string>("doc");
</script>
<template>
  <div class="resource">
    <cHeader title="资源" />
    <q-tabs
      v-model="resourceTab"
      dense
      align="left"
      indicator-color="primary"
      active-class="text-primary"
      class="q-mx-md"
    >
      <!-- <q-tab name="all" label="全部" /> -->
      <q-tab name="doc" label="文档" />
      <q-tab name="file" label="文件" />
      <!-- <q-tab name="mails" label="知识库" /> -->
      <!-- <q-tab name="mails" label="多维表" /> -->
      <!-- <q-tab name="mails" label="洞察" /> -->
    </q-tabs>
    <div class="resource-box">
      <!-- <Recent v-if="resourceTab === 'all'" type="resouce" /> -->
      <TeamDoc v-if="resourceTab === 'doc'" type="resouce" />
      <TeamFile v-else-if="resourceTab === 'file'" type="resouce" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.resource {
  width: 100%;
  height: 100%;
  .resource-box {
    width: 100%;
    height: calc(100% - 105px);
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
