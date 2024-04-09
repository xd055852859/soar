<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { formatData } from "@/services/util/data";
import { planArray } from "@/services/config/config";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import Icon from "@/components/common/Icon.vue";
const { user } = storeToRefs(appStore.authStore);
const { spaceMemberList, spaceKey } = storeToRefs(appStore.spaceStore);
const props = defineProps<{
  targetKey?: string;
  targetTag?: string;
}>();
const boardList = ref<any>([]);
const relationType = ref<number>(1);
const memberList = ref<any>([]);
const planTag = ref<string>("");
const userKey = ref<string>("");
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
    targetUserKey: userKey.value,
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
watch(
  [() => props.targetKey, user],
  ([newKey, newInfo]) => {
    if (newKey) {
      userKey.value = newKey;
    } else if (newInfo) {
      userKey.value = newInfo._key;
    }
  },
  { immediate: true }
);
watch(
  () => props.targetTag,
  (newTag) => {
    if (newTag) {
      console.log(newTag)
      planTag.value = newTag;
    }
  },
  { immediate: true }
);
watch(
  spaceMemberList,
  (newList) => {
    if (newList.length > 0) {
      memberList.value = [];
      newList.forEach((item) => {
        memberList.value.push({
          ...item,
          label: item.userName,
          value: item.userKey,
        });
      });
      console.log(spaceMemberList.value);
      console.log(memberList.value);
    }
  },
  { immediate: true }
);
watchEffect(() => {
  getTaskBoardList();
});
</script>
<template>
  <div class="taskBoard">
    <div class="iframe-title" v-if="targetKey"></div>
    <cHeader title="任务池" v-else>
      <template #button>
        <q-select
          outlined
          v-model="userKey"
          :options="memberList"
          emit-value
          map-options
          dense
          style="width: 120px"
          class="q-mr-sm"
          v-if="memberList"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-avatar color="#fff" size="24px">
                  <img
                    :src="
                      scope.opt.userAvatar
                        ? scope.opt.userAvatar
                        : '/common/defaultPerson.png'
                    "
                  />
                </q-avatar>
              </q-item-section>
              <q-item-section class="common-title">
                {{ scope.opt.userName }}
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
          <q-card-section class="row items-center q-pb-none common-title">
            # {{ item.projectInfo?.name }}
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
                  <template v-if="prop.node.executor">
                    <Icon
                      :name="
                        prop.node.hasDone
                          ? 'a-quangouxuan21'
                          : 'a-quanxuan-weixuanzhong21'
                      "
                      :size="20"
                      color="#333"
                      class="q-mr-xs"
                      @click="editFinishPercent(prop.node, index)"
                    />
                    <q-avatar color="#fff" size="lg" class="q-mr-sm">
                      <img
                        :src="
                          prop.node?.avatarUri
                            ? prop.node.avatarUri
                            : '/common/defaultPerson.png'
                        "
                      />
                    </q-avatar>
                  </template>
                  <div class="common-title taskBoard-item-title">
                    {{ prop.node.label }}
                  </div>
                  <div class="common-title taskBoard-item-icon">
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
                      <Icon
                        name="a-shezhi2"
                        :size="18"
                        color="#bdbdbd"
                        v-else
                      />
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
                            class="common-title"
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
        min-height: 45px;
        .taskBoard-item-title {
          /* prettier-ignore */
          width: calc(100% - 150Px);
          flex-shrink: 0;
        }
        .taskBoard-item-icon {
          /* prettier-ignore */
          width:60Px;
        }
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
.iframe-title {
  width: 100%;
  height: 65px;
}
</style>
<style lang="scss"></style>
