// src/App.jsx
import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Lấy thông tin đường dẫn và tham số URL hiện tại
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Nếu gõ "/admin" hoặc thêm "?admin=true" ở đuôi link web
    if (
      path === "/admin" ||
      path.endsWith("/admin.html") ||
      params.has("admin")
    ) {
      setIsAdminRoute(true);
    } else {
      setIsAdminRoute(false);
    }
  }, []);

  return <>{isAdminRoute ? <AdminPanel /> : <LandingPage />}</>;
}

export default App;
