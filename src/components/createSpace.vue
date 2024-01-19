<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { spaceList } = storeToRefs(appStore.spaceStore);
const { setSpaceKey, setSpaceList } = appStore.spaceStore;
const emits = defineEmits<{
  (e: "close"): void;
}>();
const name = ref<string>("");
const logo = ref<string>("");
const scale = ref<string>("1-5");
const industry = ref("软件和信息技术");
const scaleArray = ["1-5", "6-15", "15-50", "51-100", "101-300", "300+"];
const industryArray = [
  {
    key: "software_it",
    value: "软件和信息技术",
  },
  {
    key: "online_education",
    value: "在线教育/培训",
  },
  {
    key: "public_education",
    value: "公立教育/学校",
  },
  {
    key: "innovation_manufacturing",
    value: "创新/高端制造",
  },
  {
    key: "traditional_manufacturing",
    value: "传统制造业",
  },
  {
    key: "finance",
    value: "金融业",
  },
  {
    key: "real_estate_construction",
    value: "房地产及建筑业",
  },
  {
    key: "agriculture_forestry",
    value: "农林牧渔业",
  },
  {
    key: "otheo_industries",
    value: "其他行业",
  },
];
const createSpace = async () => {
  if (!name.value) {
    setMessage("error", "请输入名称");
    return;
  }
  let spaceRes = (await api.request.post("team", {
    logo: "",
    name: name.value,
    scale: scale.value,
    industry: industry.value,
  })) as ResultProps;
  if (spaceRes.msg === "OK") {
    setMessage("success", "创建空间成功");
    setSpaceKey(spaceRes.data._key);
    setSpaceList([...spaceList.value, spaceRes.data]);
    emits("close");
  }
};
</script>
<template>
  <div>创建新的团队空间</div>
  <div class="q-field--with-bottom">
    管理任务、文档团队协同，成为您的在线工作室
  </div>
  <q-input
    filled
    v-model="name"
    label="您的企业/团队名称"
    :rules="[(val) => !!val || '名称必填']"
  />
  <q-select
    outlined
    v-model="scale"
    :options="scaleArray"
    label="团队人员规模"
    class="q-field--with-bottom"
  />
  <q-select
    outlined
    v-model="industry"
    :options="industryArray"
    :option-value="(opt) => opt.key"
    :option-label="(opt) => opt.value"
    label="团队所在行业"
    class="q-field--with-bottom"
    emit-value
    map-options
  />

  <q-btn
    class="login-button full-width"
    color="primary"
    label="完成创建"
    @click="createSpace()"
  />
</template>
<style scoped lang="scss"></style>
<style></style>
