<script setup lang="ts">
import { ResultProps } from "@/interface/Common";
import router from "@/router";
import api from "@/services/api";
import { setMessage } from "@/services/util/common";
import appStore from "@/store";
import { storeToRefs } from "pinia";
const { loginState } = storeToRefs(appStore.authStore);
const { setToken, setLoginState } = appStore.authStore;
const mobile = ref<string>("");
const password = ref<string>("");
const code = ref<string>("");
const codeState = ref<boolean>(false);
const codeTime = ref<number>(60);
const isPwd = ref<boolean>(true);
const getCode = async () => {
  const codeRes = (await api.request.post("account/vertifyCode", {
    mobileArea: "+86",
    mobile: mobile.value,
    source:
      loginState.value === "register"
        ? 1
        : loginState.value === "reset"
        ? 3
        : 2,
  })) as ResultProps;
  if (codeRes.msg === "OK") {
    setMessage("success", "发送成功");
    codeState.value = true;
    let timer = setInterval(() => {
      if (codeTime.value === 0) {
        codeState.value = false;
        clearInterval(timer);
      }
      codeTime.value = codeTime.value - 1;
    }, 1000);
  }
};
const changeState = async () => {
  let reg = /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/g;
  if (!reg.test(mobile.value)) {
    setMessage("error", "请输入正确的账号");
    return;
  }
  if (loginState.value !== "codeLogin") {
    if (!password.value) {
      setMessage("error", "请输入密码");
      return;
    }
    if (!password.value.trim()) {
      setMessage("error", "密码不能为空或者仅有空格");
      return;
    }
  }
  if (loginState.value === "register") {
    const registerRes = (await api.request.post("account", {
      mobileArea: "+86",
      mobile: mobile.value,
      password: password.value,
      code: code.value,
    })) as ResultProps;
    if (registerRes.msg === "OK") {
      setMessage("success", "注册成功");
      setToken(registerRes.data.token);
      api.setToken(registerRes.data.token);
      router.replace("/spaceList");
    }
  } else if (loginState.value === "reset") {
    const registerRes = (await api.request.patch("account/pwdSet", {
      mobileArea: "+86",
      mobile: mobile.value,
      password: password.value,
      code: code.value,
    })) as ResultProps;
    if (registerRes.msg === "OK") {
      setMessage("success", "重置密码成功");
      setLoginState("login");
    }
  } else if (loginState.value === "codeLogin") {
    const registerRes = (await api.request.get("account/getTempToken", {
      mobileArea: "+86",
      mobile: mobile.value,
      code: code.value,
    })) as ResultProps;
    if (registerRes.msg === "OK") {
      localStorage.clear();
      setMessage("success", "登录成功");
      setToken(registerRes.data.token);
      api.setToken(registerRes.data.token);
      router.replace("/spaceList");
    }
  }
};
</script>
<template>
  <div class="reset-content">
    <q-input
      outlined
      dense
      v-model="mobile"
      label="手机号码"
      :rules="[(val) => !!val || '手机号码必填']"
      class="q-mb-sm"
    />

    <q-input
      outlined
      dense
      v-model="password"
      :type="isPwd ? 'password' : 'text'"
      label="密码"
      v-if="loginState !== 'codeLogin'"
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
    <div class="reset-code">
      <q-input
        dense
        outlined
        v-model="code"
        label="验证码"
        :style="{ width: 'calc(100% - 90px)', marginBottom: '0px' }"
      />

      <q-btn
        color="primary"
        dense
        class="reset-button"
        @click="getCode()"
        :disabled="codeState"
        :style="{ marginLeft: '5px' }"
        :label="codeState ? `剩余${codeTime}秒` : '获取验证码'"
      />
    </div>
    <div class="login-bottom-button">
      <q-btn
        class="login-button"
        color="primary"
        :label="
          loginState === 'register'
            ? '注册账号'
            : loginState === 'reset'
            ? '重置密码'
            : '验证码登录'
        "
        @click="changeState()"
      />

      <div class="login-prompt dp-space-center">
        <div @click="setLoginState('login')">有账号? 去<span>登录</span></div>
        <div
          @click="setLoginState('register')"
          v-if="loginState !== 'register'"
        >
          <span>立即注册</span>
        </div>
      </div>
      <!-- <div class="login-prompt" v-else>
        没有场景英语账户？<span>立即注册</span>
      </div> -->
    </div>
  </div>
</template>
<style scoped lang="scss">
.reset-code {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  background-color: transparent;
  margin-bottom: 35px;
  @include flex(space-between, center, null);

  .reset-button {
    width: 120px;
    height: 40px;
    font-size: 14px;
    outline: none;
    overflow: hidden;
    flex-shrink: 0;
    margin-left: 10px;
    cursor: pointer;
    @include flex(center, center, null);
  }
}
</style>
<style></style>
