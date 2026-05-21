// src/App.jsx
import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [view, setView] = useState("landing"); // 'landing' hoặc 'admin'

  return (
    <div>
      {view === "landing" ? (
        <LandingPage onNavigateToAdmin={() => setView("admin")} />
      ) : (
        <AdminPanel onNavigateToHome={() => setView("landing")} />
      )}
    </div>
  );
}

export default App;
