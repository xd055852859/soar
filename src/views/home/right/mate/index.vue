<script setup lang="ts">
import appStore from "@/store";
import CHeader from "@/components/common/cHeader.vue";
import { storeToRefs } from "pinia";
const { setMateKey, getMateList } = appStore.mateStore;
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const props = defineProps<{
  mateKey: string;
}>();
watch(
  () => props.mateKey,
  (newKey) => {
    if (newKey) {
      setMateKey(newKey);
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="mate">
    <c-header noTitle>
      <template #subtitle>
        <div class="dp--center" v-if="mateInfo">
          <q-avatar color="#fff" size="35px" class="q-mr-sm">
            <img
              :src="
                mateInfo.userAvatar
                  ? mateInfo.userAvatar
                  : '/common/defaultPerson.png'
              "
              alt=""
            />
          </q-avatar>
          {{ mateInfo.userName }}
          <q-icon name="keyboard_arrow_down" size="28px" />
          <q-menu style="width: 348px; padding: 10px 0">
            <q-list>
              <q-item
                v-for="(item, index) in mateList"
                :key="`mate${index}`"
                clickable
                v-close-popup
                @click="setMateKey(item._key)"
              >
                <q-avatar color="#fff" size="35px" class="q-mr-sm">
                  <img
                    :src="
                      item.userAvatar
                        ? item.userAvatar
                        : '/common/defaultPerson.png'
                    "
                    alt=""
                  />
                </q-avatar>
                <div>
                  {{ item.userName }}
                </div>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </template>
    </c-header>

    <router-view></router-view>
    <div class="mate-button">
      <div @click="$router.push({ name: 'mateChat' })">聊天</div>
      <div @click="$router.push({ name: 'mateScore' })">执行力</div>
      <div @click="$router.push({ name: 'mateTask' })">群组</div>
      <div @click="$router.push({ name: 'mateTreeTask' })">任务</div>
      <div @click="$router.push({ name: 'mateChart' })">图表</div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mate {
  width: 100%;
  height: 100%;
  .mate-button {
    width: 50px;
    height: 250px;
    position: fixed;
    z-index: 2;
    right: 10px;
    top: 10px;
  }
}
</style>
<style></style>
