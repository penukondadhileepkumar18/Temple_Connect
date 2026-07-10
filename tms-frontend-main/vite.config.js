// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')
  console.log("env.VITE_API_BASE_URL: ", env.VITE_API_BASE_URL)

  return {
     base: '/',
    plugins: [
      vue(),
      VitePWA({
      registerType: 'autoUpdate', // This helps to automatically update the service worker
      manifest: {
        name: 'TMS App',
        short_name: 'VuePWA',
        theme_color: '#42b883',
        // Other manifest options...
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        },
      }),

      tailwindcss(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    
    server: {    
      proxy: {
        '/api/v1': {        
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path
        },
        // 🆕 ADD THIS - Proxy /files requests to backend
        '/uploads': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              //console.error('❌ File proxy error:', err.message)
            })
            proxy.on('proxyReq', (proxyReq, req, res) => {
              //console.log('📁 File proxy request:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              //console.log('📁 File proxy response:', proxyRes.statusCode, req.url)
            })
          }
        }
      }
    },

    build: {
    // Other build options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
      },
    },
  },

  }
});
