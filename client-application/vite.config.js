export default {
  server: {
    proxy: {
      '/events': {
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/games': {
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: process.env.API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}

