<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import _ from "lodash";
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import { uploadFile } from "@/services/util/file";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import List from "../list.vue";
import router from "@/router";
const { spaceKey, spaceInfo, spaceList } = storeToRefs(appStore.spaceStore);
const { setSpaceInfo, setSpaceList } = appStore.spaceStore;
const spaceName = ref<string>("");
const spaceLogo = ref<string>("");
const deleteVisible = ref<boolean>(false);
const deleteInput = ref<string>("");
const updateSpace = async () => {
  if (!spaceName.value) {
    setMessage("error", "请输入空间名称");
    return;
  }

  let userRes = (await api.request.patch("team", {
    teamKey: spaceKey.value,
    name: spaceName.value,
    logo: spaceLogo.value,
  })) as ResultProps;
  if (userRes.msg === "OK") {
    //@ts-ignore
    let newSpace = {
      ...spaceInfo.value,
      name: spaceName.value,
      logo: spaceLogo.value,
    };
    setMessage("success", "编辑空间成功");

    if (spaceInfo.value) {
      let list = {};
      setSpaceInfo(newSpace);
      let index = _.findIndex(spaceList.value, { _key: spaceInfo.value._key });
      if (index !== -1) {
        //@ts-ignore
        list[index] = {
          ...list[index],
          name: spaceName.value,
          logo: spaceLogo.value,
        };
        setSpaceList(list);
      }
    }
  }
};
const delateSpace = async () => {
  if (!deleteInput.value) {
    setMessage("error", "请输入空间名称");
    return;
  }
  if (deleteInput.value !== spaceName.value) {
    setMessage("error", "请输入正确的空间名称");
    return;
  }
  let spaceRes = (await api.request.delete("team", {
    teamKey: spaceKey.value,
  })) as ResultProps;
  if (spaceRes.msg === "OK") {
    setMessage("success", "删除空间成功");
    router.replace("/spaceList");
    deleteInput.value = "";
    deleteVisible.value = false;
  }
};
const uploadImage = (file, type) => {
  let mimeType = ["image/*"];
  if (file) {
    uploadFile(file, mimeType, async (url, name) => {
      spaceLogo.value = url;
    });
  }
};
watch(
  spaceInfo,
  (newInfo) => {
    if (newInfo) {
      spaceLogo.value = newInfo?.logo ? newInfo.logo : "";
      spaceName.value = newInfo?.name ? newInfo.name : "";
    }
  },
  { immediate: true },
);
watch(deleteVisible, (newVisible) => {
  if (!newVisible) {
    deleteInput.value = "";
  }
});
</script>
<template>
  <div class="setting">
    <cHeader title="空间设置">
      <template #button>
        <q-btn
          flat
          round
          icon="delete_outline"
          color="grey-5"
          @click="deleteVisible = true"
          class="q-mr-sm"
        />
        <q-btn label="保存" color="primary" @click="updateSpace" />
      </template>
    </cHeader>
    <div class="setting-container flex justify-start content-start">
      <div>空间图标</div>
      <div class="form-logo">
        <div class="upload-button upload-img-button logo-box">
          <img
            :src="spaceLogo"
            alt=""
            style="width: 100%; height: 100%"
            class="upload-cover"
            v-if="spaceLogo"
          />
          <q-icon name="add" style="color: #ebebeb" size="80px" v-else />
          <input
            type="file"
            accept="image/*"
            @change="
              //@ts-ignore
              uploadImage($event.target.files[0], 'logo')
            "
            class="upload-img"
          />
        </div>
      </div>
      <div>空间名称</div>
      <div class="form-name">
        <q-input
          style="width: 50%"
          outlined
          v-model="spaceName"
          :dense="true"
          :rules="[(val) => !!val || '空间名称必填']"
        />
      </div>
    </div>
    <q-dialog v-model="deleteVisible" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            删除工作空间,将删除其中所有页面和内容,且不可撤销
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-h8">输入工作空间名称确认删除</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="deleteInput"
            placeholder="请输入要删除的空间名称"
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn
            flat
            label="取消"
            color="grey-5"
            @click="deleteVisible = false"
          />
          <q-btn color="negative" label="确认" @click="delateSpace" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<style scoped lang="scss">
.setting {
  width: 100%;
  height: 100%;
  .setting-container {
    width: 100%;
    height: calc(100% - 75px);
    font-size: 14px;
    @include p-number(15px, 25px);
    .form-logo {
      width: 100%;
      height: 350px;
      @include flex(flex-start, center, null);
      .logo-box {
        width: 250px;
        height: 250px;
        //border-radius: 12px;
        overflow: hidden;
      }
    }
    .form-name {
      width: 100%;
      height: 50px;
      margin: 20px 0;
    }
  }
}
</style>
<style></style>
