<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import api from "@/services/api";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { teamKey } = storeToRefs(appStore.teamStore);
const props = defineProps<{
  mateKey: string;
}>();
const page = ref<number>(1);
const total = ref<number>(0);
const days = ref<number>(7);
onMounted(() => {
  getMateDetail();
});
const getMateDetail = async () => {
  let detailRes = (await api.request.get("teamMate/card", {
    teamKey: spaceKey.value,
    projectKey: teamKey.value,
    mateKey: props.mateKey,
    page: page.value,
    limit: 30,
  })) as ResultProps;
  if (detailRes.msg === "OK") {
  }
};
</script>
<template>
  <div class="mateDetail">
    <div class="mateDetail-left q-mr-lg">
      <q-card flat bordered class="space-item">
        <!-- <q-card-section horizontal>
          <q-img
            class="col-2"
            :src="item.logo ? item.logo : '/common/defaultGroup.png'"
          />
          <q-card-section class="col-10">
            <div class="space-content">
              <div class="space-title">
                <div class="top">{{ item.name }}</div>
                <div class="bottom">
                  <div>
                    {{
                      item.role === 0
                        ? "超管"
                        : ROLE_OPTIONS[item.role - 1]?.label
                    }}
                  </div>
                </div>
              </div>
              <q-icon name="keyboard_arrow_right" size="28px" />
            </div>
          </q-card-section>
        </q-card-section> -->
      </q-card>
    </div>
    <div class="mateDetail-right">
      <div></div>
      <div></div>
    </div>
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
  }
  .mateDetail-right {
    flex: 1;
    height: 100%;
    width: 0px;
  }
}
</style>
<style></style>
