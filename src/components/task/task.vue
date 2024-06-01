<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
import TreeDetail from "@/components/tree/treeDetail.vue";
import cDrawer from "@/components/common/cDrawer.vue";
import cCalendar from "@/components/common/cCalendar.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { tagArray } from "@/services/config/config";
import { setMessage } from "@/services/util/common";
import { useQuasar } from "quasar";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const dayjs: any = inject("dayjs");
const $q = useQuasar();
const props = defineProps<{
  card: any;
  boxIndex?: number;
  taskIndex?: number;
}>();
const emits = defineEmits<{
  (e: "chooseCard", detail: any, type: string, key?: string): void;
}>();
const { targetTeamMemberList } = storeToRefs(appStore.teamStore);
const { setTargetTeamKey } = appStore.teamStore;

const chooseKey = ref<string>("");
const drawerVisible = ref<boolean>(false);
const cardDay = ref<number>(0);
const originName = ref<string>("");
const tagColor = ref<string>("");
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
  console.log(obj);
  switch (type) {
    case "name":
      originName.value = obj.name;
      detail[type] = obj[type];
      changeObj[type] = obj[type];
      break;
    case "hasDone":
    case "content":
    case "relaters":
      detail[type] = obj[type];
      changeObj[type] = obj[type];
      break;
    case "executor":
      detail.executorInfo = {};
      detail.executorInfo.userAvatar = obj.userAvatar;
      detail.executorInfo._key = obj.userKey;
      detail.executorInfo.userName = obj.userName;
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
      // cardDay.value = dayjs().diff(dayjs(endTime), "day");
      break;

    case "link":
      console.log(obj);
      changeObj.endAdornmentContent = {
        ...detail.endAdornmentContent,
        link: { url: obj.nodeUrl, text: obj.text },
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
    case "clear": {
      if (obj.type === "link") {
        changeObj.endAdornmentContent = {
          ...detail.endAdornmentContent,
          link: { url: "", text: "" },
        };
      } else if (obj.type === "milestone") {
        changeObj.endTime = null;
        changeObj.endAdornmentContent = {
          ...detail.startAdornmentContent,
          milestone: {},
        };
      }
    }
  }
  let updateRes = (await api.request.patch("node/more", {
    nodeKey: props.card._key,
    obj: { ...changeObj },
  })) as ResultProps;
  if (updateRes.msg === "OK") {
    detail = { ...detail, ...changeObj };
    detail.boxIndex = props.boxIndex;
    detail.taskIndex = props.taskIndex;
    console.log(detail);
    if (type === "link") {
      setMessage("success", "保存链接成功");
    }
    emits("chooseCard", detail, "update", type);
  }
};

