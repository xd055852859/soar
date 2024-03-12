<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { tagArray } from "@/services/config/config";
import _ from "lodash";
import Editor from "../note/Editor.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import cDialog from "@/components/common/cDialog.vue";
import cCalendar from "@/components/common/cCalendar.vue";
import { setMessage } from "@/services/util/common";
import Icon from "../common/Icon.vue";
import Member from "@/views/space/manage/member.vue";
const dayjs: any = inject("dayjs");

const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamMemberList, teamKey } = storeToRefs(appStore.teamStore);
const { setSearchVisible } = appStore.commonStore;
const props = defineProps<{
  nodeKey: string;
  showFile?: boolean;
}>();
const emits = defineEmits<{
  (e: "updateDetail", type: string, obj: any): void;
  (e: "close"): void;
}>();
const nodeInfo = ref<any>(null);
const name = ref<string>("");
const hasDone = ref<boolean>(false);
const executor = ref<string>("");
const tagLabel = ref<string>("");
const tagColor = ref<string>("");
const content = ref<any>(null);
const milestoneDate = ref<any>(null);
const nodeUrl = ref<string>("");
const nodeUrlText = ref<string>("");
const editorRef = ref<any>(null);
const relaters = ref<any>([]);
const changed = ref<boolean>(false);
const fileVisible = ref<boolean>(false);
const fileInput = ref<string>("");
const fileName = ref<string>("");
const searchList = ref<any>([]);
const linkVisible = ref<boolean>(false);
const relatersKey = computed(() => relaters.value.map((item) => item.userKey));
let timeout: any = null;
const getNodeInfo = async (key) => {
  let dataRes = (await api.request.get("node/detail", {
    nodeKey: key,
  })) as ResultProps;
  if (dataRes.msg === "OK") {
    nodeInfo.value = dataRes.data;
    if (nodeInfo.value) {
      name.value = nodeInfo.value.name;
      hasDone.value = nodeInfo.value.hasDone;
      executor.value = nodeInfo.value.executor;
      console.log(executor.value);
      content.value = nodeInfo.value.content;
      if (nodeInfo.value?.startAdornmentContent?.tag) {
        tagLabel.value = nodeInfo.value.startAdornmentContent.tag.label;
        tagColor.value = nodeInfo.value.startAdornmentContent.tag.color;
      }
      if (nodeInfo.value?.startAdornmentContent?.milestone) {
        milestoneDate.value =
          nodeInfo.value.startAdornmentContent.milestone.date;
      }
      if (nodeInfo.value?.endAdornmentContent?.link) {
        nodeUrl.value = nodeInfo.value.endAdornmentContent.link.url;
      }
      if (nodeInfo.value?.endAdornmentContent?.file) {
        fileName.value = nodeInfo.value.endAdornmentContent.file.fileName;
      }
      if (nodeInfo.value?.relaters) {
        relaters.value = nodeInfo.value.relaters.map((item) => {
          let index = _.findIndex(teamMemberList.value, { userKey: item });
          if (index !== -1) {
            return teamMemberList.value[index];
          }
        });
      }
    }
  }
};
const updateDetail = (type, obj) => {
  switch (type) {
    case "executor":
      executor.value = obj.userKey;
      break;
    case "tag":
      tagLabel.value = obj.label;
      tagColor.value = obj.color;
      break;
    case "milestone":
      let endTime = dayjs(obj.date).endOf("day").valueOf();
      milestoneDate.value = endTime;
      break;
    case "link":
      if (!obj.nodeUrl) {
        setMessage("error", "请输入链接地址");
        return;
      }
      break;
    case "relaters":
      let index = _.findIndex(relaters.value, { userKey: obj.member.userKey });
      if (index !== -1) {
        relaters.value.splice(index, 1);
      } else {
        relaters.value.push(teamMemberList.value[obj.memberIndex]);
      }
      obj = { relaters: relatersKey.value };
    case "clear":
      if (obj.type === "file") {
        fileName.value = "";
      } else if (obj.type === "link") {
        nodeUrl.value = "";
        nodeUrlText.value = "";
      }
      break;
  }
  emits("updateDetail", type, {
    ...obj,
  })!;
};
const savemilestone = (date) => {
  updateDetail("milestone", {
    date: date,
  });
};
const saveContent = (title, content) => {
  updateDetail("content", {
    content: content,
  });
};
const saveDoc = () => {
  if (editorRef.value) {
    editorRef.value.handlePost();
  }
};
const handleChange = () => {
  clearTimeout(timeout);
  changed.value = true;
  timeout = setTimeout(() => {
    saveDoc();
    changed.value = false;
  }, 2000);
};
watch(
  () => props.nodeKey,
  (newKey) => {
    console.log(newKey);
    if (newKey) {
      getNodeInfo(newKey);
    }
  },
  { immediate: true }
);
watch(
  () => props.showFile,
  (newState) => {
    fileVisible.value = newState;
  },
  { immediate: true }
);
watch(
  nodeInfo,
  (newInfo) => {
    if (newInfo) {
      console.log(newInfo);
    }
  },
  { deep: true }
);
watch(fileInput, (newName) => {
  if (!newName) {
    searchList.value = [];
  }
});
</script>
<template>
  <div class="node-detail" v-if="nodeInfo">
    <div class="node-detail-close">
      <!-- <q-btn
        icon="close"
        color="grey-5"
        flat
        round
        dense
        @click="emits('close')"
      /> -->
      <!-- <q-btn
        icon="o_more_horiz"
        color="grey-5"
        flat
        round
        dense
        @click=""
      /> -->
    </div>
    <div
      class="node-detail-name"
      :style="executor ? { paddingLeft: '35px' } : null"
    >
      <div class="node-name-check" v-if="executor">
        <Icon
          :name="hasDone ? 'a-quangouxuan21' : 'a-quanxuan-weixuanzhong21'"
          :size="20"
          color="#333"
          class="q-mr-xs"
          @click="
            hasDone = !hasDone;
            updateDetail('hasDone', {
              hasDone: hasDone,
            });
          "
        />
      </div>
      <div class="node-name-input no-input-border">
        <q-input
          type="textarea"
          v-model="name"
          class="node-detail-name"
          autogrow
          @blur="
            updateDetail('name', {
              name,
            })
          "
        />
      </div>
    </div>

    <div class="node-detail-item dp--center">
      <div class="node-detail-title">执行人</div>
      <div class="icon-point" v-if="teamMemberList">
        <template
          v-if="
            executor &&
            _.findIndex(teamMemberList, { userKey: executor }) !== -1
          "
        >
          <q-avatar color="#fff" size="30px" class="shadow-3 q-mr-sm">
            <img
              :src="
                teamMemberList[
                  _.findIndex(teamMemberList, { userKey: executor })
                ]?.userAvatar
                  ? teamMemberList[
                      _.findIndex(teamMemberList, { userKey: executor })
                    ].userAvatar
                  : '/common/defaultPerson.png'
              "
            />
          </q-avatar>

          {{
            teamMemberList[_.findIndex(teamMemberList, { userKey: executor })]
              .userName
          }}
        </template>
        <q-btn flat round v-else>
          <img src="/add.svg" alt="" />
        </q-btn>
        <q-menu auto-close>
          <q-list>
            <q-item
              clickable
              class="row items-center justify-between"
              @click.stop="
                updateDetail('executor', {
                  userKey: '',
                  userAvatar: '',
                })
              "
            >
              无
            </q-item>
            <q-item
              v-for="(item, index) in teamMemberList"
              :key="`member${index}`"
              clickable
              class="row items-center justify-between"
              @click.stop="
                updateDetail('executor', {
                  userKey: item.userKey,
                  userAvatar: item.userAvatar,
                })
              "
            >
              <q-avatar color="#fff" size="24px" class="q-mr-sm">
                <img
                  :src="
                    item?.userAvatar
                      ? item?.userAvatar
                      : '/common/defaultPerson.png'
                  "
                />
              </q-avatar>
              <div class="single-to-long" style="width: 120px">
                {{ item.userName }}
              </div>

              <q-icon
                name="check"
                color="primary"
                size="24px"
                v-if="item.userKey === executor"
              />
              <q-space v-else />
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
    <div class="node-detail-item dp--center">
      <div class="node-detail-title">紧急程度</div>
      <div>
        <q-btn
          :flat="!tagLabel"
          :round="!tagLabel"
          :class="{ 'text-white': tagLabel }"
          :style="tagLabel ? { backgroundColor: tagColor } : null"
        >
          <template v-if="tagLabel">{{ tagLabel }}</template>
          <img src="/add.svg" alt="" v-else />
          <q-menu>
            <q-list dense>
              <!--  @click="editFile(item._key, index)" -->
              <!-- @click="updateTag(item.value)" -->
              <q-item
                clickable
                v-close-popup
                :style="{ backgroundColor: '#fff' }"
                @click="
                  tagLabel = '';
                  updateDetail('clear', {
                    type: 'tag',
                    adornmentContent: 'start',
                  });
                "
              >
                <q-item-section>无</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                v-for="(item, index) in tagArray"
                :key="`tag${index}`"
                :style="{ backgroundColor: item.value }"
                @click="
                  updateDetail('tag', {
                    label: item.label,
                    color: item.value,
                  })
                "
              >
                <q-item-section class="text-white">{{
                  item.label
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <div class="node-detail-item dp--center">
      <div class="node-detail-title">里程碑</div>
      <div>
        <template v-if="milestoneDate">{{
          dayjs(milestoneDate).format("YYYY - M - D")
        }}</template>
        <q-btn flat round v-else>
          <img src="/add.svg" alt="" />
        </q-btn>
        <q-menu style="width: 250px" auto-close>
          <c-calendar @clickDate="savemilestone" />
        </q-menu>
      </div>
    </div>
    <div class="node-detail-item dp--center">
      <div class="node-detail-title q-mb-sm">干系人</div>
      <div class="dp--center">
        <q-avatar
          v-for="(item, index) in relaters"
          :key="`relaters${index}`"
          size="30px"
          class="q-mr-sm q-mb-sm"
        >
          <img
            :src="
              item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
            "
          />
          <q-tooltip :offset="[10, 5]">
            {{ item.userName }}
          </q-tooltip>
        </q-avatar>
        <q-btn flat round class="q-mb-sm">
          <img src="/add.svg" alt="" />
          <q-menu>
            <q-list>
              <q-item clickable class="row items-center justify-between">
                无
              </q-item>
              <q-item
                v-for="(item, index) in teamMemberList"
                :key="`member${index}`"
                clickable
                class="row items-center justify-between"
                @click="
                  updateDetail('relaters', {
                    member: item,
                    memberIndex: index,
                  })
                "
              >
                <q-avatar color="#fff" size="24px" class="q-mr-sm">
                  <img
                    :src="
                      item?.userAvatar
                        ? item?.userAvatar
                        : '/common/defaultPerson.png'
                    "
                  />
                </q-avatar>
                <div class="single-to-long" style="width: 120px">
                  {{ item.userName }}
                </div>

                <q-icon
                  name="check"
                  color="primary"
                  size="24px"
                  v-if="relatersKey.indexOf(item.userKey) !== -1"
                />
                <q-space v-else />
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <div class="node-detail-item dp--center">
      <div class="node-detail-title">内链</div>
      <div class="node-detail-link dp--center">
        <template v-if="fileName">
          <div class="node-link-title single-to-long q-mr-sm">
            {{ fileName }}
          </div>
          <img
            src="/close.svg"
            alt=""
            @click="
              updateDetail('clear', {
                type: 'file',
                adornmentContent: 'end',
              })
            "
          />
        </template>
        <q-btn
          flat
          :round="!fileName"
          @click="
            setSearchVisible(true, (node) => {
              updateDetail('file', {
                fileKey: node._key,
                fileName: node.name,
              });
              setSearchVisible(false);
            })
          "
          v-else
        >
          <img src="/add.svg" alt="" />
        </q-btn>
      </div>
    </div>
    <div class="node-detail-content">
      <div class="node-detail-title">备注</div>
      <div class="node-detail-editor">
        <!-- :handleSave="updateContent" -->
        <span v-if="nodeInfo" class="node-detail-save">{{
          changed ? "有变更" : "已保存"
        }}</span>
        <Editor
          v-if="nodeInfo"
          ref="editorRef"
          :initData="nodeInfo"
          :autoSave="true"
          @onChange="handleChange"
          :handleSave="saveContent"
        />
      </div>
    </div>
    <div class="node-detail-item dp--center">
      <div class="node-detail-title">外链</div>
      <div class="node-detail-link dp--center">
        <template v-if="nodeUrl">
          <div class="node-link-title single-to-long q-mr-sm">
            {{ nodeUrl }}
          </div>
          <img
            src="/close.svg"
            alt=""
            @click="
              updateDetail('clear', {
                type: 'link',
                adornmentContent: 'end',
              })
            "
          />
        </template>
        <q-btn flat round v-else>
          <img src="/add.svg" alt="" />
        </q-btn>
        <q-menu style="width: 250px">
          <q-card>
            <q-card-section class="full-width">链接</q-card-section>
            <q-card-section class="full-width">
              <q-input
                outlined
                v-model="nodeUrl"
                label="链接地址"
                dense
                class="full-width"
              />
            </q-card-section>
            <q-card-section class="full-width">
              <q-input
                outlined
                v-model="nodeUrlText"
                label="链接名称"
                dense
                class="full-width"
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                label="保存"
                color="primary"
                @click="
                  updateDetail('link', {
                    nodeUrl,
                    text: nodeUrlText,
                  })
                "
              />
            </q-card-actions>
          </q-card>
        </q-menu>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.node-detail {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  @include scroll();
  .node-detail-close {
    position: absolute;
    z-index: 2;
    top: 0px;
    right: 0px;
  }
  .node-detail-title {
    height: 30px;
    font-size: 16px;
    margin-right: 15px;
    line-height: 30px;
    color: #121212;
    font-weight: bolder;
  }
  .node-detail-content {
    .node-detail-editor {
      border: 1px solid $grey-4;
      margin: 10px 0px;
      position: relative;
      z-index: 1;
      .node-detail-save {
        position: absolute;
        z-index: 2;
        right: 5px;
        top: 5px;
        color: $grey-6;
      }
    }
  }
  .node-detail-item,
  .node-detail-name {
    width: 100%;
    min-height: 30px;
    margin-bottom: 15px;
    .node-detail-link {
      width: calc(100% - 50px);
      .node-link-title {
        max-width: calc(100% - 50px);
      }
    }
  }
  .node-detail-name {
    position: relative;
    z-index: 1;
    .node-name-check {
      width: 35px;
      height: 100%;
      position: absolute;
      z-index: 2;
      top: 0px;
      left: 0px;
      cursor: pointer;
      @include flex(flex-start, flex-start, null);
    }
  }
}
</style>
<style lang="scss">
.node-name-input {
  .q-field__native {
    font-size: 18px;
    line-height: 25px;
    padding-top: 0px;
  }
}
</style>
