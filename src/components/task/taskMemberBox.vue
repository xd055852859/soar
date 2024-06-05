<script setup lang="ts">
import Task from "@/components/task/task.vue";
import { storeToRefs } from "pinia";
import appStore from "@/store";
const { token, user } = storeToRefs(appStore.authStore);
const props = defineProps<{
  taskList: any;
  memberList: any;
}>();
const emits = defineEmits<{
  (e: "setChooseKey", key: string): void;
}>();
const chooseKey = ref<string>("");
const chooseCard = (detail, type) => {
  let list = [...props.taskList];
  switch (type) {
    case "update":
      list[detail.boxIndex].taskList[detail.taskIndex] = {
        ...list[detail.boxIndex].taskList[detail.taskIndex],
        ...detail,
      };
      console.log(list[detail.boxIndex].taskList[detail.taskIndex]);
      break;
    case "delete":
      list[detail.boxIndex].taskList.splice(detail.taskIndex, 1);
      if (list[detail.boxIndex].taskList.length === 0) {
        list.splice(detail.boxIndex, 1);
      }
      break;
  }
};
const chooseMember = (memberKey) => {
  if (memberKey) {
    chooseKey.value = memberKey;
  } else {
    chooseKey.value = "";
  }
  emits("setChooseKey", chooseKey.value);
};
watch(
  user,
  (newUserInfo) => {
    if (newUserInfo) {
      chooseKey.value = newUserInfo._key;
      chooseMember(chooseKey.value);
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="task-box">
    <div
      class="taskMember-container"
      v-for="(item, index) in taskList"
      :key="`task${index}`"
    >
      <div class="taskMember-top">
        <div class="taskMember-top-left">
          <q-circular-progress
            show-value
            font-size="10px"
            class="q-mr-md"
            :value="
              item.totalTask === 0
                ? 0
                : (item.finishTask / item.totalTask) * 100
            "
            size="80px"
            :thickness="0.25"
            color="primary"
            track-color="grey-3"
          >
            <q-avatar color="#fff" size="73px">
              <img
                :src="
                  item.userAvatar
                    ? item.userAvatar
                    : '/common/defaultPerson.png'
                "
                alt=""
              />
            </q-avatar>
          </q-circular-progress>
        </div>
        <div class="taskMember-top-right">
          <div>
            {{ item.userName }}{{ item.userKey === user?._key ? "(我)" : "" }}
          </div>
          <!--              <div>{{ item.finishTask }} / {{ item.totalTask }}</div>-->
        </div>
      </div>
      <div class="taskMember-bottom">
        <template
          v-for="(taskItem, taskIndex) in item.taskList"
          :key="`taskItem${taskIndex}`"
        >
          <Task :card="taskItem" @chooseCard="chooseCard" />
        </template>
      </div>
    </div>
    <div class="taskMember-right">
      <div class="taskMember-right-title">干系人</div>
      <div class="taskMember-right-box" v-if="memberList.length > 0">
        <div
          class="icon-point q-my-xs"
          v-for="(item, index) in memberList"
          :key="`task${index}`"
          @click.stop="chooseMember(item._key)"
          :style="
            chooseKey === item._key ? { border: '3px solid #07be51' } : {}
          "
        >
          <q-avatar color="#fff" size="35px">
            <img
              :src="
                item.userAvatar ? item.userAvatar : '/common/defaultPerson.png'
              "
              alt=""
            />
          </q-avatar>
          <q-tooltip :offset="[0, -5]">
            {{ item.userName }}
          </q-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-box {
  min-width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background: #f2f3f6;
  padding-right: 60px;
  box-sizing: border-box;
  @include flex(flex-start, center, null);

  .taskMember-container {
    width: 455px;
    height: 100%;
    flex-shrink: 0;
    margin-right: 27px;
    padding-right: 40px;
    box-sizing: border-box;

    .taskMember-top {
      width: 100%;
      /* prettier-ignore */
      height: 90Px;
      font-size: 14px;
      @include flex(center, center, null);
    }

    .taskMember-bottom {
      width: 100%;
      /* prettier-ignore */
      height: calc(100% - 90Px);
      @include scroll();
      @include p-number(10px, 10px);
    }
  }
  .taskMember-right {
    /* prettier-ignore */
    width: 60px;
    height: calc(100vh - 50px);
    position: fixed;
    z-index: 2;
    top: 50px;
    right: 0;
    color: #7c84a0;
    background-color: #fff;
    @include p-number(10px, 0);
    @include flex(center, flex-start, wrap);

    .taskMember-right-title {
      //margin: 10px 0px;
      font-size: 14px;
      font-weight: bolder;
    }

    .taskMember-right-box {
      height: calc(100% - 40px);
      @include scroll();

      > div {
        border-radius: 50%;
        margin-bottom: 10px;
        @include flex(center, center, wrap);
      }
    }
  }
}
</style>
