<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { formatData } from "@/services/util/data";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const boardList = ref<any>([]);
const planTag = ref<string>("");
const relationType = ref<number>(1);
const getTaskBoardList = async () => {
  let taskBoardRes = (await api.request.get("task/board", {
    teamKey: spaceKey.value,
    relationType: relationType.value,
    planTag: planTag.value,
  })) as ResultProps;
  if (taskBoardRes.msg === "OK") {
    boardList.value = taskBoardRes.data.map((item) => {
      item.tree = [formatData(item.nodes, item.rootKey)];
      console.log(item.list);
      return item;
    });
    console.log(boardList.value);
  }
};
watchEffect(() => {
  getTaskBoardList();
});
</script>
<template>
  <div class="taskBoard">
    <cHeader title="任务池" />
    <q-tabs
      dense
      align="left"
      indicator-color="primary"
      active-class="text-primary"
      class="q-mx-md"
      v-model="planTag"
    >
      <q-tab label="全部" name="" />
      <q-tab label="今日" name="today" />
      <q-tab label="明日" name="tomorrow" />
      <q-tab label="本周截止" name="weekend" />
      <q-tab label="本月截止" name="monthend" />
      <q-tab label="未来" name="future" />
    </q-tabs>
    <div class="taskBoard-box">
      <template v-for="(item, index) in boardList" :key="`taskTree${index}`">
        <q-card class="q-mb-md">
          <q-card-section class="row items-center q-pb-none"
            ># {{ item.title }}
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-tree
              :nodes="item.tree"
              node-key="key"
              no-connectors
              default-expand-all
            >
              <template v-slot:default-header="prop">
                <div class="row items-center justify-between full-width">
                  <div class="row items-center">
                    <q-icon
                      :name="prop.node.hasDone ? 'o_check_circle' : 'o_circle'"
                      class="q-mr-sm"
                      v-if="prop.node.executor"
                    />
                    <div>
                      {{ prop.node.label }}
                    </div>
                  </div>

                  <div>
                    <q-btn flat size="12px">
                      今日
                      <q-menu class="q-pa-sm">
                        <q-list dense>
                          <!--  @click="editFile(item._key, index)" -->
                          <q-item clickable v-close-popup @click="">
                            今日
                          </q-item>
                          <q-item clickable v-close-popup @click="">
                            明日
                          </q-item>
                          <q-item clickable v-close-popup @click="">
                            本周
                          </q-item>
                          <q-item clickable v-close-popup @click="">
                            本月
                          </q-item>
                          <q-item clickable v-close-popup @click="">
                            未来
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </div>
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.taskBoard {
  width: 100%;
  height: 100%;
  .taskBoard-box {
    width: 100%;
    height: calc(100% - 105px);
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
