<script setup lang="ts">
import api from "@/services/api";
import { ResultProps } from "@/interface/Common";
import { storeToRefs } from "pinia";
import appStore from "@/store";
import { setMessage } from "@/services/util/common";
import Icon from "@/components/common/Icon.vue";
import CEmpty from "@/components/common/cEmpty.vue";
import _ from "lodash";
import { useQuasar } from "quasar";
const $q = useQuasar();
const emits = defineEmits<{
  (e: "chooseTagName", name: string): void;
}>();
const { spaceKey, tagList, privateTeamKey } = storeToRefs(appStore.spaceStore);
const { teamList } = storeToRefs(appStore.teamStore);
const { setTag, getTag } = appStore.spaceStore;
const { getTeamList, setTeamList } = appStore.teamStore;
const searchTagList = ref<any>([]);
const teamSelect = ref<string[]>([]);
const originSelect = ref<string[]>([]);
const tagKey = ref<string>("");
const tagInput = ref<string>("");
const menuVisible = ref<boolean>(false);
const inputRef = ref<any>(null);
const editKey = ref<string>("");
const editInput = ref<string>("");
const tagInfo = computed(() => {
  if (tagList.value.length > 0) {
    return tagList.value[_.findIndex(tagList, { _key: tagKey.value })];
  }
});

