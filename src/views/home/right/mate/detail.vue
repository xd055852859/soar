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

const { spaceKey, privateTeamKey } = storeToRefs(appStore.spaceStore);
const { mateKey, mateList, mateInfo } = storeToRefs(appStore.mateStore);
const { setMateKey, getMateList } = appStore.mateStore;
const { setTeamKey } = appStore.teamStore;
const dayjs: any = inject("dayjs");
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
const menuTab = ref<string>("payNum");
const monthTitleArr = ref<any>([]);
const monthData = ref<any>([]);
const begTime = ref<number>(0);
const logDate = ref<string>("");
const logList = ref<any>([]);
const monthArr = ["日", "一", "二", "三", "四", "五", "六"];
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
    console.log(mateCardList.value);
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
const getPayNumData = async () => {
  let monthStartTime = dayjs()
    .subtract(3, "month")
    .startOf("month")
    .startOf("day")
    .valueOf();
  let monthEndTime = dayjs()
    .add(1, "month")
    .startOf("month")
    .startOf("day")
    .valueOf();
  let monthObj = {
    begTime: monthStartTime,
    endTime: monthEndTime,
  };
  let monthTimeArr = [
    {
      begTime: dayjs()
        .subtract(2, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
      endTime: dayjs()
        .subtract(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
    },
    {
      begTime: dayjs()
        .subtract(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
      endTime: dayjs().startOf("month").startOf("day").valueOf(),
    },
    {
      begTime: dayjs().startOf("month").startOf("day").valueOf(),
      endTime: dayjs()
        .add(1, "month")
        .startOf("month")
        .startOf("day")
        .valueOf(),
    },
  ];
  let monthRes: any = (await await api.request.get("teamMate/payNum", {
    teamKey: spaceKey.value,
    mateKey: mateKey.value,
    ...monthObj,
  })) as ResultProps;
  if (monthRes.msg === "OK") {
    // monthRes.result.forEach((item: any) => {
    //   newMonthData.push({
    //     weekDay: moment(item.begTime).format('dddd'),
    //     value: item.value * 10,
    //   });
    // });
    monthTimeArr.forEach((monthItem, monthIndex) => {
      monthData.value[monthIndex] = [];
      monthRes.data.forEach((item: any, index) => {
        item.begTime = dayjs(item.time).startOf("day").valueOf();
        if (
          item.begTime >= monthItem.begTime &&
          item.begTime < monthItem.endTime
        ) {
          monthData.value[monthIndex].push({
            color: getColor(item.score),
            date: dayjs(item.begTime).date(),
            score: item.score,
            begTime: item.begTime,
          });
        }
      });
    });
    monthData.value.forEach((item: any, index: number) => {
      if (item[0]?.begTime) {
        monthTitleArr.value.unshift(dayjs(item[0].begTime).format("M") + "月");
        item = formatMonth(item[0].begTime, item);
      } else {
        monthTitleArr.value.unshift("");
      }
    });
    monthData.value.reverse();
    begTime.value = dayjs().startOf("day").valueOf();
    logDate.value = dayjs().format("M") + "月" + dayjs().format("D") + "日";
  }
};
const getColor = (num: number) => {
  let color = "";
  if (num <= 0) {
    color = "#D8E2FF";
  } else if (num < 10 && num > 0) {
    color = "#D1DEFF";
  } else if (num < 20 && num >= 10) {
    color = "#94B2FF";
  } else if (num < 30 && num >= 20) {
    color = "#7FA3FF";
  } else if (num < 40 && num >= 30) {
    color = "#376EF8";
  } else if (num < 50 && num >= 40) {
    color = "#476FD5";
  } else if (num < 60 && num >= 50) {
    color = "#1F4CC1";
  } else if (num >= 60) {
    color = "#214EC1";
  }
  return color;
};
const formatMonth = (time: number, arr: any) => {
  let weekIndex = dayjs(time).day();
  for (let i = weekIndex - 1; i > -1; i--) {
    arr.unshift({
      color: "#FFFFFF",
      date: "",
      value: "",
    });
  }
  return arr;
};
// watch(mateInfo, (newInfo) => {
//   if (newInfo) {
//     signature.value = newInfo.signature ? newInfo.signature : "在岗";
//   }
// });
watch(
  () => props.mateKey,
  (newKey) => {
    if (newKey) {
      setMateKey(newKey);
    }
  },
  { immediate: true },
);
watch(
  mateKey,
  (newKey) => {
    if (newKey) {
      getMateTeam();
      getPayNumData();
    }
  },
  { immediate: true },
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
  { immediate: true },
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
          <!--          <div class="mateCard-signature">-->
          <!--            <q-btn-->
          <!--              color="#fff"-->
          <!--              dense-->
          <!--              class="createSpace-button full-width"-->
          <!--              flat-->
          <!--              :label="-->
          <!--                signatureArray[-->
          <!--                  _.findIndex(signatureArray, { label: signature })-->
          <!--                ]?.label-->
          <!--              "-->
          <!--            />-->
          <!--          </div>-->
        </div>
        <q-menu style="width: 348px; padding: 10px 0px">
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
                    alt=""
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
        <q-tabs
          v-model="menuTab"
          dense
          align="left"
          indicator-color="primary"
          active-class="text-primary"
        >
          <q-tab name="payNum" label="贡献度" />
          <q-tab name="cooperate" label="协作群" />
          <q-tab name="notJoined" label="其他群" />
        </q-tabs>
        <div
          class="teamMenu-list vitality-month-container"
          v-if="menuTab === 'payNum'"
        >
          <div class="full-width dp--center" style="height: 40px">
            <div
              v-for="(monthItem, monthIndex) in monthArr"
              class="vitality-month-item-title vitality-month-item"
              :key="`month${monthIndex}`"
            >
              {{ monthItem }}
            </div>
          </div>
          <div class="vitality-month-box">
            <template
              v-for="(item, index) in monthData"
              :key="`monthData${index}`"
            >
              <div
                class="vitality-month-title"
                @click=""
                v-if="monthTitleArr[index]"
              >
                {{ monthTitleArr[index] }}
              </div>
              <div class="vitality-month-info">
                <div
                  v-for="(dayItem, dayIndex) in item"
                  class="vitality-month-item"
                  :key="`vitality${dayIndex}`"
                >
                  <div
                    class="vitality-month-item-day"
                    :style="{
                      // backgroundColor: dayItem.color,
                      backgroundColor: dayItem.date
                        ? 'rgba(233, 233, 233, 0.5)'
                        : 'rgba(255, 255, 255, 0)',
                      border: dayItem.date ? '1px solid #fff' : 0,
                    }"
                    @click=""
                  >
                    <!-- getTargetLog(dayItem.begTime); -->
                    <div
                      class="vitality-changeNum-box"
                      :style="{
                        color: dayItem.score > 0 ? '#fff' : '#FB7552',
                      }"
                      v-if="dayItem.score"
                    >
                      {{ dayItem.score }}
                    </div>
                    <div
                      class="vitality-changeNum"
                      :style="{
                        borderColor: `${dayItem.color} transparent transparent transparent`,
                      }"
                      v-if="dayItem.score"
                    ></div>

                    {{ dayItem.date }}
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="teamMenu-list" v-else-if="menuTab === 'cooperate'">
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
        <div class="teamMenu-list" v-else-if="menuTab === 'notJoined'">
          <template v-for="(item, index) in mateJoinList" :key="`team${index}`">
            <div
              class="teamMenu-item icon-point"
              v-if="item._key !== privateTeamKey"
            >
              <div># {{ item.name }}</div>
              <div @click="joinTeam(item._key)">
                <q-btn color="primary" flat label="申请加入" size="12px" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="mateDetail-right">
      <template v-if="menuTab === 'payNum'"> </template>
      <template v-else>
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
        <q-tabs
          v-model="mateTab"
          dense
          align="left"
          indicator-color="primary"
          active-class="text-primary"
        >
          <q-tab name="task" label="任务" />
          <q-tab name="doc" label="文档" />
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
                <fileCard
                  :card="item"
                  :type="mateTab === 'task' ? 'taskBox' : 'doc'"
                  outType="mate"
                />
              </template>
            </div>
          </q-card-section>
        </q-card>
      </template>
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
      @include p-number(10px, 10px);
      @include scroll();
      .teamMenu-title {
        width: 100%;
        height: 30px;
        font-size: 16px;
        font-weight: bolder;
        color: #161616;
        line-height: 30px;
        margin-bottom: 5px;
        @include p-number(5px, 15px);
        @include flex(space-between, center, null);
      }
      .vitality-month-container {
        width: 100%;
        height: calc(100% - 40px);

        .vitality-month-box {
          width: 100%;
          height: calc(100% - 40px);
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          -webkit-overflow-scrolling: touch;
          @include scroll();
        }
        .vitality-month-item {
          width: calc(96% / 7);
          cursor: pointer;
        }

        .vitality-month-item-day {
          height: 36px;
          box-sizing: border-box;
          text-align: center;
          line-height: 36px;
          color: #333;
          margin-left: -1px;
          margin-bottom: -1px;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .vitality-month-info {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          position: relative;
          padding-left: 10px;
          box-sizing: border-box;
          margin-bottom: 5px;
        }
        .vitality-month-title {
          height: 26px;
          line-height: 26px;
          font-size: 16px;
          font-weight: 500;
          color: #fff;
          padding: 0px 10px;
          border-radius: 15px;
          background-color: #1890ff;
          cursor: pointer;
          margin: 10px;
        }
        .vitality-month-item-title {
          height: 17px;
          font-size: 12px;
          font-weight: 400;
          color: rgba(94, 138, 251, 1);
          line-height: 17px;
          text-align: center;
          border: 1px solid transparent;
          margin-right: 1px;
          margin-bottom: 1px;
        }

        .vitality-changeNum {
          width: 0;
          height: 0;
          border-width: 20px;
          border-style: solid;
          position: absolute;
          top: 0px;
          right: -20px;
        }

        .vitality-changeNum-box {
          position: absolute;
          right: 1px;
          top: -12px;
          z-index: 10;
          font-size: 10px;
          transform: scale(0.8);
        }
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
