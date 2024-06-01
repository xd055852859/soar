<script setup lang="ts">
import MateSetting from "@/views/home/right/mate/setting.vue";
import Icon from "@/components/common/Icon.vue";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import CEmpty from "@/components/common/cEmpty.vue";
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { setMessage } from "@/services/util/common";
const socket: any = inject("socket");
const { spaceMemberList, spaceKey } = storeToRefs(appStore.spaceStore);
const { mateList } = storeToRefs(appStore.mateStore);
const { user } = storeToRefs(appStore.authStore);
const { setSpaceMemberList } = appStore.spaceStore;
const { getMateList, setMateList } = appStore.mateStore;
const mateKey = ref<string>("");
const mateState = ref<boolean>(true);
const memberList = computed(() =>
  spaceMemberList.value.filter(
    (item) => !item.beMate && item.userKey !== user.value!._key,
  ),
);
const addMate = async (userKey) => {
  const setRes = (await api.request.post("teamMate", {
    teamKey: spaceKey.value,
    mateKey: userKey,
  })) as ResultProps;
  if (setRes.msg === "OK") {
    let list = _.cloneDeep(spaceMemberList.value);
    setMessage("success", "添加队友成功");
    let index = _.findIndex(spaceMemberList.value, { userKey: userKey });
    console.log(index);
    if (index !== -1) {
      list[index] = { ...list[index], beMate: true };
    }
    setSpaceMemberList(list);
    getMateList(spaceKey.value);
  }
};
const removeMate = async (userKey, userIndex) => {
  const setRes = (await api.request.delete("teamMate", {
    teamKey: spaceKey.value,
    mateKey: userKey,
  })) as ResultProps;
  if (setRes.msg === "OK") {
    let list = _.cloneDeep(spaceMemberList.value);
    setMessage("success", "删除队友成功");
    let index = _.findIndex(spaceMemberList.value, { userKey: userKey });
    if (index !== -1) {
      list[index] = { ...list[index], beMate: false };
    }
    setSpaceMemberList(list);
    let newMateList = [...mateList.value];
    newMateList.splice(userIndex, 1);
    setMateList([...newMateList]);
  }
};
</script>
<template>
  <div class="mateMenu">
    <!-- <OnClickOutside @trigger="searchVibisible = false"> -->
    <div class="leftMenu-title">
      <div class="leftMenu-title-left"></div>
      <div class="leftMenu-title-right">
        <q-btn flat round>
          <Icon name="a-chuangjian2" :size="20" />
          <q-menu anchor="top end" class="q-pa-none" style="height: 70vh">
          </q-menu>
        </q-btn>
      </div>
    </div>
    <div class="mateMenu-container">
      <template v-if="mateState">
        <div class="mateMenu-list-header icon-point" @click="mateState = false">
          通讯录
          <Icon name="right" :size="24" />
        </div>
        <div class="mateMenu-list">
          <template v-if="mateList.length > 0">
            <div
              class="mateMenu-item"
              v-for="(item, index) in mateList"
              :key="`mate${index}`"
              @click="
                $router.push(`/home/mate/detail/${item._key}`);
                mateKey = item._key;
              "
            >
              <div
                class="mateMenu-item-title icon-point"
                @click=""
                :style="{
                  background: mateKey === item._key ? '#eee' : '',
                }"
              >
                <div class="mateMenu-item-avatar q-mr-sm">
                  <img
                    :src="
                      item.userAvatar
                        ? item.userAvatar
                        : '/common/defaultPerson.png'
                    "
                    alt=""
                  />

                  <!--            -->
                </div>
                <img
                  class="mateMenu-item-online"
                  src="/online.svg"
                  v-if="item.online"
                  alt=""
                />
                <div>
                  {{ item.userName }}

                  <span
                    class="text-grey-6"
                    style="font-size: 12px"
                    v-if="item.post"
                    >( {{ item.post }} )
                  </span>
                </div>
              </div>
              <q-btn
                flat
                label="取消关注"
                color="primary"
                @click.stop="removeMate(item._key, index)"
                class="mateMenu-item-button"
              />
            </div>
          </template>
          <c-empty title="暂无队友" v-else />
        </div>
      </template>
      <template v-else>
        <div class="mateMenu-list-header icon-point" @click="mateState = true">
          <div class="dp--center"><Icon name="left" :size="24" /> 返回</div>
        </div>
        <div class="mateMenu-list">
          <div
            class="mateMenu-item"
            v-for="(item, index) in memberList"
            :key="`mate${index}`"
            @click="
              $router.push(`/home/mate/detail/${item.userKey}`);
              mateKey = item.userKey;
            "
          >
            <div
              class="mateMenu-item-title icon-point"
              @click=""
              :style="{
                background: mateKey === item.userKey ? '#eee' : '',
              }"
            >
              <div class="mateMenu-item-avatar q-mr-sm">
                <img
                  :src="
                    item.userAvatar
                      ? item.userAvatar
                      : '/common/defaultPerson.png'
                  "
                  alt=""
                />

                <!--            -->
              </div>
              <div>
                {{ item.userName }}
              </div>
            </div>
            <q-btn
              flat
              label="关注"
              color="primary"
              @click.stop="addMate(item.userKey)"
              class="mateMenu-item-button"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped lang="scss">
.mateMenu {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 0;
  }
}
.mateMenu-container {
  width: 100%;
  height: calc(100% - 50px);
  .mateMenu-list-header {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid $grey-3;
    margin-bottom: 10px;
    @include flex(space-between, center, null);
  }
  .mateMenu-list {
    width: 100%;
    height: calc(100% - 50px);
    @include scroll();
  }
  //.mateMenu-set-header {
  //  width: 100%;
  //  height: 35px;
  //  @include flex(space-between, center, null);
  //}
  //.mateMenu-set {
  //  width: 100%;
  //  height: calc(100% - 35px);
  //  @include scroll();
  //}
  .mateMenu-item {
    position: relative;
    z-index: 1;
    @include flex(space-between, center, null);
    .mateMenu-item-title {
      flex: 1;
      height: 50px;
      font-size: 14px;
      border-radius: 4px;
      box-sizing: border-box;
      line-height: 50px;
      @include flex(flex-start, center, null);
    }

    .mateMenu-item-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .mateMenu-item-online {
      width: 16px;
      position: absolute;
      z-index: 2;
      left: 15px;
      bottom: 10px;
      border-radius: 50%;
    }
    .mateMenu-item-button {
      display: none;
    }
    &:hover {
      background: #f5f5f5;
      .mateMenu-item-button {
        display: flex;
      }
    }
  }
}
</style>
<style></style>
