<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import TeamTaskTree from "../team/tab/teamTaskTree.vue";
</script>
<template>
  <div class="task">
    <cHeader title="事务" />
    <div class="task-box">
      <TeamTaskTree type="resouce" />
    </div>
  </div>
</template>
<style scoped lang="scss">
.task {
  width: 100%;
  height: 100%;
  .task-box {
    width: 100%;
    height: calc(100% - 65px);
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
