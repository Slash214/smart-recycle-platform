import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // 生产环境构建优化
    target: 'es2015',
    minify: 'esbuild',
    cssMinify: true,
    // 启用源码映射（生产环境可选）
    sourcemap: false,
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'refine-vendor': ['@refinedev/core', '@refinedev/antd', '@refinedev/react-router'],
          'editor-vendor': ['@tinymce/tinymce-react', 'tinymce'],
        },
      },
    },
    // 块大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
  },
});
