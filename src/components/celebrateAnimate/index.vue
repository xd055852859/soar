<script setup lang="ts">
const particle = ref<any>([]);
let width = ref<number>(0);
let height = ref<number>(0);
let context = ref<any>(null);
let timer = ref<any>(null);
onMounted(() => {
  init(300);
});
onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
});

const init = (n) => {
  let canvas: any = document.getElementById("adai_canvas");
  context.value = canvas.getContext("2d");
  width.value = canvas.width = document.documentElement.offsetWidth;
  height.value = canvas.height = document.documentElement.offsetHeight;
  let colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
  ];
  let w = width.value,
    x = w / 2;
  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }
  for (var i = 0; i < n; i++) {
    particle.value.push({
      x: x,
      y: 340,
      boxW: randomRange(5, 20),
      boxH: randomRange(5, 20),
      size: randomRange(2, 8),
      spikeran: randomRange(3, 5),
      velX: randomRange(-8, 8),
      velY: randomRange(-50, -10),
      angle: convertToRadians(randomRange(0, 360)),
      color: colors[Math.floor(Math.random() * colors.length)],
      anglespin: randomRange(-0.2, 0.2),
      draw: function () {
        context.value.save();
        context.value.translate(this.x, this.y);
        context.value.rotate(this.angle);
        context.value.fillStyle = this.color;
        context.value.beginPath();
        context.value.fillRect(
          (this.boxW / 2) * -1,
          (this.boxH / 2) * -1,
          this.boxW,
          this.boxH
        );
        context.value.fill();
        context.value.closePath();
        context.value.restore();
        this.angle += this.anglespin;
        this.velY *= 0.999;
        this.velY += 0.3;

        this.x += this.velX;
        this.y += this.velY;
        if (this.y < 0) {
          this.velY *= -0.2;
          this.velX *= 0.9;
        }
        if (this.y > height.value) {
          this.anglespin = 0;
          this.y = height.value;
          this.velY *= -0.2;
          this.velX *= 0.9;
        }
        if (this.x > width.value || this.x < 0) {
          this.velX *= -0.5;
        }
      },
    });
  }
};
watch(particle, (newParticle) => {
  if (newParticle) {
    timer.value = setInterval(() => {
      update();
    }, 20);
    setTimeout(() => {
      if (timer.value) {
        clearTimeout(timer.value);
      }
    }, 5000);
  }
},{immediate:true});
const drawScreen = () => {
  for (var i = 0; i < particle.value.length; i++) {
    particle.value[i].draw();
  }
};
const update = () => {
  context.value.clearRect(0, 0, width.value, height.value);
  drawScreen();
};
const convertToRadians = (degree) => {
  return degree * (Math.PI / 180);
};
</script>
<template>
  <div class="adai_fire_wrap">
    <canvas id="adai_canvas"></canvas>
  </div>
</template>
<style scoped lang="scss">
.adai_fire_wrap {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  canvas {
    width: 100%;
    height: 100%;
    display: block;
    border: none;
  }
}
</style>
<style lang="scss"></style>
