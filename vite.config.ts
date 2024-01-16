import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import veauryVitePlugins from "veaury/vite/index.js";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      // vue({
      //   template: { transformAssetUrls },
      // }),
      veauryVitePlugins({
        type: "vue",
        vueOptions: {
          template: { transformAssetUrls },
        },
      }),
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          // "react",
          // "react-router",
          // "react-router-dom",
        ], // 自动导入vue和vue-router相关函数
        dts: "src/auto-import.d.ts", // 生成 `auto-import.d.ts` 全局声明
      }),
      quasar({
        sassVariables: "src/quasar-variables.sass",
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
        sass: {
          javascriptEnabled: true,
        },
        scss: {
          additionalData: "@import 'src/styles/mixin/mixin.scss';",
          javascriptEnabled: true,
        },
         preprocessorOptions: {
      },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"), // 设置 `@` 指向 `src` 目录
      },
    },
    base: env.VITE_BASE,
    server: {
      host: "0.0.0.0",
      port: 8001, // 设置服务启动端口号
      open: true, // 设置服务启动时是否自动打开浏览器
      cors: true, // 允许跨域

      // 设置代理，根据我们项目实际情况配置
    },
  };
});
