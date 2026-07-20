import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { AuthProvider } from "./features/auth/AuthContext";
import "./styles/theme.css";
import "./styles.css";
import "./styles/auth.css";
import "./styles/user-management.css";
import "./styles/sidebar-balance.css";

ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
