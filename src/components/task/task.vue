<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
import TreeDetail from "@/components/tree/treeDetail.vue";
import cDrawer from "@/components/common/cDrawer.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
import { useQuasar } from "quasar";
const dayjs: any = inject("dayjs");
const $q = useQuasar();
const props = defineProps<{
  card: any;
  boxIndex?: number;
  taskIndex?: number;
}>();

const chooseKey = ref<string>("");
const drawerVisible = ref<boolean>(false);
const emits = defineEmits<{
  (e: "chooseCard", key: string, type: string): void;
}>();
const chooseTask = () => {
  // console.log(props.card);
  // setTeamKey(props.card.projectInfo._key);
  drawerVisible.value = true;
};
const finishTask = async (detail) => {
  let detailRes = (await api.request.patch("node/finish", {
    nodeKey: detail._key,
    hasDone: !detail.hasDone,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    detail.hasDone = !detail.hasDone;
    emits("chooseCard", detail, "update");
  }
};
const deleteTask = async (detail) => {
  $q.dialog({
    title: `删除任务`,
    message: `是否删除该任务`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let fileRes = (await api.request.delete("node", {
        nodeKey: props.card._key,
      })) as ResultProps;
      if (fileRes.msg === "OK") {
        setMessage("success", `删除任务成功`);
        detail.boxIndex = props.boxIndex;
        detail.taskIndex = props.taskIndex;
        emits("chooseCard", detail, "delete");
        // fileList.value.splice(index, 1);
      }
    })
    .onCancel(() => {});
};
const updateTask = async (type, obj, detail) => {
  let changeObj: any = {};
  switch (type) {
    case "name":
    case "hasDone":
    case "content":
    case "relaters":
      detail[type] = obj[type];
      changeObj[type] = obj[type];
      break;
    case "executor":
      detail.executorInfo.userAvatar = obj.userAvatar;
      detail.executorInfo.userKey = obj.userKey;
      changeObj.executor = obj.userKey;
      break;
    case "tag":
      changeObj.startAdornmentContent = {
        ...detail.startAdornmentContent,
        tag: { label: obj.label, color: obj.color },
      };
      break;
    case "milestone":
      let endTime = dayjs(obj.date).endOf("day").valueOf();
      changeObj.endTime = endTime;
      changeObj.startAdornmentContent = {
        ...detail.startAdornmentContent,
        milestone: {
          date: endTime,
          month: dayjs(obj.date).month() + 1,
          day: dayjs(obj.date).date(),
        },
      };
      console.log(detail.startAdornmentContent);
      console.log(changeObj.startAdornmentContent);
      break;

    case "link":
      changeObj.endAdornmentContent = {
        ...detail.endAdornmentContent,
        link: { url: obj.nodeUrl, text: obj.nodeUrlText },
      };
      break;
    case "file":
      changeObj.endAdornmentContent = {
        ...detail.endAdornmentContent,
        file: {
          fileKey: obj.fileKey,
          fileName: obj.fileName,
        },
      };
      break;
  }
  let updateRes = (await api.request.patch("node/more", {
    nodeKey: props.card._key,
    obj: { ...changeObj },
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    detail.boxIndex = props.boxIndex;
    detail.taskIndex = props.taskIndex;
    emits("chooseCard", detail, "update");
  }
};
</script>
<template>
  <q-card
    class="teamTask-box-container q-mb-md icon-point card-hover"
    @click="chooseTask()"
    @mouseenter="chooseKey = card._key"
  >
    <q-card-section class="teamTask-box-top q-py-none">
      <!-- <div>
        <template v-if="outType"># {{ card.projectInfo.name }}</template>
      </div> -->
      <div class="teamTask-box-top-done">
        <Icon
          :name="card.hasDone ? 'a-quangouxuan21' : 'a-quanxuan-weixuanzhong21'"
          :size="20"
          color="#333"
          class="q-mr-sm"
          @click.stop="finishTask(card)"
        />
      </div>

      <div class="teamTask-box-top-title">{{ card.name }}</div>
      <div class="teamTask-box-top-icon" v-if="chooseKey === card._key">
        <q-btn flat round icon="more_horiz" size="9px" @click.stop="">
          <q-menu class="q-pa-sm">
            <q-list dense>
              <q-item clickable v-close-popup @click="deleteTask(card)">
                <q-item-section>删除</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>
    <q-card-section class="teamTask-box-center q-py-none">
      <template
        v-for="(pathItem, pathIndex) in card.way"
        :key="`${card._key}path${pathIndex}`"
      >
        <span>{{ pathItem.name }}</span>
        <span v-if="pathIndex < card.way.length - 1" style="margin: 0 2px">
          /
        </span>
      </template>
    </q-card-section>
    <q-card-section class="teamTask-box-bottom q-py-none">
      <div class="dp-center-center">
        <q-avatar color="#fff" size="20px" class="q-mr-sm">
          <img
            :src="
              card.assignorInfo?.userAvatar
                ? card.assignorInfo.userAvatar
                : '/common/defaultGroup.png'
            "
            alt=""
          />
          <q-tooltip>
            {{ card.assignorInfo?.userName }}
          </q-tooltip>
        </q-avatar>
        {{
          card.assignorInfo?.userName.length > 5
            ? card.assignorInfo.userName.substring(0, 5)
            : card.assignorInfo.userName
        }}
        <q-icon name="arrow_right_alt" size="20px" class="q-ma-sm" />
        <q-avatar color="#fff" size="20px" class="q-mr-sm">
          <img
            :src="
              card.executorInfo?.userAvatar
                ? card.executorInfo.userAvatar
                : '/common/defaultPerson.png'
            "
            alt=""
          />
          <q-tooltip>
            {{ card.executorInfo?.userName }}
          </q-tooltip>
        </q-avatar>
        {{
          card.executorInfo?.userName.length > 5
            ? card.executorInfo.userName.substring(0, 3) + "..."
            : card.executorInfo.userName
        }}
      </div>
      {{ dayjs(card.createTime).fromNow() }}
      <!-- {{ dayjs(card.updateTime).fromNow() }} -->
    </q-card-section>
  </q-card>
  <c-drawer
    :visible="drawerVisible"
    @close="drawerVisible = false"
    :drawerStyle="{
      width: '400px',
    }"
    opacityMask
  >
    <template #content>
      <TreeDetail
        :nodeKey="card._key"
        @updateDetail="updateTask"
        @close="drawerVisible = false"
        v-if="card?._key"
      />
    </template>
  </c-drawer>
</template>

<style lang="scss" scoped>
.teamTask-box-container {
  width: 100%;
  min-height: 80px;
  // border-radius: 0px;
  padding: 5px 0px;
  box-sizing: border-box;

  .teamTask-box-top {
    width: 100%;
    min-height: 35px;
    font-size: 16px;
    position: relative;
    z-index: 1;
    @include flex(space-between, flex-start, null);

    .teamTask-box-top-done {
      width: 25px;
      height: 25px;
      position: absolute;
      top: 0px;
      left: 18px;
      z-index: 2;
      @include flex(center, flex-start, null);
    }

    .teamTask-box-top-title {
      padding-left: 25px;
      padding-top: 5px;
      box-sizing: border-box;
      flex: 1;
      line-height: 20px;
      // word-wrap: break-word;
      // white-space: pre-wrap;
      // text-align: left;
    }

    .teamTask-box-top-icon {
      width: 25px;
      flex-shrink: 0;
    }
  }

  .teamTask-box-center {
    width: 100%;
    min-height: 18px;
    // height: 80px;
    color: $grey-6;
    font-size: 12px;
    line-height: 14px;
    margin-bottom: 5px;
  }

  .teamTask-box-bottom {
    width: 100%;
    height: 25px;

    font-size: 12px;
    // height: 80px;
    @include flex(space-between, center, null);
  }
}
</style>
