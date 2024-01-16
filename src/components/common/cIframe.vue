<script setup lang='ts'>
const props = defineProps<{
    title: string;
    url: string;
}>();
</script>
 <template>
 <div :style="{ position: 'relative', width: '100%', height: '100%' }">
      <iframe
        name="iframe-container"
        class="web-view"
        :title="title"
        :src="url"
        frameBorder="0"
        width="100%"
        height="100%"
        allow="clipboard-read; clipboard-write"
      ></iframe>
    </div>
</template>
<style scoped lang='scss'>
</style>
<style></style>