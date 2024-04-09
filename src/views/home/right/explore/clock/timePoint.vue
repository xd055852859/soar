<script setup lang="ts">
// import { onUnmounted, onMounted, ref, watchEffect } from "vue";
// import TimeDate from "./timeDate.vue";
//defineProps,defineEmits
const canvas = ref<{ width: number; height: number }>({
  width: 600,
  height: 600,
});
const L = ref<number>(0); //基础半径
const timer = ref<any>(null);
onMounted(() => {
  const width: number = parseInt(
    document.documentElement.offsetHeight * 0.6 + ""
  );
  canvas.value = {
    width: width,
    height: width,
  };
  drawCoolClock();
  timer.value = setInterval(() => {
    drawCoolClock();
  }, 1000);
});
onUnmounted(() => {
  clearInterval(timer.value);
  timer.value = null;
});

const drawCoolClock = () => {
  let newCanvas: any = document.getElementById("coolClockCanvas");
  if (newCanvas) {
    let ctx = newCanvas.getContext("2d");
    let [x0, y0] = [canvas.value.width / 2, canvas.value.height / 2]; //获取圆心x,y
    L.value = canvas.value.width / 2 - 10; //设置圆半径
    let [hourMaxL, hourMinL] = [L.value, L.value]; //获取时刻度首位距离x0,y0位置
    let [minMaxL, minMinL] = [L.value - 2, L.value - 8];
    let centerL = 15;
    let oDate = new Date(); //绑定当前时间
    let oHours = oDate.getHours();
    let oMin = oDate.getMinutes();
    let oSen = oDate.getSeconds();
    let oHoursValue = -90 + oHours * 30 + oMin / 2; //获取小时的角度
    let oMinValue = -90 + oMin * 6;
    let oSenValue = -90 + oSen * 6;
    ctx.clearRect(0, 0, newCanvas.width, newCanvas.height); //清除画布
    drawHoursScale(ctx, x0, y0, 12, 9, hourMaxL, hourMinL, "#5c5c5c"); //绘制表盘的时钟刻度scale
    // drawHoursScale(ctx, x0, y0, 60, 3, minMaxL, minMinL, "#fff"); //绘制表盘分钟刻度
    // drawScaleNum(ctx, hourMinL - 25, x0, y0, "#fff"); //绘制12个表盘数字
    drawTimeNeedle(ctx, x0, y0, 8, 135, oHoursValue, "#9ca3aa"); //绘制时针
    drawTimeNeedle(ctx, x0, y0, 4, minMaxL - 15, oMinValue, "#9ca3aa"); //绘制分针
    drawTimeNeedle(ctx, x0, y0, 3, minMaxL - 2, oSenValue, "#e02020"); //绘制秒针
    drawSenDotted(ctx, "#e02020", x0, y0, oSenValue - 180, centerL); //绘制秒针尾部
    drawCircleCenter(ctx, x0, y0, "#9ca3aa", centerL); //绘制圆心
  }
};
const drawHoursScale = (ctx, x0, y0, scaleNum, scaleW, maxL, minL, color) => {
  for (let i = 0; i < scaleNum; i++) {
    let angel = -90 + i * (360 / scaleNum); //角度
    let [x1, y1] = [
      x0 + Math.cos((angel * Math.PI) / 180) * maxL,
      y0 + Math.sin((angel * Math.PI) / 180) * maxL,
    ];
    let [x2, y2] = [
      x0 + Math.cos((angel * Math.PI) / 180) * minL,
      y0 + Math.sin((angel * Math.PI) / 180) * minL,
    ];

    ctx.save();
    ctx.beginPath();
    if (i % 3 === 0) {
      ctx.lineWidth = scaleW * 2;
    } else {
      ctx.lineWidth = scaleW;
    }

    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
};
const drawScaleNum = (ctx, L, x0, y0, color) => {
  for (let i = 0; i < 12; i++) {
    let angel = -90 + i * (360 / 12); //角度
    let [x, y] = [
      x0 + Math.cos((angel * Math.PI) / 180) * L,
      y0 + Math.sin((angel * Math.PI) / 180) * L,
    ];
    let num = i == 0 ? 12 : i;
    ctx.save();
    ctx.beginPath();
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(num, x, y);
    ctx.closePath();
    ctx.restore();
  }
};
const drawTimeNeedle = (ctx, x0, y0, lineW, L, angel, color = "#fff") => {
  let [x, y] = [
    x0 + Math.cos((angel * Math.PI) / 180) * L,
    y0 + Math.sin((angel * Math.PI) / 180) * L,
  ];
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineW;
  ctx.lineCap = "round";
  ctx.moveTo(x0, y0);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
};
const drawCircleCenter = (ctx, x0, y0, color, L) => {
  ctx.save();
  ctx.beginPath();
  ctx.shadowBlur = 4;
  ctx.shadowColor = "#000";
  ctx.fillStyle = color;
  ctx.arc(x0, y0, L, 0, (360 * Math.PI) / 180);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};
const drawSenDotted = (ctx, color, x0, y0, angel, L) => {
  let [x, y] = [
    x0 + Math.cos((angel * Math.PI) / 180) * L,
    y0 + Math.sin((angel * Math.PI) / 180) * L,
  ];
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, 7, 0, (360 * Math.PI) / 180);
  ctx.fill();
  ctx.closePath();
  ctx.restore();
};
</script>
<template>
  <canvas
    id="coolClockCanvas"
    :width="canvas.width"
    :height="canvas.height"
  ></canvas>
  <!-- <TimeDate /> -->
</template>
<style scoped lang="scss"></style>
