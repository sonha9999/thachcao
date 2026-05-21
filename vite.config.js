import { defineConfig } from "vite";
import react from "@tailwindcss/vite"; // Hoặc giữ nguyên @vitejs/plugin-react tùy bản cài của bạn
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/thachcao/", // Thêm chính xác dòng này để định tuyến đúng trên GitHub Pages
});
