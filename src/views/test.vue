<script setup lang="ts">
import { useQuasar } from "quasar";
import { json } from "@/services/test.js";
// const $q = useQuasar();
// const slide = ref<any>("style");
// onMounted(() => {
//   $q.notify("Some other message");
// });
// const changeColor = () => {
//   $q.dark.set(!$q.dark.isActive);
// };
// watch(
//   () => $q.appVisible,
//   (val) => {
//     console.log(val ? "App became visible" : "App went in the background");
//   }
// );
onMounted(() => {
  // 调用函数，保留具有文本内容的列表项
  let resultArray = extractContentArray(json);
  // resultArray = resultArray.map((item) => {
  //   let obj = {};
  //   item.forEach((newItem) => {
  //     if (!obj[newItem.level]) {
  //       obj[newItem.level] = [newItem.text];
  //     } else {
  //       obj[newItem.level].push(newItem.text);
  //     }
  //   });

  //   return obj;
  // });
  console.log(resultArray);
  let arr: any = [];
  resultArray.forEach((item, index) => {
    let num = -1;
    arr[index] = [];
    arr[index][num] = [];
    for (let i = 0; i < item.length; i++) {
      // item[i].id = index + "-" + item[i].level + "-" + i;
      // console.log(i > 0 && item[i].level > item[i - 1].level);
      // if (item[i - 1] && !item[i - 1].children) {
      //   item[i - 1].children = [];
      // }
      // if (i > 0 && item[i].level < item[i - 1].level) {
      //   item[i - 1].children.push(item[i].id);
      // } else {
      //   item[i] = {
      //     ...item[i],
      //     children: [],
      //   };
      // }
      // if (item[i - 1] && !item[i - 1].children) {
      //   item[i - 1].children = [];
      // }
      if (i > 0 && item[i].level > item[i - 1].level) {
        arr[index][num].push(item[i].text);
      } else {
        num++;
        arr[index][num] = [item[i].text];
      }
    }
  });
  console.log(arr);
  console.log(
    "保留具有文本内容的列表项后的对象:",
    JSON.stringify(arr, null, 2)
  );
});
function extractContentArray(arr) {
  const contentArray: any = [];
  arr.forEach((item, index) => {
    let arr = [];
    contentArray.push(recursiveExtractContent(item, arr, 0, index));
  });
  return contentArray;
}
function recursiveExtractContent(node, arr, level, index) {
  if (!node) {
    return;
  }
  level++;
  if (node?.content) {
    if (node?.content.length !== 0) {
      node.content.forEach((item, newIndex) => {
        if (item.type === "text") {
          arr.push({ text: node?.content[0].text, level: index + "-" + newIndex+ "-" +level });
        }
        recursiveExtractContent(item, arr, level, index);
      });
    }
  }
  return arr;
}
const originalObject = {
  // ... (你提供的 JSON 对象)
};
</script>
<template></template>
<style scoped lang="scss"></style>
<style></style>
