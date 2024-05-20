<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import api from "@/services/api";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { ResultProps } from "@/interface/Common";
import { commonscroll, setMessage } from "@/services/util/common";

const socket: any = inject("socket");
const dayjs: any = inject("dayjs");
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setSpaceMessageNum } = appStore.spaceStore;

const noticeList = ref<any>([]);
const page = ref<number>(1);
const total = ref<number>(0);
const noticeTab = ref<string>("unRead");
const getNoticeList = async () => {
  let noticeRes = (await api.request.get("message", {
    teamKey: spaceKey.value,
    hasRead: noticeTab.value === "read" ? 1 : 0,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    if (page.value === 1) {
      noticeList.value = [];
    }
    noticeRes.data.forEach((item) => {
      item.log = item.log.replace("null", "");
    });
    noticeList.value = [...noticeList.value, ...noticeRes.data];
    total.value = noticeRes.total as number;
  }
};
const operateNotice = async (key, operate) => {
  let noticeRes = (await api.request.patch("/message/handle", {
    messageKey: key,
    operate: operate,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    if (noticeRes.data) {
      setSpaceMessageNum(noticeRes.data);
    }
    setMessage("success", `已${operate === "agree" ? "通过" : "驳回"}申请`);
    getNoticeList();
  }
};
const readAll = async () => {
  let noticeRes = (await api.request.patch("/message/hasRead", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (noticeRes.msg === "OK") {
    setSpaceMessageNum(noticeRes.data);

    if (page.value !== 1) {
      page.value === 1;
    } else {
      getNoticeList();
    }
  }
};
onMounted(() => {
  socket.on("message", (data) => {
    console.log(data);
    if (data.teamKey === spaceKey.value) {
      switch (data.type) {
        case "readReport":
          break;
      }
    }
  });
});
watchEffect(() => {
  if (spaceKey.value) {
    getNoticeList();
  }
});
</script>
<template>
  <div class="notice">
    <c-header title="消息">
      <template #button>
        <q-btn
          color="primary"
          label="一键已读"
          v-if="noticeTab === 'unRead'"
          @click="readAll()"
        />
      </template>
      <template #center>
        <q-tabs
          v-model="noticeTab"
          dense
          align="left"
          indicator-color="primary"
          active-class="text-primary"
        >
          <q-tab name="unRead" label="未读" />
          <q-tab name="read" label="已读" /> </q-tabs
      ></template>
    </c-header>

    <div
      class="notice-box"
      @scroll="
        commonscroll($event, noticeList, total, () => {
          page++;
        })
      "
    >
      <template v-for="(item, index) in noticeList" :key="`notice${index}`">
        <q-card class="notice-item q-mb-sm card-hover" flat bordered>
          <q-card-section class="notice-item-box">
            <div style="width: 20%">
              <q-avatar color="#fff" size="30px" class="q-mr-xs">
                <img
                  :src="
                    item.fromUserInfo?.userAvatar
                      ? item.fromUserInfo.userAvatar
                      : '/common/defaultPerson.png'
                  "
                />
              </q-avatar>
              {{ item.fromUserInfo?.userName }}
            </div>
            <div style="width: 20%" v-if="item.projectInfo?.name">
              在 #{{ item.projectInfo?.name }}
            </div>
            <div style="width: 40%">{{ item.log }}</div>
            <div style="width: 15%" v-if="item.type === 'applyJoin'">
              <template v-if="item.needReply === 1">
                <q-btn
                  color="red"
                  rounded
                  dense
                  label="驳回"
                  class="q-px-md q-px-sm q-mr-sm"
                  @click="operateNotice(item._key, 'refuse')"
                />
                <q-btn
                  color="primary"
                  rounded
                  dense
                  label="同意"
                  class="q-px-md q-px-sm"
                  @click="operateNotice(item._key, 'agree')"
                />
              </template>
              <template v-else-if="item.needReply === 2">已同意</template>
              <template v-else-if="item.needReply === 3">已拒绝</template>
            </div>
            <div v-if="item.type === 'watchLog'">
              {{ item?.cardInfo?.name }}
            </div>
            <div style="width: 10%; text-align: right">
              {{ dayjs(item.createTime).fromNow() }}
            </div>
          </q-card-section>
        </q-card>
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.notice {
  width: 100%;
  height: 100%;

  .notice-box {
    width: 100%;
    height: calc(100% - 60px);
    @include scroll();
    @include p-number(10px, 25px);

    .notice-item {
      font-size: 16px;

      .notice-item-box {
        @include flex(space-between, center, null);
      }
    }
  }
}
</style>
<style></style>
