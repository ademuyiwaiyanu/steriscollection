// import { defineConfig } from 'vite';

// export default defineConfig({
//   server: {
//     port: 4173,
//   },
// });

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  }
})