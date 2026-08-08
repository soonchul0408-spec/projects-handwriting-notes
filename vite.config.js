import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { localAnalyzeApiPlugin } from './server/viteApiPlugin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const serverEnvironment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      localAnalyzeApiPlugin({
        apiKey: serverEnvironment.OPENAI_API_KEY,
        model: serverEnvironment.OPENAI_MODEL,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
