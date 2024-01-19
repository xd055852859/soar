<script setup lang="ts">
import router from "@/router";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Login from "./login.vue";
import Reset from "./reset.vue";
const { loginState, token } = storeToRefs(appStore.authStore);
const { deviceType } = storeToRefs(appStore.commonStore);
const showLogin = ref<boolean>(false);
onMounted(() => {
  console.log(token.value);
  if (token.value) {
    router.replace("/spaceList");
  }
});
</script>
<template>
  <div
    class="login"
    :style="{
      backgroundImage: `url('/common/${
        deviceType === 'pc' ? 'commonBg' : 'commonPhoneBg'
      }.png')`,
    }"
    :class="{ 'login-phone': deviceType === 'phone' }"
  >
    <div class="login-box" v-if="showLogin">
      <div class="login-logo">
        <img src="/common/titleLogo.svg" alt="" />
      </div>
      <div class="login-container">
        <Login v-if="loginState === 'login'" />
        <Reset v-else />
      </div>
      <div class="login-bottom">
        登录或注册代表你同意
        <a
          href="https://notecute.com/#/post?key=1518256288&view=digest&hideHead=1&publicShare=1&isWebview=1"
          target="_blank"
          >用户条款</a
        >
      </div>
    </div>
    <div class="title-box" v-else>
      <img class="title-box-logo" src="/common/titleLogo.svg" alt="" />

      <div class="title-box-title">知行合一 协作如飞</div>
      <div class="title-box-subtitle">
        Integration of knowledge and action,Cooperate like flying
      </div>

      <q-btn
        rounded
        color="primary"
        label="登录"
        class="title-box-button"
        @click="token ? $router.replace('/home') : (showLogin = true)"
      />
    </div>
  </div>
</template>
<style lang="scss">
.login {
  width: 100vw;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  @include flex(center, center, null);

  .login-box {
    width: 450px;
    height: 580px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0px 2px 14px 0px rgba(0, 0, 0, 0.11);
    padding-top: 44px;
    box-sizing: border-box;
    position: relative;
    z-index: 1;

    .login-logo {
      width: 100%;
      height: 58px;
      margin-bottom: 45px;
      @include flex(center, center, null);

      img {
        width: 40%;
      }
    }

    .login-container {
      width: 100%;
      height: calc(100% - 127px);
      padding: 0px 34px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;

      // .login-input {
      //   width: 100%;
      //   height: 45px;
      //   margin-bottom: 35px;
      //   border-radius: 4px;
      //   color: #999999;
      //   @include flex(space-between, center, null);
      // }

      .login-bottom-button {
        width: 100%;
        padding: 0px 34px;
        box-sizing: border-box;
        position: absolute;
        z-index: 2;
        left: 0px;
        bottom: 60px;

        .login-button {
          width: 100%;
          height: 48px;
          border-radius: 4px;
        }

        .login-prompt {
          width: 100%;
          height: 20px;
          font-size: 16px;
          text-align: center;
          cursor: pointer;
          line-height: 20px;
          margin-top: 15px;
        }
      }
    }

    .login-bottom {
      width: 100%;
      height: 47px;
      border-radius: 0px 0px 12px 12px;
      line-height: 47px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      position: absolute;
      z-index: 2;
      left: 0px;
      bottom: 0px;
    }
  }

  .title-box {
    width: 100vw;
    height: 100vh;
    align-content: center;
    @include flex(center, center, wrap);

    .title-box-logo {
      width: 50%;
      margin-bottom: 50px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .title-box-title {
      width: 100%;
      height: 65px;
      font-size: 60px;
      font-weight: 600;
      color: #11151d;
      line-height: 65px;
      margin-bottom: 10px;
      text-align: center;
    }

    .title-box-subtitle {
      width: 100%;
      height: 30px;
      font-size: 20px;
      color: #b3b3b3;
      line-height: 30px;
      text-align: center;
      font-family: Arial, Arial-Regular;
    }

    .title-box-button {
      width: 180px;
      height: 50px;
      position: fixed;
      z-index: 2;
      top: 30px;
      right: 30px;
    }
  }
}
.login-phone {
  .title-box {
    .title-login-logo {
      width: 60%;
    }
    .title-header {
      top: 30px;
      padding: 0px 27px;
    }
  }
}
</style>
<style></style>
