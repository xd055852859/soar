<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import { ResultProps } from "@/interface/Common";
import riverChart from "@/components/chart/riverChart.vue";
import fileCard from "@/components/fileCard/fileCard.vue";
import api from "@/services/api";
import { setLoading, setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";

import _ from "lodash";
import { formatName, dayArray, signatureArray } from "@/services/config/config";
import { commonscroll } from "@/services/util/common";

const { spaceKey } = storeToRefs(appStore.spaceStore);
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const { setMateKey, getMateList } = appStore.mateStore;
const { setTeamKey } = appStore.teamStore;

const props = defineProps<{
  mateKey: string;
}>();
const page = ref<number>(1);
const mateTeamKey = ref<string>("");
const mateTeamInfo = ref<any>(null);
const mateTeamList = ref<any>([]);
const mateJoinList = ref<any>([]);
const mateCardList = ref<any>([]);
const total = ref<number>(0);
const days = ref<number>(7);
const chartData = ref<any>(null);
const chartName = ref<string[]>([]);
const mateTab = ref<string>("task");
const signature = ref<string>("");

const getMateTeam = async () => {
  let detailRes = (await api.request.get("teamMate/project", {
    teamKey: spaceKey.value,
    mateKey: mateKey.value,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    mateTeamList.value = [...detailRes.data.cooperateList];
    mateJoinList.value = [...detailRes.data.notJoinedList];
    total.value = detailRes.total as number;
    mateTeamKey.value = mateTeamList.value[0]._key;
  }
};
const getMateChart = async () => {
  let detailRes = (await api.request.get("teamMate/active", {
    teamKey: spaceKey.value,
    projectKey: mateTeamKey.value,
    mateKey: mateKey.value,
    days: days.value,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    [chartData.value, chartName.value] = formatName(detailRes.data);
    console.log(chartData.value);
    // mateTeamList.value = [...detailRes.data.cooperateList];
    // mateJoinList.value = [...detailRes.data.notJoinedList];
    // total.value = detailRes.total as number;
    // mateTeamKey.value = mateTeamList.value[0]._key;
  }
};
const getMateCard = async () => {
  let detailRes = (await api.request.get("teamMate/card", {
    teamKey: spaceKey.value,
    projectKey: mateTeamKey.value,
    mateKey: mateKey.value,
    filterType: mateTab.value,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
    if (page.value === 1) {
      mateCardList.value = [];
    }
    mateCardList.value = [...mateCardList.value, ...detailRes.data];
    total.value = detailRes.total as number;
  }
};
const joinTeam = async (key) => {
  let joinRes = (await api.request.post("projectMember/apply", {
    projectKey: key,
  })) as ResultProps;
  if (joinRes.msg === "OK") {
    setMessage("success", "申请加入成功");
    // mateTeamList.value = [...detailRes.data.cooperateList];
    // mateJoinList.value = [...detailRes.data.notJoinedList];
    // total.value = detailRes.total as number;
    // mateTeamKey.value = mateTeamList.value[0]._key;
  }
};
watch(mateInfo, (newInfo) => {
  if (newInfo) {
    signature.value = newInfo.signature ? newInfo.signature : "在岗";
  }
});
watch(
  () => props.mateKey,
  (newKey) => {
    if (newKey) {
      setMateKey(newKey);
    }
  },
  { immediate: true }
);
watch(
  mateKey,
  (newKey) => {
    if (newKey) {
      getMateTeam();
    }
  },
  { immediate: true }
);
watch(
  mateTeamKey,
  (newKey) => {
    if (newKey) {
      getMateCard();
      let index = _.findIndex(mateTeamList.value, { _key: newKey });
      console.log(index);
      if (index !== -1) {
        mateTeamInfo.value = { ...mateTeamList.value[index] };
        console.log(mateTeamInfo.value);
      }
    }
  },
  { immediate: true }
);
watch(mateTab, () => {
  getMateCard();
  page.value = 1;
});
watchEffect(() => {
  if (mateTeamKey.value) {
    getMateChart();
  }
});
</script>
<template>
  <cHeader
    :title="`${mateInfo?.userName ? mateInfo?.userName : '队友详情'} - ${
      mateTeamInfo?.name ? mateTeamInfo.name : '群组'
    }`"
    backPath="/home/mate"
  />
  <div class="mateDetail">
    <div class="mateDetail-left">
      <div class="mateDetail-mateCard" v-if="mateInfo">
        <div class="mateCard-avatar-box">
          <div class="mateCard-avatar">
            <img
              :src="
                mateInfo.userAvatar
                  ? mateInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
            />
          </div>
        </div>
        <div class="mateCard-info">
          <div class="mateCard-top">
            {{ mateInfo.userName }}
            <q-icon name="keyboard_arrow_down" size="28px" />
          </div>
          <div class="mateCard-bottom">
            {{ mateInfo.post }}
          </div>
          <div class="mateCard-signature">
            <q-btn
              color="#fff"
              dense
              class="createSpace-button full-width"
              flat
              :label="
                signatureArray[
                  _.findIndex(signatureArray, { label: signature })
                ]?.label
              "
            />
          </div>
        </div>
        <q-menu style="width: 240px; padding: 10px 0px">
          <q-list>
            <q-item
              v-for="(item, index) in mateList"
              :key="`mate${index}`"
              clickable
              v-close-popup
              class="mateCard-menu"
              @click="setMateKey(item._key)"
            >
              <div class="mateCard-avatar-box">
                <div class="mateCard-avatar">
                  <img
                    :src="
                      item.userAvatar
                        ? item.userAvatar
                        : '/common/defaultGroup.png'
                    "
                  />
                </div>
              </div>
              <div class="mateCard-info">
                <div class="mateCard-top">
                  {{ item.userName }}
                </div>
                <div class="mateCard-bottom">
                  {{ item.post }}
                </div>
              </div>
              <div class="dp-center-center" v-if="mateKey === item._key">
                <q-icon name="check" size="28px" />
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="mateCard-teamMenu">
        <div>
          <div class="teamMenu-title">
            <div>群组</div>
          </div>
          <div class="teamMenu-list">
            <div
              class="teamMenu-item icon-point"
              v-for="(item, index) in mateTeamList"
              :key="`team${index}`"
              @click="mateTeamKey = item._key"
              :style="
                mateTeamKey === item._key ? { background: '#e9f9ef' } : null
              "
            >
              <div># {{ item.name }}</div>
              <div
                class="teamMenu-item-icon"
                @click.stop="
                  setTeamKey(item._key);
                  $router.push(`/home/team`);
                "
              >
                <!-- <q-btn flat round icon="sym_o_share_windows" size="12px">
                </q-btn> -->
              </div>
            </div>
          </div>
          <div class="teamMenu-title">
            <div>未加入群组</div>
          </div>
          <div class="teamMenu-list">
            <div
              class="teamMenu-item icon-point"
              v-for="(item, index) in mateJoinList"
              :key="`team${index}`"
            >
              <div># {{ item.name }}</div>
              <div @click="joinTeam(item._key)">
                <q-btn color="primary" flat label="申请加入" size="12px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mateDetail-right">
      <!-- <div class="mateDetail-right-title">{{ mateTeamInfo?.name }}</div> -->
      <q-card class="mateDetail-right-chart" v-if="mateInfo" flat>
        <div class="right-chart-left">
          <riverChart
            riverId="mateRiver"
            :chartData="chartData"
            :chartName="chartName"
            v-if="chartData"
          />
          <q-select
            style="width: 70px"
            v-model="days"
            :options="dayArray"
            dense
            emit-value
            map-options
            class="mate-chart-select"
          />
        </div>
        <!-- <div class="right-chart-right"></div> -->
      </q-card>
      <!-- <q-tabs
        v-model="mateTab"
        dense
        align="left"
        indicator-color="primary"
        active-class="text-primary"
      >
        <q-tab name="taskBox" label="任务" />
        <q-tab name="doc" label="文档" />
        <q-tab name="file" label="文件" />

      </q-tabs>
      <q-card flat class="mateDetail-right-card">
        <q-card-section class="q-pa-none">
          <div
            class="mateDetail-right-box"
            @scroll="
              commonscroll($event, mateCardList, total, () => {
                page++;
              })
            "
          >
            <template
              v-for="(item, index) in mateCardList"
              :key="`file${index}`"
            >
              <fileCard :card="item" :type="mateTab" outType="mate" />
            </template>
          </div>
        </q-card-section>
      </q-card> -->
    </div>
    <q-btn
      color="primary"
      round
      icon="navigate_before"
      class="mateDetail-back"
      @click="$router.back()"
    />
  </div>
</template>
<style scoped lang="scss">
.mateDetail {
  width: 100%;
  height: calc(100% - 60px);
  @include p-number(10px, 25px);
  @include flex(space-between, center, null);
  .mateDetail-left {
    width: 348px;
    height: 100%;
    margin-right: 20px;
    // @include p-number(10px, 0px);
    .mateDetail-mateCard {
      width: 100%;
      height: 140px;
      margin-bottom: 22px;
      background: #07be51;
      border-radius: 14px;
      box-shadow: -3px -4px 11px 0px #ffffff;
      color: #fff;
      position: relative;
      z-index: 1;
      @include flex(space-between, center, null);
      @include p-number(25px, 20px);
      .mateCard-signature {
        position: absolute;
        z-index: 2;
        bottom: 15px;
        right: 20px;
      }
    }
    .mateCard-menu {
      width: 100%;
    }
    .mateCard-teamMenu {
      width: 100%;
      height: calc(100% - 170px);
      background: #fafafb;
      border-radius: 14px;
      // box-shadow: 4px 5px 9px 0px rgba(183, 187, 202, 0.61);
      @include p-number(22px, 11px);
      @include scroll();
      .teamMenu-title {
        width: 100%;
        height: 30px;
        font-weight: bold;
        font-size: 16px;
        font-weight: bolder;
        color: #161616;
        line-height: 30px;
        margin-bottom: 5px;
        @include p-number(5px, 15px);
        @include flex(space-between, center, null);
      }
      .teamMenu-list {
        .teamMenu-item {
          width: 100%;
          height: 50px;
          font-size: 14px;
          color: #161616;
          line-height: 28px;
          margin-bottom: 5px;
          @include p-number(10px, 15px);
          @include flex(space-between, center, null);
          .teamMenu-item-icon {
            display: none;
          }
          &:hover {
            background: #e9f9ef;
            .teamMenu-item-icon {
              @include flex(center, center, null);
            }
          }
        }
      }
    }
  }

  .mateDetail-right {
    flex: 1;
    height: 100%;
    width: 0px;
    .mateDetail-right-chart {
      width: 100%;
      height: 280px;
      background: #ffffff;
      border-radius: 14px;
      box-shadow: 0px 4px 6px 0px rgba(203, 203, 203, 0.5);
      margin-bottom: 10px;
      .right-chart-left {
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
        @include p-number(15px, 15px);
        .mate-chart-select {
          position: absolute;
          z-index: 2;
          top: 10px;
          right: 20px;
        }
      }
    }
    .mateDetail-right-card {
      width: 100%;
      height: calc(100vh - 430px);
      background-color: transparent;
      margin-top: 10px;
      @include p-number(10px, 20px);
      @include scroll();
    }
  }
  .mateDetail-back {
    position: fixed;
    z-index: 20;
    top: 10px;
    left: 10px;
  }
}
</style>
<style lang="scss">
.mateCard-avatar-box {
  width: 90px;
  height: 100%;
  flex-shrink: 0;
  margin-right: 15px;
  @include flex(center, center, null);
  .mateCard-avatar {
    width: 90px;
    height: 90px;
    border-radius: 14px;
    overflow: hidden;
    @include flex(center, center, null);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.mateCard-info {
  flex: 1;
  height: 100%;
  align-content: flex-start;
  @include flex(flex-start, flex-start, wrap);
  .mateCard-top {
    width: 100%;
    height: 40px;
    font-size: 18px;
    font-weight: bold;
    line-height: 32px;
    margin-bottom: 10px;
    @include flex(space-between, center, null);
  }
  .mateCard-bottom {
    width: 100%;
    height: 22px;
    font-size: 14px;
    line-height: 22px;
  }
}
</style>