onMounted(() => {
  // if (tagList.value.length > 0) {
  //   tagKey.value = tagList.value[0]._key;
  //   tagInput.value = tagList.value[0].name;
  // }
  searchTagList.value = [...tagList.value];
});
onUnmounted(() => {
  if (tagKey.value) {
    saveTag(teamSelect.value, tagKey.value);
  }
});
const createTag = async () => {
  let tagRes = (await api.request.post("tag", {
    teamKey: spaceKey.value,
    name: tagInput.value,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    setMessage("success", "创建分组成功");
    tagInput.value = "";
    // tagInput.value = tagRes.data.name;
    // tagKey.value = tagRes.data._key;
    let list = [...tagList.value];
    tagRes.data.projectNum = 0;
    list.unshift(tagRes.data);
    setTag(list);
    // menuVisible.value = false;
  }
};

const saveTag = async (arr, key, type?: string) => {
  if (!key) {
    setMessage("error", "请选择分组");
    return;
  }
  let tagRes = (await api.request.patch("project/tag/batch/new", {
    projectKeyArr: arr,
    tagKey: key,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    if (type) {
      setMessage("success", "设置分组成功");
    }
    getTeamList(spaceKey.value);
    let list = _.cloneDeep(teamList.value);
    list.forEach((item, index) => {
      let tagIndex = item.tagArr.indexOf(item._key);
      if (arr.indexOf(item._key) !== -1) {
        item.tagArr = [item.tagArr, ...key];
      } else if (tagIndex !== -1) {
        item.tagArr.splice(tagIndex, 1);
      }
    });
    setTeamList(list);
    let newList = [...tagList.value];
    let index = _.findIndex(newList, { _key: key });
    if (index !== -1) {
      newList[index].projectNum = arr.length;
      setTag(newList);
    }
  }
};
const editTag = async (item, index) => {
  if (!editInput.value) {
    setMessage("error", "请输入分组名称");
    return;
  }
  let tagRes = (await api.request.patch("tag", {
    tagKey: item._key,
    name: editInput.value,
  })) as ResultProps;
  if (tagRes.msg === "OK") {
    setMessage("success", "编辑分组成功");
    let list = [...tagList.value];
    list[index].name = editInput.value;
    setTag(list);
    editInput.value = "";
    editKey.value = "";
  }
};
const deleteTag = (item, index) => {
  $q.dialog({
    title: "删除标签",
    message: `是否删除标签${item.name}`,
    cancel: {
      color: "grey-5",
      flat: true,
    },
  })
    .onOk(async () => {
      let tagRes = (await api.request.delete("tag", {
        tagKey: item._key,
      })) as ResultProps;
      if (tagRes.msg === "OK") {
        setMessage("success", "删除分组成功");
        let list = [...tagList.value];
        list.splice(index, 1);
        console.log(index, list);
        setTag(list);
      }
    })
    .onCancel(() => {});
};
watch([tagInput, tagList], ([newInput, newList], [oldInput, oldList]) => {
  if (newList && newList.length > 0) {
    if (newInput && newInput !== oldInput) {
      searchTagList.value = newList.filter((item) =>
        item.name.includes(newInput),
      );
    } else {
      tagKey.value = "";
      searchTagList.value = [...newList];
    }
  } else {
    searchTagList.value = [];
  }
});
watch(menuVisible, (newVisible) => {
  console.log(newVisible);
  if (!newVisible) {
    editInput.value = "";
    editKey.value = "";
    searchTagList.value = [...tagList.value];
  }
});
watch(
  tagKey,
  (newKey, oldKey) => {
    if (oldKey) {
      saveTag(teamSelect.value, oldKey);
    }
    if (newKey) {
      let list: any = [];
      teamList.value.forEach((item) => {
        if (item.tagArr.indexOf(newKey) !== -1) {
          list.push(item._key);
        }
      });
      teamSelect.value = [...list];
    } else {
      teamSelect.value = [];
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="tag">
    <div class="tag-header">
      <q-input
        outlined
        v-model="tagInput"
        placeholder="请输入分组名称"
        dense
        style="width: calc(100% - 100px)"
        clearable
        ref="inputRef"
        @click="menuVisible = true"
      />
      <q-btn
        label="新建"
        :color="searchTagList.length === 0 ? 'primary' : 'grey-5'"
        style="width: 90px"
        :disable="searchTagList.length > 0"
        @click="createTag()"
      />
      <q-menu
        no-focus
        class="q-pa-sm"
        style="width: 470px; max-height: 60vh"
        v-model="menuVisible"
        auto-close
        no-parent-event
      >
        <q-list dense style="max-height: 40vh">
          <template v-if="searchTagList.length > 0">
            <q-item
              v-for="(item, index) in searchTagList"
              :key="`tag${index}`"
              clickable
              v-close-popup
              @click="
                tagKey = item._key;
                tagInput = item.name;
                menuVisible = false;
                emits('chooseTagName', item.name);
              "
            >
              <q-item-section>
                <div class="tag-menu">
                  <div
                    class="tag-menu-left"
                    :style="tagKey === item._key ? { color: '#07be51' } : {}"
                  >
                    <q-input
                      outlined
                      v-model="editInput"
                      placeholder="请输入分组名称"
                      dense
                      style="width: calc(100% - 100px)"
                      clearable
                      autofocus
                      class="full-width"
                      @click.stop=""
                      @keyup.enter.stop="editTag(item, index)"
                      v-if="editKey === item._key"
                    /><template v-else>
                      {{ item.name }} ( {{ item.projectNum }} )</template
                    >
                  </div>
                  <div class="tag-menu-right">
                    <Icon
                      name="bianji1"
                      @click.stop="
                        editKey = item._key;
                        editInput = item.name;
                      "
                      class="q-mr-sm"
                    />
                    <Icon
                      name="huishouzhan"
                      @click.stop="deleteTag(item, index)"
                    />
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </template>
          <div v-else style="width: 100%; height: 150px">
            <c-empty title="暂无分组" />
          </div>
        </q-list>
      </q-menu>
    </div>
    <div class="tag-container">
      <template v-if="teamList.length > 0 && tagKey">
        <template v-for="(item, index) in teamList" :key="`team${index}`">
          <div class="tag-item" v-if="item._key !== privateTeamKey">
            <q-checkbox
              v-model="teamSelect"
              :val="item._key"
              :label="item.name"
            />
          </div>
        </template>
      </template>
      <c-empty title="暂无群组" v-else />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tag {
  width: 100%;
  height: 100%;
  .tag-header {
    width: 100%;
    height: 50px;
  }
  .tag-header {
    width: 100%;
    height: 50px;
    margin-bottom: 10px;
    @include flex(space-between, center, null);
  }

  .tag-container {
    width: 100%;
    height: calc(80vh - 250px);
    @include scroll();
    .tag-item {
      width: 100%;
      height: 50px;
    }
  }
}
.tag-menu {
  width: 100%;
  height: 40px;
  @include flex(space-between, center, null);
  .tag-menu-left {
    flex: 1;
    height: 100%;
    @include flex(flex-start, center, null);
  }
  .tag-menu-right {
    width: 60px;
    height: 100%;
    display: none;
  }
  &:hover {
    .tag-menu-right {
      @include flex(flex-end, center, null);
    }
  }
}
</style>
