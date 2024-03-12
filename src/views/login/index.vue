<script setup lang="ts">
import router from "@/router";
import appStore from "@/store";
import { storeToRefs } from "pinia";
import Login from "./login.vue";
import Reset from "./reset.vue";
const { loginState, token } = storeToRefs(appStore.authStore);
const { deviceType } = storeToRefs(appStore.commonStore);
const { spaceKey } = storeToRefs(appStore.spaceStore);
const showLogin = ref<boolean>(false);
onMounted(() => {
  if (token.value) {
    if (spaceKey.value) {
      router.replace("/home");
    } else {
      router.replace("/spaceList");
    }
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
          href="https://notecute.com/#/post?key=1532911725&view=grid&hideHead=1&publicShare=1&isWebview=1"
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
      <div class="title-box-footer">
        <span
          className="title-box-ICPLicensing"
          @click="
            () => {
              //@ts-ignore
              window.open('http://beian.miit.gov.cn/');
            }
          "
        >
          Copyright © 2024 江苏脑际互联有限公司 Soar.苏ICP备2022036554号-3
        </span>
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
    width: 420px;
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
        width: 50%;
      }
    }

    .login-container {
      width: 100%;
      height: calc(100% - 140px);
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
          font-size: 14px;
          text-align: center;
          cursor: pointer;
          line-height: 20px;
          margin-top: 15px;
          span {
            color: $commonColor;
          }
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
      width: 44%;
      height: 22%;
      // margin-top: 319px;
      margin-bottom: 5%;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .title-box-title {
      width: 100%;
      height: 40px;
      font-size: 46px;
      font-weight: 600;
      color: #313131;
      line-height: 40px;
      margin-bottom: 14px;
      text-align: center;
    }

    .title-box-subtitle {
      width: 100%;
      height: 15px;
      font-size: 14px;
      font-family: Arial, Arial-Regular;
      font-weight: Regular;
      color: #b3b3b3;
      line-height: 15px;
      letter-spacing: 0.61px;
      text-align: center;
      margin-bottom: 3%;
    }
    .title-box-footer {
      width: 100%;
      height: 28px;
      line-height: 28px;
      position: fixed;
      left: 0px;
      bottom: 7%;
      text-align: center;
      .title-box-ICPLicensing {
        height: 28px;
        font-size: 12px;
        font-family: PingFang SC, PingFang SC-Regular;
        font-weight: Regular;
        color: #969696;
        line-height: 28px;
        letter-spacing: 0.86px;
        cursor: pointer;
      }
    }
    .title-box-button {
      width: 13%;
      height: 8%;
      position: fixed;
      z-index: 2;
      top: 8%;
      right: 5%;
      border-radius: 44px;
      font-size: 20px;
      font-family: PingFang SC, PingFang SC-Medium;
      font-weight: Medium;
      text-align: center;
      color: #ffffff;
      line-height: 40px;
      letter-spacing: 4.97px;
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
