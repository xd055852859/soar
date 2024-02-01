<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import router from "@/router";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import { useQuasar } from "quasar";
const $q = useQuasar();
const { spaceKey } = storeToRefs(appStore.spaceStore);
const { setToken, setLoginState } = appStore.authStore;

const mobile = ref<string>("");
const password = ref<string>("");
const isPwd = ref<boolean>(true);
const mobileArea = ref<string>("+86");
const login = async () => {
  if (!mobile.value) {
    setMessage("error", "请输入账号");
    return;
  }
  let reg = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/g;
  if (!reg.test(mobile.value)) {
    setMessage("error", "请输入正确的账号");
    return;
  }
  if (!password.value) {
    setMessage("error", "请输入密码");
    return;
  }
  if (!password.value.trim()) {
    setMessage("error", "密码不能为空或者仅有空格");
    return;
  }
  let loginRes = (await api.request.post("account/loginByPassword", {
    mobileArea: "+86",
    mobile: mobile.value,
    password: password.value,
    appHigh: 3,
  })) as ResultProps;
  if (loginRes.msg === "OK") {
    localStorage.clear();
    setMessage("success", "登录成功");
    setToken(loginRes.data.token);
    api.setToken(loginRes.data.token);
    if (spaceKey.value) {
      router.replace("/home");
    } else {
      router.replace("/spaceList");
    }
  }
};
</script>
<template>
  <div class="login-content">
    <q-input
      dense
      outlined
      v-model="mobile"
      label="账号"
      :rules="[(val) => !!val || '账号必填']"
      class="q-mb-sm"
    />

    <q-input
      dense
      outlined
      v-model="password"
      :type="isPwd ? 'password' : 'text'"
      label="密码"
      :rules="[(val) => !!val || '密码必填']"
      class="q-mb-sm"
    >
      <template v-slot:append>
        <q-icon
          :name="isPwd ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwd = !isPwd"
        />
      </template>
    </q-input>
    <div class="login-reset">
      <div @click="setLoginState('codeLogin')">验证码登录</div>
      <div @click="setLoginState('reset')">找回密码</div>
    </div>
    <div class="login-bottom-button">
      <q-btn
        class="login-button"
        color="primary"
        label="登录"
        @click="login()"
      />
      <div class="login-prompt" @click="setLoginState('register')">
        没有soar账户？<span>立即注册</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.login-content {
  .login-reset {
    width: 100%;
    height: 20px;
    text-align: right;
    line-height: 20px;
    margin: 6px 0px 20px 0px;
    font-size: 14px;

    @include flex(space-between, center, null);
    > div {
      cursor: pointer;
    }
  }
}
</style>
<style></style>
