<script setup lang="ts">
import appStore from "@/store";
import * as echarts from "echarts";
import { storeToRefs } from "pinia";
const { deviceType } = storeToRefs(appStore.commonStore);
const props = defineProps<{
  lineId: string;
  chartData: any;
  changeSize?: number;
  yData?: any;
  xData?: any;
  lineData?: any;
}>();
const emits = defineEmits<{
  (e: "chooseDate", date: string, index: number): void;
}>();
const dayjs: any = inject("dayjs");
let chart: any | null = null;
let option: echarts.EChartsOption | null = null;
const xAxisData = ref<any>(null);
const seriesData = ref<any>(null);
const nameData = ref<any>(null);
const lineWidth = ref<number>(0);
const lineLeft = ref<string>("15%");
onMounted(() => {
  lineWidth.value = deviceType.value === "pc" ? 1.05 : 0.97;
  lineLeft.value = deviceType.value === "pc" ? "4%" : "10%";
  xAxisData.value = [
    ...props.chartData[0].map((item) => {
      return dayjs(item.ctime).format("MM-DD");
    }),
    ...props.chartData[1].map((item) => {
      return dayjs(item.ctime).format("MM-DD");
    }),
  ];

  seriesData.value = props.chartData.map((item, index) => {
    let newItem: any = {
      name: props.lineData[index].name,
      type: "line",
      min: props.lineData[index].min,
      max: props.lineData[index].max,
      yAxisIndex: index,
      showSymbol: false,
      itemStyle: {
        color: `rgb(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]})`,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: `rgba(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]},0.6)`,
          },
          {
            offset: 1,
            color: `rgba(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]},0)`,
          },
        ]),
      },
      data: [],
      smooth: true,
    };
    item.forEach((countItem) => {
      newItem.data.push(countItem.count);
    });
    console.log(newItem);
    return newItem;
  });
  nameData.value = props.lineData.map((item) => {
    return item.name;
  });
  let chartDom: any = document.getElementById(props.lineId);
  chart = echarts.init(chartDom, null, {
    width: document.documentElement.offsetWidth * lineWidth.value * 0.9,
    height: chartDom.parentElement.offsetHeight * 1.1,
  });
  option = {
    legend: {
      data: nameData.value,
    },
    grid: {
      left: lineLeft.value,
      // right: '4%',
      top: "17%",
      // containLabel: true
    },
    xAxis: {
      name: "",
      type: "category",
      data: props.xData,
      triggerEvent: true,
    },
    yAxis: props.yData,
    tooltip: {
      trigger: "axis",
    },
    series: seriesData.value,
  };

  option && chart.setOption(option);
  chart.on("click", function (params) {
    console.log(params);
    if (params.componentType === "xAxis") {
      emits("chooseDate", params.value, params.dataIndex);
    } else if (params.componentType === "series") {
      emits("chooseDate", params.name, params.dataIndex);
    }
  });
});
watch(
  () => props.chartData,
  (newVal) => {
    seriesData.value = props.chartData.map((item, index) => {
      let newItem: any = {
        name: props.lineData[index].name,
        type: "line",
        min: props.lineData[index].min,
        max: props.lineData[index].max,
        yAxisIndex: index,
        showSymbol: false,
        itemStyle: {
          color: `rgb(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]})`,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: `rgba(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]},0.6)`,
            },
            {
              offset: 1,
              color: `rgba(${props.lineData[index].areaColor[0]},${props.lineData[index].areaColor[1]},${props.lineData[index].areaColor[2]},0)`,
            },
          ]),
        },
        data: [],
        smooth: true,
      };
      item.forEach((countItem) => {
        newItem.data.push(countItem.count);
      });
      console.log(newItem);
      return newItem;
    });
    //@ts-ignore
    chart.setOption<echarts.EChartsOption>({
      series: seriesData.value,
    });
    //@ts-ignore
    chart.resize();
  },
  { deep: true }
);
watch(
  () => props.changeSize,
  (newVal) => {
    let chartDom: any = document.getElementById(props.lineId);
    let width = newVal ? 0.75 : lineWidth.value;
    //@ts-ignore
    chart.resize({
      width: document.documentElement.offsetWidth * 0.9 * width,
      height: chartDom.parentElement.offsetHeight * 1.1,
    });
  }
);
</script>
<template>
  <div :id="lineId" class="line-chart"></div>
</template>
<style scoped lang="scss">
.line-chart {
  width: 100%;
  height: 100%;
}
</style>
<style></style>
