<script lang="ts" setup>
const props = defineProps<{
  title: string;
}>();
</script>
<template>
  <div class="empty-box">
    <div class="empty-img">
      <img src="/empty.png" alt="" />
      <div class="empty-title">{{ title }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.empty-box {
  width: 100%;
  height: 100%;
  @include flex(center, center, null);
  .empty-img {
    width: 60%;
    max-width: 250px;
    img {
      width: 100%;
    }
    .empty-title {
      width: 100%;
      font-size: 14px;
      text-align: center;
      color: $grey-6;
      margin-top: 10px;
    }
  }
}
</style>
