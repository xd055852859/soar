<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import riverChart from "@/components/chart/riverChart.vue";
import fileCard from "@/components/fileCard/fileCard.vue";
import api from "@/services/api";
import { setLoading } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import _ from "lodash";
import { formatName, dayArray } from "@/services/config/config";
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
onMounted(() => {
  setMateKey(props.mateKey);
  // getMateDetail();
});
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
const joinTeam = async () => {};
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
  <div class="mateDetail">
    <div class="mateDetail-left q-mr-lg">
      <q-card flat bordered class="mateDetail-mateCard" v-if="mateInfo">
        <q-card-section class="mateCard-avatar">
          <q-avatar rounded size="80px">
            <img
              :src="
                mateInfo.userAvatar
                  ? mateInfo.userAvatar
                  : '/common/defaultGroup.png'
              "
            />
          </q-avatar>
        </q-card-section>
        <q-card-section class="mateCard-info">
          <div class="mateCard-top">
            {{ mateInfo.userName }}
            <q-icon name="keyboard_arrow_down" size="28px" />
          </div>
          <div class="mateCard-bottom">
            {{ mateInfo.post }}
          </div>
        </q-card-section>
        <q-menu style="width: 240px; padding: 10px 0px">
          <q-list>
            <q-item
              v-for="(item, index) in mateList"
              :key="`mate${index}`"
              clickable
              v-close-popup
              class=""
              @click="setMateKey(item._key)"
            >
              <div class="dp-center-center q-mr-md">
                <q-avatar rounded size="40px">
                  <img
                    :src="
                      item.userAvatar
                        ? item.userAvatar
                        : '/common/defaultGroup.png'
                    "
                  />
                </q-avatar>
              </div>
              <q-item-section>
                <div style="font-size: 18px; height: 30px">
                  {{ item.userName }}
                </div>
                <div class="mateCard-bottom">
                  {{ item.post }}
                </div>
              </q-item-section>
              <div class="dp-center-center" v-if="mateKey === item._key">
                <q-icon name="check" size="28px" />
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </q-card>
      <q-card flat bordered class="mateCard-teamMenu">
        <q-card-section>
          <div class="teamMenu-title">
            <div>小组</div>
          </div>
          <div class="teamMenu-list">
            <div
              class="teamMenu-item icon-point"
              v-for="(item, index) in mateTeamList"
              :key="`team${index}`"
              @click="mateTeamKey = item._key"
            >
              <div># {{ item.name }}</div>
              <div
                class="teamMenu-item-icon"
                @click.stop="
                  setTeamKey(item._key);
                  $router.push(`/home/team`);
                "
              >
                <q-btn flat round icon="send" size="12px"> </q-btn>
              </div>
            </div>
          </div>
          <div class="teamMenu-title">
            <div>折叠的小组</div>
          </div>
          <div class="teamMenu-list">
            <div
              class="teamMenu-item icon-point"
              v-for="(item, index) in mateJoinList"
              :key="`team${index}`"
              @click="mateTeamKey = item._key"
            >
              <div># {{ item.name }}</div>
              <div class="teamMenu-item-icon" @click="joinTeam">
                <q-btn color="primary" flat label="申请加入" size="12px" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="mateDetail-right">
      <div class="mateDetail-right-title">{{ mateTeamInfo?.name }}</div>
      <q-card flat bordered class="mateDetail-right-chart" v-if="mateInfo">
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
      <q-card flat bordered class="mateDetail-right-card">
        <q-card-section>
          <q-tabs
            v-model="mateTab"
            dense
            align="left"
            indicator-color="primary"
            active-class="text-primary"
          >
            <q-tab name="task" label="任务" />
            <q-tab name="doc" label="文档" />
            <q-tab name="file" label="文件" />
            <!-- <q-tab name="mails" label="知识库" /> -->
            <!-- <q-tab name="mails" label="多维表" /> -->
            <!-- <q-tab name="mails" label="洞察" /> -->
          </q-tabs>
        </q-card-section>
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
      </q-card>
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
  height: 100%;
  @include p-number(0px, 50px);
  @include flex(space-between, center, null);
  .mateDetail-left {
    width: 240px;
    height: 100%;
    @include p-number(20px, 0px);
    .mateDetail-mateCard {
      width: 100%;
      height: 120px;
      margin-bottom: 20px;
      @include flex(space-between, center, null);
      .mateCard-avatar {
        width: 90px;
        height: 100%;
        @include flex(center, center, null);
      }
    }
    .mateCard-info {
      width: calc(100% - 95px);
      height: 100%;
      align-content: center;
      @include flex(flex-start, center, wrap);
      .mateCard-top {
        width: 100%;
        height: 40px;
        font-size: 22px;
        @include flex(space-between, center, null);
      }
      .mateCard-bottom {
        width: 100%;
      }
    }
    .mateCard-teamMenu {
      width: 100%;
      height: calc(100% - 140px);
      @include scroll();
      .teamMenu-title {
        width: 100%;
        height: 40px;
        font-weight: bold;
        font-size: 18px;

        @include flex(space-between, center, null);
      }
      .teamMenu-list {
        .teamMenu-item {
          width: 100%;
          height: 30px;
          padding-left: 10px;
          box-sizing: border-box;
          margin-bottom: 10px;
          @include flex(space-between, center, null);
        }
      }
    }
  }
  .mateDetail-right {
    flex: 1;
    height: 100%;
    width: 0px;
    @include p-number(20px, 0px);
    .mateDetail-right-title {
      width: 100%;
      height: 30px;
      font-size: 20px;
      line-height: 30px;
    }
    .mateDetail-right-chart {
      width: 100%;
      height: 250px;
      margin: 10px 0px;
      .right-chart-left {
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
        .mate-chart-select {
          position: absolute;
          z-index: 2;
          top: 10px;
          right: 10px;
        }
      }
    }
    .mateDetail-right-box {
      width: 100%;
      height: calc(100vh - 440px);
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
<style></style>
