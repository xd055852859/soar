<script setup lang="ts">
import Icon from "@/components/common/Icon.vue";
import Task from "@/components/task/task.vue";
import CreateTask from "@/components/task/createTask.vue";
import CDrawer from "@/components/common/cDrawer.vue";
const props = defineProps<{
  taskList: any;
  memberList: any;
  taskTab: string;
}>();
const emits = defineEmits<{
  (e: "setChooseKey", key: string): void;
}>();
const treeInfo = ref<any>(null);
const teamKey = ref<any>(null);
const drawerVisible = ref<boolean>(false);
const chooseKey = ref<string>("");
const taskList = ref<any>([]);
const chooseTree = (item) => {
  drawerVisible.value = true;
  treeInfo.value = item;
  teamKey.value = item ? item.projectKey : "";
};
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
const chooseMember = (memberKey, list) => {
  taskList.value = [];
  console.log(list);
  if (memberKey) {
    chooseKey.value = memberKey;
    let newList: any = [];
    list.forEach((item, index) => {
      newList[index] = { ...item };
      newList[index].taskList = [];
      item.taskList.forEach((taskItem, taskIndex) => {
        switch (props.taskTab) {
          case "create":
            if (chooseKey.value === taskItem.executorInfo._key) {
              newList[index].taskList.push(taskItem);
            }
            break;
          case "execute":
            if (chooseKey.value === taskItem.assignorInfo._key) {
              newList[index].taskList.push(taskItem);
            }
            break;
        }
      });
      if (newList[index].taskList.length > 0) {
        taskList.value.push(newList[index]);
      }
    });
  } else {
    chooseKey.value = "";
    taskList.value = [...list];
  }
  emits("setChooseKey", chooseKey.value);
};
watch(
  () => props.taskList,
  (newList) => {
    chooseMember(chooseKey.value, newList);
  },
);
</script>
<template>
  <div class="task-box">
    <div
      class="taskTree-box"
      v-for="(item, index) in taskList"
      :key="`task${index}`"
    >
      <div class="taskTree-top">
        <div>{{ item.projectName }} / {{ item.title }}</div>
        <div>
          <q-btn round flat size="16px" @click="chooseTree(item)">
            <Icon name="a-chuangjian2" :size="20" />
          </q-btn>
        </div>
      </div>
      <div class="taskTree-bottom">
        <template
          v-for="(taskItem, taskIndex) in item.taskList"
          :key="`taskItem${taskIndex}`"
        >
          <Task
            :card="taskItem"
            :boxIndex="index"
            :taskIndex="taskIndex"
            @chooseCard="chooseCard"
          />
        </template>
      </div>
    </div>
    <div class="taskTree-right">
      <div class="taskTree-right-title">
        {{ taskTab === "create" ? "执行人" : "指派人" }}
      </div>
      <div class="taskTree-right-box" v-if="memberList.length > 0">
        <div
          class="icon-point q-my-xs"
          @click.stop="chooseMember(null, props.taskList)"
          :style="chooseKey === '' ? { border: '3px solid #07be51' } : {}"
        >
          <q-avatar color="secondary" text-color="white" size="32px"
            >全</q-avatar
          >
        </div>
        <div
          class="icon-point q-my-xs"
          v-for="(item, index) in memberList"
          :key="`task${index}`"
          @click.stop="chooseMember(item._key, props.taskList)"
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
    <c-drawer
      :visible="drawerVisible"
      title="我的任务"
      @close="drawerVisible = false"
      :drawerStyle="{
        width: '450px',
      }"
      noMask
      showClose
    >
      <template #content>
        <CreateTask :father-team-key="teamKey" :father-tree-info="treeInfo" />
      </template>
    </c-drawer>
  </div>
</template>

<style lang="scss" scoped>
.task-box {
  min-width: 100%;
  height: calc(100% - 50px);
  overflow-x: auto;
  overflow-y: hidden;
  background: #f2f3f6;
  padding-right: 60px;
  box-sizing: border-box;
  @include flex(flex-start, center, null);

  .taskTree-box {
    width: 455px;
    height: 100%;
    flex-shrink: 0;
    margin-right: 5px;
    @include p-number(5px, 10px);

    .taskTree-top {
      width: 100%;
      /* prettier-ignore */
      height: 50Px;
      margin-bottom: 10px;
      font-size: 14px;
      background-color: #fff;
      border-radius: 10px;
      @include flex(space-between, center, null);
      @include p-number(0px, 10px);
    }

    .taskTree-bottom {
      width: 100%;
      /* prettier-ignore */
      height: calc(100% - 50Px);
      @include scroll();
    }
  }
  .taskTree-right {
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

    .taskTree-right-title {
      //margin: 10px 0px;
      font-size: 14px;
      font-weight: bolder;
    }

    .taskTree-right-box {
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
