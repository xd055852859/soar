<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { formatData } from "@/services/util/data";
import { planArray } from "@/services/config/config";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const boardList = ref<any>([]);
const relationType = ref<number>(1);
const planTag = ref<string>("");
const relationArray = [
  {
    value: 1,
    label: "相关性",
  },
  {
    value: 2,
    label: "执行的",
  },
  {
    value: 3,
    label: "指派的",
  },
];
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
    // boardList.value = [
    //   ...boardList.value,
    //   ...boardList.value,
    //   ...boardList.value,
    //   ...boardList.value,
    //   ...boardList.value,
    //   ...boardList.value,
    // ];
    console.log(boardList.value);
  }
};
//完成任务
const editFinishPercent = async (item, index) => {
  let dataRes = (await api.request.patch("node/finish", {
    nodeKey: item._key,
    hasDone: !item.hasDone,
  })) as ResultProps;
  console.log(dataRes);
  if (dataRes.msg === "OK") {
    boardList.value[index].nodes[item._key].hasDone =
      !boardList.value[index].nodes[item._key].hasDone;
    boardList.value = boardList.value.map((item) => {
      item.tree = [formatData(item.nodes, item.rootKey)];
      return item;
    });
  }
};
const changeTaskBoard = async (item, index, type) => {
  let mateRes = (await api.request.patch("task/plan", {
    nodeKey: item._key,
    planTag: type,
  })) as ResultProps;
  if (mateRes.msg === "OK") {
    boardList.value[index].nodes[item._key].planTag = type;
    boardList.value = boardList.value.map((item) => {
      item.tree = [formatData(item.nodes, item.rootKey)];
      console.log(item.tree);
      return item;
    });
  }
};
watchEffect(() => {
  getTaskBoardList();
});
</script>
<template>
  <div class="taskBoard">
    <cHeader title="任务池">
      <template #button>
        <q-select
          outlined
          v-model="relationType"
          :options="relationArray"
          emit-value
          map-options
          dense
        />
      </template>
    </cHeader>
    <q-tabs
      dense
      align="left"
      indicator-color="primary"
      active-class="text-primary"
      class="q-mx-md"
      v-model="planTag"
    >
      <q-tab
        v-for="(item, index) in planArray"
        :key="`plan${index}`"
        :label="item.label"
        :name="item.value"
      />
    </q-tabs>
    <div class="taskBoard-box">
      <masonry :cols="2" :gutter="15">
        <q-card
          class="q-mb-md taskBoard-card"
          v-for="(item, index) in boardList"
          :key="`taskTree${index}`"
        >
          <q-card-section class="row items-center q-pb-none">
            {{ item.title }}
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-tree
              :nodes="item.tree"
              node-key="key"
              no-connectors
              default-expand-all
              no-transition
            >
              <template v-slot:default-header="prop">
                <div
                  class="row items-center justify-between full-width taskBoard-item"
                >
                  <div class="row items-center">
                    <template v-if="prop.node.executor">
                      <q-icon
                        :name="
                          prop.node.hasDone ? 'o_check_circle' : 'o_circle'
                        "
                        color="primary"
                        class="q-mr-xs"
                        @click="editFinishPercent(prop.node, index)"
                      />
                      <q-avatar
                        color="primary"
                        text-color="white"
                        size="lg"
                        class="q-mr-sm"
                      >
                        <img
                          :src="
                            prop.node?.avatarUri
                              ? prop.node.avatarUri
                              : '/common/defaultGroup.png'
                          "
                        />
                      </q-avatar>
                    </template>
                    <div>
                      {{ prop.node.label }}
                    </div>
                  </div>

                  <div>
                    <q-btn
                      flat
                      size="12px"
                      @click.stop=""
                      :class="{ 'taskBoard-button': !prop.node.planTag }"
                      v-if="prop.node.executor"
                    >
                      <template v-if="prop.node.planTag">{{
                        planArray[
                          _.findIndex(planArray, { value: prop.node.planTag })
                        ]?.label
                      }}</template>
                      <q-icon name="o_settings" v-else color="grey" />
                      <q-menu class="q-pa-sm">
                        <q-list dense>
                          <q-item
                            v-for="(planItem, planIndex) in planArray.slice(
                              1,
                              planArray.length
                            )"
                            :key="`planButton${planIndex}`"
                            :label="item.label"
                            :name="item.value"
                            clickable
                            v-close-popup
                            @click="
                              changeTaskBoard(prop.node, index, planItem.value)
                            "
                          >
                            {{ planItem.label }}
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
      </masonry>
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
    // height:3000px;
    @include p-number(10px, 25px);
    @include scroll();
    .taskBoard-card {
      .taskBoard-item {
        min-height: 35px;
        .taskBoard-button {
          display: none;
        }
        &:hover {
          .taskBoard-button {
            display: flex;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss"></style>
