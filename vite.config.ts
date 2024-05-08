import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.npm_package_config_vite_app_server_port), // set to PORT 8080 in package.json config
    open: true, // open the browser automatically
    cors: true, // enable CORS

    // set up proxy to redirect API calls
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.npm_package_config_proxy_server_port}`, // set to PORT 3000 in package.json config & passed thru DEV script
        changeOrigin: true,
      },
    },
  },
});
