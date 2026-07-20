import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
} from "react-router-dom";

import {
  App,
} from "./App";
import {
  AuthProvider,
} from "./features/auth/AuthContext";
import "./styles/theme.css";
import "./styles.css";
import "./styles/auth.css";
import "./styles/user-management.css";
import "./styles/sidebar-balance.css";
import "./styles/role-permission.css";
import "./styles/section-card-actions.css";
import "./styles/audit-log.css";
import "./styles/user-assignment.css";
import "./styles/form-components.css";
import "./styles/premium-date-picker.css";
import "./styles/audit-filter-layout.css";

ReactDOM.createRoot(
  document.getElementById(
    "root",
  )!,
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
