<script setup lang="ts">
import appStore from "@/store";
import * as echarts from "echarts";
import { storeToRefs } from "pinia";
const { deviceType } = storeToRefs(appStore.commonStore);
const props = defineProps<{
  riverId: string;
  chartData: any;
  chartName?: string[];
  type?: string;
  yData?: any;
  xData?: any;
}>();
const emits = defineEmits<{
  (e: "chooseDate", date: string, index: number): void;
}>();
const dayjs: any = inject("dayjs");
let chart: any | null = null;
onMounted(() => {
  let chartDom: any = document.getElementById(props.riverId);
  chart = echarts.init(chartDom);
  let option: any = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "rgba(0,0,0,0.2)",
          width: 1,
          type: "solid",
        },
      },
    },
    singleAxis: {
      top: 50,
      bottom: 50,
      axisTick: {},
      axisLabel: {},
      type: "time",
      axisPointer: {
        animation: true,
        // label: {
        //   show: true,
        // },
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.2,
        },
      },
      // axisLine: { show: true }
    },
    series: [
      {
        type: "themeRiver",
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.8)",
          },
        },
        data: props.chartData,
        label: {
          show: false,
        },
      },
    ],
  };
  if (!props.type) {
    option.legend = {
      data: props.chartName,
    };
  } else {
    option.singleAxis = {
      ...option.singleAxis,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    };
  }

  option && chart.setOption(option);
  //   chart.on("click", function (params) {
  //     console.log(params);
  //     if (params.componentType === "xAxis") {
  //       emits("chooseDate", params.value, params.dataIndex);
  //     } else if (params.componentType === "series") {
  //       emits("chooseDate", params.name, params.dataIndex);
  //     }
  //   });
});
watch(
  () => props.chartData,
  (newVal) => {
    //@ts-ignore
    chart.setOption<echarts.EChartsOption>({
      series: [
        {
          data: newVal,
        },
      ],
    });
    //@ts-ignore
    chart.resize();
  },
  { deep: true }
);
</script>
<template>
  <div :id="riverId" class="line-chart"></div>
</template>
<style scoped lang="scss">
.line-chart {
  width: 100%;
  height: 100%;
}
</style>
<style></style>
