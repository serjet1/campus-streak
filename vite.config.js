export default {
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: ['.nodeops.app', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser'
  }
};