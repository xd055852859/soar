// vite.config.ts
import { defineConfig, loadEnv } from "file:///Users/jyoketsu/Documents/workspace/working/soar/node_modules/vite/dist/node/index.js";
import AutoImport from "file:///Users/jyoketsu/Documents/workspace/working/soar/node_modules/unplugin-auto-import/dist/vite.js";
import veauryVitePlugins from "file:///Users/jyoketsu/Documents/workspace/working/soar/node_modules/veaury/vite/index.js";
import { quasar, transformAssetUrls } from "file:///Users/jyoketsu/Documents/workspace/working/soar/node_modules/@quasar/vite-plugin/src/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/jyoketsu/Documents/workspace/working/soar";
var vite_config_default = defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      // vue({
      //   template: { transformAssetUrls },
      // }),
      veauryVitePlugins({
        type: "vue",
        vueOptions: {
          template: { transformAssetUrls }
        }
      }),
      AutoImport({
        imports: [
          "vue",
          "vue-router"
          // "react",
          // "react-router",
          // "react-router-dom",
        ],
        // 自动导入vue和vue-router相关函数
        dts: "src/auto-import.d.ts"
        // 生成 `auto-import.d.ts` 全局声明
      }),
      quasar({
        sassVariables: "src/quasar-variables.sass"
      })
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        },
        sass: {
          javascriptEnabled: true
        },
        scss: {
          additionalData: "@import 'src/styles/mixin/mixin.scss';",
          javascriptEnabled: true
        },
        preprocessorOptions: {}
      }
    },
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "src")
        // 设置 `@` 指向 `src` 目录
      }
    },
    base: env.VITE_BASE,
    server: {
      host: "0.0.0.0",
      port: 8001,
      // 设置服务启动端口号
      open: true,
      // 设置服务启动时是否自动打开浏览器
      cors: true,
      // 允许跨域
      hmr: true
      // 设置代理，根据我们项目实际情况配置
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvanlva2V0c3UvRG9jdW1lbnRzL3dvcmtzcGFjZS93b3JraW5nL3NvYXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qeW9rZXRzdS9Eb2N1bWVudHMvd29ya3NwYWNlL3dvcmtpbmcvc29hci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvanlva2V0c3UvRG9jdW1lbnRzL3dvcmtzcGFjZS93b3JraW5nL3NvYXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IHZlYXVyeVZpdGVQbHVnaW5zIGZyb20gXCJ2ZWF1cnkvdml0ZS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgcXVhc2FyLCB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tIFwiQHF1YXNhci92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUsIGNvbW1hbmQgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpO1xuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIC8vIHZ1ZSh7XG4gICAgICAvLyAgIHRlbXBsYXRlOiB7IHRyYW5zZm9ybUFzc2V0VXJscyB9LFxuICAgICAgLy8gfSksXG4gICAgICB2ZWF1cnlWaXRlUGx1Z2lucyh7XG4gICAgICAgIHR5cGU6IFwidnVlXCIsXG4gICAgICAgIHZ1ZU9wdGlvbnM6IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogeyB0cmFuc2Zvcm1Bc3NldFVybHMgfSxcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgIGltcG9ydHM6IFtcbiAgICAgICAgICBcInZ1ZVwiLFxuICAgICAgICAgIFwidnVlLXJvdXRlclwiLFxuICAgICAgICAgIC8vIFwicmVhY3RcIixcbiAgICAgICAgICAvLyBcInJlYWN0LXJvdXRlclwiLFxuICAgICAgICAgIC8vIFwicmVhY3Qtcm91dGVyLWRvbVwiLFxuICAgICAgICBdLCAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjV2dWVcdTU0OEN2dWUtcm91dGVyXHU3NkY4XHU1MTczXHU1MUZEXHU2NTcwXG4gICAgICAgIGR0czogXCJzcmMvYXV0by1pbXBvcnQuZC50c1wiLCAvLyBcdTc1MUZcdTYyMTAgYGF1dG8taW1wb3J0LmQudHNgIFx1NTE2OFx1NUM0MFx1NThGMFx1NjYwRVxuICAgICAgfSksXG4gICAgICBxdWFzYXIoe1xuICAgICAgICBzYXNzVmFyaWFibGVzOiBcInNyYy9xdWFzYXItdmFyaWFibGVzLnNhc3NcIixcbiAgICAgIH0pLFxuICAgIF0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgc2Fzczoge1xuICAgICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IFwiQGltcG9ydCAnc3JjL3N0eWxlcy9taXhpbi9taXhpbi5zY3NzJztcIixcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge30sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgXCJAXCI6IHJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKSwgLy8gXHU4QkJFXHU3RjZFIGBAYCBcdTYzMDdcdTU0MTEgYHNyY2AgXHU3NkVFXHU1RjU1XG4gICAgICB9LFxuICAgIH0sXG4gICAgYmFzZTogZW52LlZJVEVfQkFTRSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxuICAgICAgcG9ydDogODAwMSwgLy8gXHU4QkJFXHU3RjZFXHU2NzBEXHU1MkExXHU1NDJGXHU1MkE4XHU3QUVGXHU1M0UzXHU1M0Y3XG4gICAgICBvcGVuOiB0cnVlLCAvLyBcdThCQkVcdTdGNkVcdTY3MERcdTUyQTFcdTU0MkZcdTUyQThcdTY1RjZcdTY2MkZcdTU0MjZcdTgxRUFcdTUyQThcdTYyNTNcdTVGMDBcdTZENEZcdTg5QzhcdTU2NjhcbiAgICAgIGNvcnM6IHRydWUsIC8vIFx1NTE0MVx1OEJCOFx1OERFOFx1NTdERlxuICAgICAgaG1yOiB0cnVlLFxuICAgICAgLy8gXHU4QkJFXHU3RjZFXHU0RUUzXHU3NDA2XHVGRjBDXHU2ODM5XHU2MzZFXHU2MjExXHU0RUVDXHU5ODc5XHU3NkVFXHU1QjlFXHU5NjQ1XHU2MEM1XHU1MUI1XHU5MTREXHU3RjZFXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVSxTQUFTLGNBQWMsZUFBZTtBQUd4VyxPQUFPLGdCQUFnQjtBQUN2QixPQUFPLHVCQUF1QjtBQUM5QixTQUFTLFFBQVEsMEJBQTBCO0FBQzNDLFNBQVMsZUFBZTtBQU54QixJQUFNLG1DQUFtQztBQVF6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLE1BQU0sUUFBUSxNQUFNO0FBQ2pELFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLENBQUM7QUFDdkMsU0FBTztBQUFBLElBQ0wsU0FBUztBQUFBO0FBQUE7QUFBQTtBQUFBLE1BSVAsa0JBQWtCO0FBQUEsUUFDaEIsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFVBQ1YsVUFBVSxFQUFFLG1CQUFtQjtBQUFBLFFBQ2pDO0FBQUEsTUFDRixDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUlGO0FBQUE7QUFBQSxRQUNBLEtBQUs7QUFBQTtBQUFBLE1BQ1AsQ0FBQztBQUFBLE1BQ0QsT0FBTztBQUFBLFFBQ0wsZUFBZTtBQUFBLE1BQ2pCLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxxQkFBcUI7QUFBQSxRQUNuQixNQUFNO0FBQUEsVUFDSixtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLFFBQ0EsTUFBTTtBQUFBLFVBQ0osbUJBQW1CO0FBQUEsUUFDckI7QUFBQSxRQUNBLE1BQU07QUFBQSxVQUNKLGdCQUFnQjtBQUFBLFVBQ2hCLG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsUUFDQSxxQkFBcUIsQ0FBQztBQUFBLE1BQ3hCO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQTtBQUFBLE1BQy9CO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTSxJQUFJO0FBQUEsSUFDVixRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUE7QUFBQSxNQUNOLE1BQU07QUFBQTtBQUFBLE1BQ04sTUFBTTtBQUFBO0FBQUEsTUFDTixLQUFLO0FBQUE7QUFBQSxJQUVQO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
