import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    // Nécessaire pour accéder au serveur de dev via un tunnel (localtunnel, ngrok)
    // ou depuis un autre appareil du réseau sous un autre nom d'hôte.
    // Sans ça, Vite renvoie une erreur 400 pour toute requête dont le nom
    // d'hôte n'est pas localhost.
    allowedHosts: true
  }
})