watch(
  () => props.card,
  (newCard) => {
    originName.value = newCard.name;
    if (newCard?.endTime) {
      cardDay.value = dayjs(newCard.endTime).diff(dayjs().endOf("day"), "day");
    }
  },
  { immediate: true },
);
</script>
<template>
  <q-card
    flat
    bordered
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
      <div
        class="teamTask-box-top-time"
        v-if="card.endTime"
        @click.stop=""
        :style="{
          background:
            cardDay === 0
              ? '#07be51'
              : cardDay < 0 && !card.hasDone
                ? 'red'
                : '#555555',
        }"
      >
        {{
          cardDay >= 0
            ? cardDay > 99
              ? "99+"
              : cardDay + 1
            : card.hasDone
              ? cardDay < -99
                ? "-99+"
                : cardDay
              : Math.abs(cardDay) > 99
                ? "99+"
                : Math.abs(cardDay)
        }}
        <q-menu style="width: 300px" auto-close>
          <c-calendar
            :endTime="props.card.endTime"
            @clickDate="
              (date) =>
                updateTask(
                  'milestone',
                  {
                    date: date,
                  },
                  card,
                )
            "
            @clearDate="updateTask('clear', { type: 'milestone' }, card)"
          />
        </q-menu>
      </div>
      <div
        class="teamTask-box-top-title"
        :style="{ paddingLeft: props.card.endTime ? '60px' : '25px' }"
        @click.stop=""
      >
        <q-input
          v-model="originName"
          class="teamTask-box-top-input"
          borderless
          dense
          autogrow
          @blur="
            () => {
              if (originName !== card.name) {
                updateTask(
                  'name',
                  {
                    name: originName,
                  },
                  card,
                );
              }
            }
          "
        />
      </div>
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
        <span>{{ pathIndex === 0 ? "# " : "" }}{{ pathItem.name }}</span>
        <span v-if="pathIndex < card.way.length - 1" style="margin: 0 2px">
          /
        </span>
      </template>
    </q-card-section>
    <q-card-section class="teamTask-box-bottom q-py-none">
      <div class="dp-center-center">
        <div>
          <q-avatar color="#fff" size="20px" class="q-mr-sm">
            <img
              :src="
                card.assignorInfo?.userAvatar
                  ? card.assignorInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
              alt=""
            />
          </q-avatar>
          {{
            card.assignorInfo?.userName
              ? card.assignorInfo?.userName.length > 5
                ? card.assignorInfo.userName.substring(0, 5)
                : card.assignorInfo.userName
              : ""
          }}
          <q-tooltip
            v-if="
              card.assignorInfo?.userName &&
              card.assignorInfo.userName.length > 5
            "
          >
            {{ card.assignorInfo.userName }}
          </q-tooltip>
        </div>
        <q-icon name="arrow_right_alt" size="20px" class="q-ma-sm" />
        <div @click.stop="setTargetTeamKey(card.projectKey)">
          <q-avatar color="#fff" size="20px" class="q-mr-sm">
            <img
              :src="
                card.executorInfo?.userAvatar
                  ? card.executorInfo.userAvatar
                  : '/common/defaultPerson.png'
              "
              alt=""
            />
          </q-avatar>
          {{
            card.executorInfo?.userName
              ? card.executorInfo?.userName.length > 5
                ? card.executorInfo.userName.substring(0, 3) + "..."
                : card.executorInfo.userName
              : ""
          }}
          <q-tooltip
            v-if="
              card.executorInfo?.userName &&
              card.executorInfo.userName.length > 5
            "
          >
            {{ card.executorInfo.userName }}
          </q-tooltip>
          <q-menu auto-close>
            <q-list>
              <q-item
                clickable
                v-close-popup
                class="row items-center justify-between"
                @click.stop="
                  updateTask(
                    'executor',
                    {
                      userKey: '',
                      userName: '',
                      userAvatar: '',
                    },
                    card,
                  )
                "
              >
                无
              </q-item>
              <q-item
                v-for="(item, index) in targetTeamMemberList"
                :key="`member${index}`"
                clickable
                v-close-popup
                class="row items-center justify-between"
                @click.stop="
                  updateTask(
                    'executor',
                    {
                      userKey: item.userKey,
                      userName: item.userName,
                      userAvatar: item.userAvatar,
                    },
                    card,
                  )
                "
              >
                <q-avatar color="#fff" size="24px" class="q-mr-sm">
                  <img
                    :src="
                      item?.userAvatar
                        ? item?.userAvatar
                        : '/common/defaultPerson.png'
                    "
                    alt=""
                  />
                </q-avatar>
                <div class="single-to-long" style="width: 120px">
                  {{ item.userName }}
                </div>

                <q-icon
                  name="check"
                  color="primary"
                  size="24px"
                  v-if="item.userKey === card.executorInfo.userKey"
                />
                <q-space v-else />
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
      {{ dayjs(card.createTime).fromNow() }}
      <!-- {{ dayjs(card.updateTime).fromNow() }} -->
    </q-card-section>
    <!--    <div-->
    <!--      class="teamTask-box-tag"-->
    <!--      :style="{-->
    <!--        borderTop: `9px solid ${tagColor}`,-->
    <!--        borderRight: `9px solid ${tagColor} `,-->
    <!--        borderLeft: '9px solid transparent',-->
    <!--        borderBottom: '9px solid transparent',-->
    <!--      }"-->
    <!--      @click.stop=""-->
    <!--    ></div>-->
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
  padding: 5px 0;
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
      top: 8px;
      left: 18px;
      z-index: 2;
      @include flex(center, flex-start, null);
    }
    .teamTask-box-top-time {
      width: 25px;
      height: 25px;
      position: absolute;
      top: 11px;
      left: 42px;
      z-index: 2;
      color: #fff;
      font-size: 12px;
      line-height: 25px;
      text-align: center;
    }
    .teamTask-box-top-title {
      box-sizing: border-box;
      flex: 1;
      line-height: 20px;
      // word-wrap: break-word;
      // white-space: pre-wrap;
      // text-align: left
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
  .teamTask-box-tag {
  }
}
</style>
<style lang="scss">
.teamTask-box-top-title {
  .teamTask-box-top-input {
    .q-field__native {
      line-height: 25px;
    }
  }
}
</style>
